import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { carregarIndexDist, injetarCssDoIndexDist, lerIndexDist, raizDoProjeto, regrasDe } from "./dist.js";
import { lerTokensDoRoot, oklchParaSrgbLinear } from "./cores.js";
import { montarPaginaDoDist, simularIntersectionObserver } from "./pagina.js";
import { iniciarBrilho } from "../src/scripts/brilho.js";
import {
  ATRASO_MAXIMO,
  LISTAS,
  QUADROS_ENTRADA,
  QUADROS_TITULO,
  atrasoNaLista,
  curvaCubica,
  iniciarRevelar,
  tempoEmSegundos,
} from "../src/scripts/revelar.js";

/*
 * Spec 7 · sistema de movimento. CA-7.1 e a parte de JS de CA-7.4 rodam src/scripts/revelar.js
 * sobre o HTML do dist, com o inView real do Motion em cima do IntersectionObserver simulado e o
 * animate trocado por um registro das chamadas (o jsdom não tem Web Animations API). CA-7.2 roda o
 * src/main.js de verdade, sem IntersectionObserver (o jsdom não tem), e confere no CSS do build que
 * nada esconde conteúdo sem a classe js. CA-7.3 roda src/scripts/brilho.js com matchMedia e
 * requestAnimationFrame simulados. CA-7.4 e CA-7.5 leem o CSS (do build ou de src/styles/) e as
 * chamadas de animate como texto; CA-7.6 lê o package.json e os import de src/.
 */

const pastaEstilos = path.join(raizDoProjeto, "src", "styles");
const pastaFontes = path.join(raizDoProjeto, "src");
const REDUZIDO = "(prefers-reduced-motion: reduce)";
const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";
const SECOES = ["sobre", "experiencia", "habilidades", "projetos", "contato"];

/**
 * matchMedia falso: cada consulta responde conforme o mapa (consulta ausente = false). O objeto de
 * uma consulta é sempre o mesmo, e mudarMidia dispara o `change` dele como o navegador faria.
 */
const consultasSimuladas = new Map();
function simularMidia(respostas) {
  consultasSimuladas.clear();
  window.matchMedia = (consulta) => {
    if (!consultasSimuladas.has(consulta)) {
      const ouvintes = new Set();
      consultasSimuladas.set(consulta, {
        matches: Boolean(respostas[consulta]),
        media: consulta,
        ouvintes,
        addEventListener(tipo, ouvinte, opcoes) {
          if (tipo !== "change") return;
          ouvintes.add(ouvinte);
          opcoes?.signal?.addEventListener("abort", () => ouvintes.delete(ouvinte));
        },
        removeEventListener(tipo, ouvinte) {
          ouvintes.delete(ouvinte);
        },
      });
    }
    return consultasSimuladas.get(consulta);
  };
}

function mudarMidia(consulta, matches) {
  const alvo = window.matchMedia(consulta);
  alvo.matches = matches;
  [...alvo.ouvintes].forEach((ouvinte) => ouvinte({ matches, media: consulta }));
}

const matchMediaOriginal = window.matchMedia;

const semComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const lerCssDeEstilos = () =>
  readdirSync(pastaEstilos)
    .filter((arquivo) => arquivo.endsWith(".css"))
    .map((arquivo) => ({ arquivo, css: semComentarios(readFileSync(path.join(pastaEstilos, arquivo), "utf8")) }));
const tokens = () => lerTokensDoRoot(readFileSync(path.join(pastaEstilos, "tokens.css"), "utf8"));

/** Arquivos .js de src/, com o caminho relativo à raiz do projeto. */
function arquivosJs() {
  return readdirSync(pastaFontes, { recursive: true })
    .filter((arquivo) => arquivo.endsWith(".js"))
    .map((arquivo) => {
      const relativo = path.posix.join("src", arquivo.split(path.sep).join("/"));
      return { relativo, texto: readFileSync(path.join(raizDoProjeto, relativo), "utf8") };
    });
}

/** Divide por vírgula fora de parênteses (cubic-bezier(a, b, c, d) fica inteiro). */
function dividirNoTopo(valor, separador = ",") {
  const partes = [];
  let nivel = 0;
  let atual = "";
  for (const caractere of valor) {
    if (caractere === "(") nivel++;
    if (caractere === ")") nivel--;
    const separa = separador === " " ? /\s/.test(caractere) : caractere === separador;
    if (separa && nivel === 0) {
      if (atual.trim()) partes.push(atual.trim());
      atual = "";
    } else atual += caractere;
  }
  if (atual.trim()) partes.push(atual.trim());
  return partes;
}

/** Converte um tempo literal ou var(--duracao-*) de tokens.css em ms; null se não for tempo. */
function emMs(valor, declarados) {
  const token = /^var\((--duracao-[\w-]+)\)$/.exec(valor);
  const literal = token ? declarados[token[1]] : valor;
  const achado = /^(\d*\.?\d+)(ms|s)$/.exec(literal ?? "");
  if (!achado) return null;
  return achado[2] === "s" ? Number(achado[1]) * 1000 : Number(achado[1]);
}

const CURVAS = new Set(["ease", "linear", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]);

/** Cada transição de um valor de `transition`: { propriedade, duracao (texto ou null) }. */
function transicoesDe(valor) {
  return dividirNoTopo(valor.replace(/!important/, "")).map((parte) => {
    const termos = dividirNoTopo(parte, " ");
    const ehTempo = (termo) => /^\d*\.?\d+m?s$/.test(termo) || /^var\(--duracao-/.test(termo);
    const propriedade = termos.find((termo) => !ehTempo(termo) && !CURVAS.has(termo) && !/^[\w-]+\(/.test(termo));
    return { propriedade: propriedade ?? "all", duracao: termos.find(ehTempo) ?? null };
  });
}

/** Regras de estilo (CSSOM do build) com as medias que as envolvem. */
function regrasComMedia(regras, medias = []) {
  return [...regras].flatMap((regra) => {
    if (regra.cssRules && !regra.selectorText) {
      const condicao = regra.media?.mediaText ?? regra.conditionText ?? "";
      return regrasComMedia(regra.cssRules, [...medias, condicao]);
    }
    return regra.selectorText ? [{ regra, medias }] : [];
  });
}

const sobReduzido = ({ medias }) => medias.some((media) => /prefers-reduced-motion:\s*reduce/.test(media));

/**
 * Regras de estilo do CSS do build, em qualquer media, que escondem o elemento como a revelação faz:
 * opacity 0, visibility hidden ou desfoque. Deslocamento sozinho não esconde (o skip-link fica fora
 * da tela até receber foco, por desenho).
 */
function regrasQueEscondem(folha) {
  return regrasComMedia(folha.cssRules)
    .filter(({ regra }) => {
      const estilo = regra.style;
      return (
        estilo.getPropertyValue("opacity").trim() === "0" ||
        estilo.getPropertyValue("visibility").trim() === "hidden" ||
        /blur\(/.test(estilo.getPropertyValue("filter"))
      );
    })
    .map(({ regra }) => regra.selectorText);
}

/**
 * Elementos de conteúdo (não pseudo-elementos) que alguma dessas regras alcança no documento. Os
 * seletores de estado (:hover, :focus) não casam em querySelectorAll, como num documento parado.
 */
function conteudoEscondido(documento, seletores) {
  return seletores.flatMap((seletor) =>
    dividirNoTopo(seletor)
      .filter((parte) => !/::?(before|after)\b/.test(parte))
      .flatMap((parte) => [...documento.querySelectorAll(parte)].map((el) => `${parte} → ${el.tagName.toLowerCase()}.${el.className}`)),
  );
}

/**
 * animate falso: registra cada chamada e devolve uma animação já terminada que, como o Motion, grava
 * o último quadro como estilo inline antes de resolver.
 */
function registrarAnimacoes() {
  const chamadas = [];
  const animar = (el, quadros, opcoes) => {
    chamadas.push({ el, quadros, opcoes });
    const finished = Promise.resolve().then(() => {
      Object.entries(quadros).forEach(([propriedade, valores]) => el.style.setProperty(propriedade, String(valores.at(-1))));
    });
    return { finished };
  };
  return { chamadas, animar };
}

/** Espera as promessas de fim de animação já resolvidas rodarem os callbacks. */
const esvaziarMicrotarefas = () => new Promise((resolver) => setTimeout(resolver, 0));

describe("CA-7.1 · seções e listas entram ao rolar, em sequência (src/scripts/revelar.js)", () => {
  let io;
  let registro;
  let parar;

  beforeEach(() => {
    simularMidia({});
    montarPaginaDoDist();
    io = simularIntersectionObserver();
    registro = registrarAnimacoes();
    parar = iniciarRevelar(document, { animar: registro.animar });
  });

  afterEach(() => {
    parar?.();
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
  });

  const entrarNaVista = (el) => io.queObserva(el).disparar(el, true);
  const chamadaDe = (el) => registro.chamadas.filter((chamada) => chamada.el === el);

  it("CA-7.1 · todas as seções, inclusive as novas, têm título e blocos marcados para entrar ao rolar", () => {
    for (const id of SECOES) {
      const secao = document.getElementById(id);
      const titulo = secao.querySelector(".section-title");
      expect(titulo.classList.contains("reveal"), `#${id}: título`).toBe(true);
      expect(secao.querySelectorAll(".reveal").length, `#${id}: blocos`).toBeGreaterThan(1);
    }
    for (const { seletor } of LISTAS) {
      const conteineres = [...document.querySelectorAll(seletor)];
      expect(conteineres.length, seletor).toBeGreaterThan(0);
      const fora = conteineres.flatMap((conteiner) => [...conteiner.children]).filter((item) => !item.classList.contains("reveal"));
      expect(fora, `${seletor}: todo item é .reveal`).toEqual([]);
    }
    const vigiados = [...document.querySelectorAll(".reveal")].filter((el) => !io.queObserva(el));
    expect(vigiados, "o inView vigia todo .reveal").toEqual([]);
  });

  it("CA-7.1 · ao entrar na vista, título e itens recebem is-in em sequência, com o último atraso ≤ 400 ms", async () => {
    for (const id of SECOES) {
      const elementos = [...document.getElementById(id).querySelectorAll(".reveal")];
      elementos.forEach(entrarNaVista);
      // A classe chega no fim da entrada, não antes.
      expect(elementos.filter((el) => el.classList.contains("is-in")), `#${id} antes do fim`).toEqual([]);
      expect(elementos.map((el) => chamadaDe(el).length), `#${id}: uma entrada cada`).toEqual(elementos.map(() => 1));
    }

    for (const lista of LISTAS) {
      for (const conteiner of document.querySelectorAll(lista.seletor)) {
        const atrasos = [...conteiner.children].map((item) => Math.round(chamadaDe(item)[0].opcoes.delay * 1000));
        expect(atrasos[0], lista.seletor).toBe(0);
        atrasos.slice(1).forEach((atraso, i) => {
          expect(atraso, `${lista.seletor} em sequência`).toBe(Math.min(atrasos[i] + lista.passo, lista.teto));
        });
        expect(atrasos.at(-1), `${lista.seletor}: último item`).toBeLessThanOrEqual(400);
      }
    }
    for (const titulo of document.querySelectorAll(".section-title")) {
      expect(chamadaDe(titulo)[0].opcoes.delay).toBe(0);
    }

    await esvaziarMicrotarefas();
    const revelados = [...document.querySelectorAll(".reveal")];
    expect(revelados.filter((el) => !el.classList.contains("is-in"))).toEqual([]);
    // O quadro final que o Motion grava inline sai, para o hover dos cards voltar a valer.
    expect(revelados.filter((el) => ["opacity", "transform", "filter"].some((p) => el.style.getPropertyValue(p)))).toEqual([]);
  });

  it("CA-7.1 · a entrada combina opacity, transform e filter: blur, com a duração e a curva dos tokens", () => {
    const item = document.querySelector(".projects-grid > *");
    const titulo = document.querySelector("#projetos .section-title");
    entrarNaVista(item);
    entrarNaVista(titulo);

    const [{ quadros, opcoes }] = chamadaDe(item);
    expect(quadros).toBe(QUADROS_ENTRADA);
    expect(Object.keys(quadros).sort()).toEqual(["filter", "opacity", "transform"]);
    expect(quadros.opacity).toEqual([0, 1]);
    expect(quadros.transform[0]).toMatch(/translateY\(\d+px\)/);
    expect(quadros.filter[0]).toMatch(/blur\(\d+px\)/);
    // O título não se desloca: só opacity e desfoque.
    expect(chamadaDe(titulo)[0].quadros).toBe(QUADROS_TITULO);
    expect(Object.keys(QUADROS_TITULO).sort()).toEqual(["filter", "opacity"]);

    const declarados = tokens();
    expect(opcoes.duration).toBe(emMs(declarados["--duracao-lenta"], declarados) / 1000);
    expect(opcoes.ease).toEqual(curvaCubica(declarados["--ease-out"]));
    expect(tempoEmSegundos("600ms")).toBe(0.6);
    expect(tempoEmSegundos("0.3s")).toBe(0.3);
    expect(tempoEmSegundos("", 0.6)).toBe(0.6);
  });

  it("CA-7.1 · o atraso vem do stagger do Motion e fica no teto mesmo numa lista longa", () => {
    expect(LISTAS.every((lista) => lista.teto <= ATRASO_MAXIMO)).toBe(true);
    expect(ATRASO_MAXIMO).toBeLessThanOrEqual(400);
    expect([0, 1, 2, 3, 4, 5].map((i) => atrasoNaLista(i, 6, { passo: 90, teto: 360 }))).toEqual([0, 90, 180, 270, 360, 360]);
    expect(atrasoNaLista(99, 100, { passo: 60, teto: 1000 })).toBe(ATRASO_MAXIMO);

    const fonte = readFileSync(path.join(raizDoProjeto, "src/scripts/revelar.js"), "utf8");
    expect(fonte).toMatch(/import\s*\{[^}]*\binView\b[^}]*\}\s*from\s*"motion"/);
    expect(fonte).toMatch(/import\s*\{[^}]*\bstagger\b[^}]*\}\s*from\s*"motion"/);
    expect(semComentarios(fonte)).toMatch(/stagger\(/);
  });

  it("CA-7.1 · uma entrada por elemento: voltar à vista não anima de novo", async () => {
    const item = document.querySelector(".contact-list > *");
    entrarNaVista(item);
    io.instancias.forEach((instancia) => instancia.disparar(item, false));
    io.instancias.forEach((instancia) => instancia.disparar(item, true));
    expect(chamadaDe(item)).toHaveLength(1);
  });
});

describe("CA-7.1 · CSS da entrada no build", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  it("CA-7.1 · o estado escondido só vale sob .js e é o primeiro quadro da entrada do Motion", () => {
    const [escondido] = regrasDe(folha, ".js .reveal:not(.is-in)");
    expect(escondido.getPropertyValue("opacity")).toBe(String(QUADROS_ENTRADA.opacity[0]));
    expect(escondido.getPropertyValue("transform")).toBe(QUADROS_ENTRADA.transform[0]);
    expect(escondido.getPropertyValue("filter")).toBe(QUADROS_ENTRADA.filter[0]);
  });

  it("CA-7.1 · sem movimento reduzido, nenhuma transição de CSS disputa com o animate, e os cards voltam ao hover com --ease-out", () => {
    const comTransicao = regrasComMedia(folha.cssRules)
      .filter((item) => !sobReduzido(item))
      .filter(({ regra }) => /\.reveal\b/.test(regra.selectorText) && regra.style.getPropertyValue("transition"));
    expect(comTransicao.map(({ regra }) => regra.selectorText)).toEqual([]);
    expect(regrasDe(folha, ".js .project-card.reveal.is-in")).toEqual([]);

    const transicoes = regrasDe(folha, ".project-card").map((estilo) => estilo.getPropertyValue("transition")).filter(Boolean);
    expect(transicoes.some((valor) => /transform\s+var\(--duracao-media\)\s+var\(--ease-out\)/.test(valor))).toBe(true);
  });
});

describe("CA-7.2 · conteúdo nunca fica escondido", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("CA-7.2 · sem JavaScript a classe js nunca existe e nenhum seletor esconde conteúdo", () => {
    const html = lerIndexDist();
    // Só o script inline do <head> põe a classe; o HTML servido nasce sem ela.
    expect(html).toMatch(/<html(?![^>]*class=)[^>]*>/);
    expect(html).toContain('document.documentElement.classList.add("js")');

    const seletores = regrasQueEscondem(folha);
    expect(seletores.some((seletor) => seletor.includes(".reveal")), "a revelação existe no CSS").toBe(true);
    expect(seletores.filter((seletor) => seletor.includes(".reveal") && !/(^|,\s*)(html)?\.js\s/.test(seletor))).toEqual([]);

    expect(carregarIndexDist().documentElement.classList.contains("js")).toBe(false);
    // O HTML do dist montado como o navegador sem JavaScript o veria: sem a classe js.
    montarPaginaDoDist();
    document.documentElement.classList.remove("js");
    expect(conteudoEscondido(document, seletores)).toEqual([]);
  });

  it("CA-7.2 · sem IntersectionObserver o src/main.js remove a classe js e todo o conteúdo fica visível", async () => {
    simularMidia({});
    montarPaginaDoDist();
    expect(document.documentElement.classList.contains("js")).toBe(true);
    expect("IntersectionObserver" in window, "o jsdom não tem IntersectionObserver").toBe(false);

    await import("../src/main.js");

    expect(document.documentElement.classList.contains("js")).toBe(false);
    expect(document.querySelectorAll(".reveal")).toHaveLength(0);
    expect(conteudoEscondido(document, regrasQueEscondem(folha))).toEqual([]);
  });
});

describe("CA-7.3 · brilho que segue o ponteiro (src/scripts/brilho.js)", () => {
  let quadros;
  let desligar;
  let registros;

  beforeEach(() => {
    montarPaginaDoDist();
    quadros = [];
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback) => quadros.push(callback)));
    registros = [];
    const original = EventTarget.prototype.addEventListener;
    vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(function (tipo, ouvinte, opcoes) {
      registros.push({ alvo: this, tipo, opcoes });
      return original.call(this, tipo, ouvinte, opcoes);
    });
  });

  afterEach(() => {
    desligar?.();
    desligar = undefined;
    window.matchMedia = matchMediaOriginal;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const alvos = () => [document.querySelector(".hero"), ...document.querySelectorAll(".project-card")];
  const rodarQuadro = () => quadros.splice(0).forEach((callback) => callback(performance.now()));
  const mover = (alvo, x, y) => alvo.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
  const registrosDePonteiro = () => registros.filter((registro) => registro.tipo === "pointermove");

  it("CA-7.3 · com hover fino e sem movimento reduzido, --mx e --my mudam no máximo uma vez por quadro", () => {
    simularMidia({ [PONTEIRO_FINO]: true });
    desligar = iniciarBrilho();

    const lista = alvos();
    expect(lista).toHaveLength(6);
    for (const alvo of lista) {
      const registro = registrosDePonteiro().find((item) => item.alvo === alvo);
      expect(registro, `${alvo.className} escuta pointermove`).toBeDefined();
      expect(registro.opcoes?.passive, `${alvo.className} com listener passivo`).toBe(true);
      expect(alvo.classList.contains("tem-brilho"), "o CSS só mostra o brilho em quem tem o listener").toBe(true);

      const pedidosAntes = requestAnimationFrame.mock.calls.length;
      mover(alvo, 10, 20);
      mover(alvo, 30, 40);
      mover(alvo, 50, 60);
      expect(requestAnimationFrame.mock.calls.length - pedidosAntes, "um quadro pedido para três movimentos").toBe(1);
      expect(alvo.style.getPropertyValue("--mx"), "nada muda antes do quadro").toBe("");

      rodarQuadro();
      // O jsdom não mede: a caixa do elemento fica em (0, 0), então a posição relativa é a do ponteiro.
      expect(alvo.style.getPropertyValue("--mx")).toBe("50px");
      expect(alvo.style.getPropertyValue("--my")).toBe("60px");

      mover(alvo, 70, 80);
      expect(requestAnimationFrame.mock.calls.length - pedidosAntes, "o quadro seguinte pede outro").toBe(2);
      rodarQuadro();
      expect(alvo.style.getPropertyValue("--mx")).toBe("70px");
      expect(alvo.style.getPropertyValue("--my")).toBe("80px");
    }
  });

  it("CA-7.3 · em toque (sem hover fino) o listener de pointermove nem é registrado", () => {
    simularMidia({ [PONTEIRO_FINO]: false, "(hover: hover)": false });
    desligar = iniciarBrilho();

    expect(registrosDePonteiro()).toEqual([]);
    expect(document.querySelectorAll(".tem-brilho")).toHaveLength(0);
    mover(document.querySelector(".hero"), 10, 20);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("CA-7.3 · com prefers-reduced-motion: reduce o listener de pointermove nem é registrado", () => {
    simularMidia({ [PONTEIRO_FINO]: true, [REDUZIDO]: true });
    desligar = iniciarBrilho();

    expect(registrosDePonteiro()).toEqual([]);
    expect(document.querySelectorAll(".tem-brilho")).toHaveLength(0);
  });

  it("CA-7.3 · ao ligar reduzir movimento com a página aberta o brilho para de seguir o ponteiro", () => {
    simularMidia({ [PONTEIRO_FINO]: true });
    desligar = iniciarBrilho();
    const hero = document.querySelector(".hero");
    expect(hero.classList.contains("tem-brilho")).toBe(true);

    mudarMidia(REDUZIDO, true);
    expect(document.querySelectorAll(".tem-brilho")).toHaveLength(0);
    const pedidosAntes = requestAnimationFrame.mock.calls.length;
    mover(hero, 10, 20);
    expect(requestAnimationFrame.mock.calls.length, "o ponteiro deixou de ser escutado").toBe(pedidosAntes);

    mudarMidia(REDUZIDO, false);
    expect(hero.classList.contains("tem-brilho"), "ao desligar a preferência o brilho volta").toBe(true);
    mover(hero, 10, 20);
    expect(requestAnimationFrame.mock.calls.length - pedidosAntes).toBe(1);
  });

  it("CA-7.3 · ponteiro entrando e saindo rápido do card: sem acúmulo de quadros nem de listeners e termina em repouso", () => {
    simularMidia({ [PONTEIRO_FINO]: true });
    desligar = iniciarBrilho();
    const card = document.querySelector(".project-card");
    const ouvintesAntes = registrosDePonteiro().length;

    for (let i = 0; i < 30; i++) {
      card.dispatchEvent(new MouseEvent("pointerenter", { bubbles: false }));
      mover(card, i, i * 2);
      mover(card, i + 1, i * 2 + 1);
      card.dispatchEvent(new MouseEvent("pointerleave", { bubbles: false }));
    }
    expect(requestAnimationFrame.mock.calls.length, "um quadro pendente para todos os movimentos").toBe(1);
    expect(registrosDePonteiro().length, "nenhum listener novo por entrada e saída").toBe(ouvintesAntes);

    rodarQuadro();
    expect(card.style.getPropertyValue("--mx")).toBe("30px");
    expect(requestAnimationFrame.mock.calls.length, "terminado o quadro, nada novo é pedido").toBe(1);
    expect(quadros, "nenhum quadro sobrando").toEqual([]);
    expect(card.classList.contains("tem-brilho"), "o brilho segue ligado, mas só aparece sob :hover").toBe(true);
  });

  it("CA-7.3 · sem matchMedia (navegador antigo) nada é registrado e nada quebra", () => {
    window.matchMedia = undefined;
    expect(() => (desligar = iniciarBrilho())).not.toThrow();
    expect(registrosDePonteiro()).toEqual([]);
  });
});

/* Composição como o navegador pinta: a cor translúcida sobre o fundo, em sRGB codificado. */
const codificar = (canal) => (canal <= 0.0031308 ? 12.92 * canal : 1.055 * canal ** (1 / 2.4) - 0.055);
const decodificar = (canal) => (canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4);
const srgb = (oklch) => oklchParaSrgbLinear(oklch).map(codificar);
const sobrepor = (frente, alfa, fundo) => frente.map((canal, i) => alfa * canal + (1 - alfa) * fundo[i]);
const luminancia = (rgb) => rgb.map(decodificar).reduce((soma, canal, i) => soma + canal * [0.2126, 0.7152, 0.0722][i], 0);
const contraste = (a, b) => {
  const [clara, escura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (clara + 0.05) / (escura + 0.05);
};

describe("CA-7.3 · o brilho respeita o contraste", () => {
  it("CA-7.3 · no ponto mais forte do brilho, o texto do card e o da navegação sobre o hero ficam em 4,5:1 ou mais", () => {
    const css = Object.fromEntries(lerCssDeEstilos().map(({ arquivo, css }) => [arquivo, css]));
    const mistura = (bloco, texto) => {
      const regra = new RegExp(`${bloco.replace(/[.:]/g, "\\$&")}\\s*\\{[^}]*?var\\(--cor-violeta-marca\\)\\s+(\\d+)%`).exec(texto);
      expect(regra, `${bloco} mistura --cor-violeta-marca`).not.toBeNull();
      return Number(regra[1]) / 100;
    };
    const card = mistura(".project-card::before", css["movimento.css"]);
    const hero = mistura(".hero::after", css["movimento.css"]);
    const heroFixo = mistura(".hero::before", css["hero.css"]);

    const declarados = tokens();
    const marca = srgb(declarados["--cor-violeta-marca"]);
    const fundoCard = sobrepor(marca, card, srgb(declarados["--cor-superficie-2"]));
    for (const texto of ["--cor-texto-forte", "--cor-texto-suave", "--cor-violeta-texto"]) {
      expect(contraste(srgb(declarados[texto]), fundoCard), `${texto} no card`).toBeGreaterThanOrEqual(4.5);
    }
    // Pior caso no hero: o brilho fixo de hero.css e o do ponteiro somados sobre o fundo.
    const fundoHero = sobrepor(marca, hero, sobrepor(marca, heroFixo, srgb(declarados["--cor-fundo"])));
    for (const texto of ["--cor-texto-forte", "--cor-texto-suave", "--cor-violeta-texto"]) {
      expect(contraste(srgb(declarados[texto]), fundoHero), `${texto} sobre o hero`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("CA-7.4 · movimento reduzido desliga deslocamentos", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
  });

  it("CA-7.4 · sob reduce, a página inteira fica sem animação de CSS e só transiciona opacity, em até 200 ms", () => {
    const universais = regrasComMedia(folha.cssRules)
      .filter(sobReduzido)
      .filter(({ regra }) => {
        // O build minifica "*, *::before, *::after" para "*,:before,:after".
        const partes = dividirNoTopo(regra.selectorText).map((parte) => parte.replace(/^\*(?=:)/, "").replace(/^::/, ":"));
        return ["*", ":before", ":after"].every((parte) => partes.includes(parte));
      })
      .map(({ regra }) => regra.style);
    expect(universais.length, "regra para *, *::before e *::after").toBeGreaterThan(0);
    const [estilo] = universais;
    const declarados = tokens();

    const animacao = estilo.getPropertyValue("animation") || estilo.getPropertyValue("animation-name");
    expect(animacao).toMatch(/^none\b/);
    expect(estilo.getPropertyValue("transition-property")).toBe("opacity");
    expect(estilo.getPropertyPriority("transition-property")).toBe("important");
    expect(emMs(estilo.getPropertyValue("transition-duration").trim(), declarados)).toBeLessThanOrEqual(200);
    expect(estilo.getPropertyPriority("transition-duration")).toBe("important");
    expect(emMs(estilo.getPropertyValue("transition-delay").trim(), declarados)).toBe(0);

    // Toda transição declarada dentro de reduce também é só opacity (ou none), em até 200 ms.
    const dentro = regrasComMedia(folha.cssRules)
      .filter(sobReduzido)
      .map(({ regra }) => ({ seletor: regra.selectorText, valor: regra.style.getPropertyValue("transition") }))
      .filter(({ valor }) => valor && !/^none\b/.test(valor));
    const fora = dentro.flatMap(({ seletor, valor }) =>
      transicoesDe(valor)
        .filter(({ propriedade, duracao }) => !["opacity", "visibility"].includes(propriedade) || (emMs(duracao, declarados) ?? 0) > 200)
        .map(({ propriedade }) => `${seletor}: ${propriedade}`),
    );
    expect(fora).toEqual([]);
  });

  it("CA-7.4 · todo deslocamento de hover, foco, clique, revelação e painel do menu vira transform: none sob reduce", () => {
    // Fora da lista, por desenho: o skip-link fica fora da tela até o foco (é esconder, não mover)
    // e as linhas do ícone de menu trocam de forma para o X sem transição.
    const naoEDeslocamento = (parte) => /^\.skip-link\b/.test(parte) || /\.menu-icone/.test(parte);
    const regras = regrasComMedia(folha.cssRules);
    const comDeslocamento = regras
      .filter((item) => !sobReduzido(item))
      .filter(({ regra }) => /translate|scale|rotate/.test(regra.style.getPropertyValue("transform")))
      .flatMap(({ regra }) => dividirNoTopo(regra.selectorText))
      .filter((parte) => !/::?(before|after)\b/.test(parte) && !naoEDeslocamento(parte));
    expect(comDeslocamento.length).toBeGreaterThan(5);

    const zerados = new Set(
      regras
        .filter(sobReduzido)
        .filter(({ regra }) => regra.style.getPropertyValue("transform") === "none")
        .flatMap(({ regra }) => dividirNoTopo(regra.selectorText)),
    );
    expect(comDeslocamento.filter((parte) => !zerados.has(parte))).toEqual([]);
    expect([...zerados].some((parte) => /^\.js \.section-title::?after$/.test(parte)), "o traço do título nasce inteiro").toBe(true);
  });

  it("CA-7.4 · sob reduce a revelação não chama o animate: o elemento só recebe is-in e o CSS faz o fade", () => {
    simularMidia({ [REDUZIDO]: true });
    montarPaginaDoDist();
    const io = simularIntersectionObserver();
    const registro = registrarAnimacoes();
    const parar = iniciarRevelar(document, { animar: registro.animar });

    const elementos = [...document.querySelectorAll(".reveal")];
    expect(elementos.length).toBeGreaterThan(20);
    elementos.forEach((el) => io.queObserva(el).disparar(el, true));
    expect(registro.chamadas).toEqual([]);
    expect(elementos.filter((el) => !el.classList.contains("is-in"))).toEqual([]);
    parar();

    const [fade] = regrasComMedia(folha.cssRules)
      .filter(sobReduzido)
      .filter(({ regra }) => regra.selectorText === ".js .reveal")
      .map(({ regra }) => regra.style.getPropertyValue("transition"));
    const [{ propriedade, duracao }] = transicoesDe(fade);
    expect(propriedade).toBe("opacity");
    expect(emMs(duracao, tokens())).toBeLessThanOrEqual(200);
  });
});

describe("CA-7.4 · reduzir movimento com a página aberta", () => {
  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
  });

  it("CA-7.4 · as entradas ainda não rodadas passam ao comportamento reduzido; as que já rodaram seguem animadas", () => {
    simularMidia({});
    montarPaginaDoDist();
    const io = simularIntersectionObserver();
    const registro = registrarAnimacoes();
    const parar = iniciarRevelar(document, { animar: registro.animar });

    const [primeiro, segundo] = [...document.querySelectorAll(".reveal")];
    io.queObserva(primeiro).disparar(primeiro, true);
    expect(registro.chamadas.filter((chamada) => chamada.el === primeiro)).toHaveLength(1);

    mudarMidia(REDUZIDO, true);
    io.queObserva(segundo).disparar(segundo, true);
    expect(registro.chamadas.filter((chamada) => chamada.el === segundo), "sem animate depois do change").toEqual([]);
    expect(segundo.classList.contains("is-in")).toBe(true);
    parar();
  });
});

describe("CA-7.1 · entrada interrompida termina visível e sem estilo inline", () => {
  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
    vi.unstubAllGlobals();
  });

  /** animate falso que não termina sozinho: o teste decide quando e como a animação acaba. */
  function animacaoManual() {
    const animacoes = [];
    const animar = (el, quadros) => {
      let concluir;
      let falhar;
      const finished = new Promise((resolve, reject) => ((concluir = resolve), (falhar = reject)));
      // No meio da entrada o navegador já deixou o elemento parcialmente visível, como estilo inline.
      Object.entries(quadros).forEach(([propriedade, valores]) => el.style.setProperty(propriedade, String(valores[0])));
      animacoes.push({ el, quadros, concluir, falhar });
      return { finished };
    };
    return { animacoes, animar };
  }

  function iniciar() {
    simularMidia({});
    montarPaginaDoDist();
    const io = simularIntersectionObserver();
    const manual = animacaoManual();
    const parar = iniciarRevelar(document, { animar: manual.animar });
    const el = document.querySelector(".projects-grid > *");
    io.queObserva(el).disparar(el, true);
    return { io, manual, parar, el };
  }

  const visivel = (el) =>
    el.classList.contains("is-in") && ["opacity", "transform", "filter"].every((p) => el.style.getPropertyValue(p) === "");

  it("CA-7.1 · animação cancelada no meio (finished rejeita) deixa o elemento com is-in e sem estilo inline", async () => {
    const { manual, parar, el } = iniciar();
    expect(manual.animacoes).toHaveLength(1);
    expect(el.style.getPropertyValue("opacity"), "no meio da entrada há estilo inline").not.toBe("");

    manual.animacoes[0].falhar(new DOMException("cancelada", "AbortError"));
    await esvaziarMicrotarefas();
    expect(visivel(el)).toBe(true);
    parar();
  });

  it("CA-7.4 · reduzir movimento no meio da entrada: a animação em curso termina visível e sem estilo inline", async () => {
    const { manual, parar, el } = iniciar();

    mudarMidia(REDUZIDO, true);
    manual.animacoes[0].concluir();
    await esvaziarMicrotarefas();
    expect(visivel(el)).toBe(true);
    expect(manual.animacoes, "nenhuma animação nova só por causa da mudança").toHaveLength(1);
    parar();
  });

  it("CA-7.1 · parar de vigiar no meio da entrada desliga todo observador e a animação em curso termina visível", async () => {
    const { io, manual, parar, el } = iniciar();
    expect(io.instancias.some((instancia) => instancia.alvos.length > 0), "antes de parar ainda há elementos vigiados").toBe(true);

    parar();
    expect(io.instancias.every((instancia) => instancia.alvos.length === 0), "depois de parar nenhum observador vigia nada").toBe(true);

    manual.animacoes[0].concluir();
    await esvaziarMicrotarefas();
    expect(visivel(el)).toBe(true);
  });
});

describe("CA-7.5 · só propriedades baratas animadas", () => {
  const css = lerCssDeEstilos();
  const registradas = new Set(css.flatMap(({ css: texto }) => [...texto.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1])));
  const permitida = (propriedade) => ["opacity", "transform", "filter"].includes(propriedade) || registradas.has(propriedade);
  const PROIBIDAS = /^(width|height|top|left|right|bottom|margin(-[\w-]+)?|inset|padding(-[\w-]+)?)$/;

  it("CA-7.5 · as custom properties animadas estão registradas com @property e uma sintaxe tipada", () => {
    expect(registradas.size).toBeGreaterThan(0);
    for (const { css: texto } of css) {
      for (const [, nome, corpo] of texto.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
        expect(corpo, nome).toMatch(/syntax:\s*"<[\w-]+>"/);
        expect(corpo, nome).toMatch(/inherits:\s*false/);
      }
    }
  });

  it("CA-7.5 · transition e transition-property de src/styles/ só animam opacity, transform, filter ou custom property registrada", () => {
    const declarados = tokens();
    const encontradas = css.flatMap(({ arquivo, css: texto }) =>
      [...texto.matchAll(/(?:^|[;{\s])transition(-property)?\s*:\s*([^;}]+)/g)].flatMap(([, soPropriedade, valor]) => {
        if (/^none\b/.test(valor.trim())) return [];
        if (soPropriedade) return dividirNoTopo(valor.replace(/!important/, "")).map((propriedade) => ({ arquivo, propriedade, duracao: null }));
        return transicoesDe(valor).map((transicao) => ({ arquivo, ...transicao }));
      }),
    );
    expect(encontradas.length).toBeGreaterThan(10);

    // Duração literal 0s não anima nada: é a troca discreta adiada (visibility do painel do menu,
    // que some só depois do fade de opacity). Ela é listada à parte, não perdoada em silêncio.
    const discretas = encontradas.filter(({ duracao }) => duracao !== null && emMs(duracao, declarados) === 0);
    expect(discretas.map(({ propriedade }) => propriedade)).toEqual(["visibility", "visibility"]);

    const animadas = encontradas.filter((transicao) => !discretas.includes(transicao));
    expect(animadas.filter(({ propriedade }) => PROIBIDAS.test(propriedade))).toEqual([]);
    expect(animadas.filter(({ propriedade }) => !permitida(propriedade)).map(({ arquivo, propriedade }) => `${arquivo}: ${propriedade}`)).toEqual([]);
  });

  it("CA-7.5 · os @keyframes de src/styles/ só mexem em opacity, transform ou filter", () => {
    const quadros = css.flatMap(({ arquivo, css: texto }) =>
      [...texto.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)].flatMap(([, nome, corpo]) =>
        [...corpo.matchAll(/([\w-]+)\s*:/g)].map(([, propriedade]) => ({ arquivo, nome, propriedade })),
      ),
    );
    expect(quadros.length).toBeGreaterThan(0);
    expect(quadros.filter(({ propriedade }) => !permitida(propriedade))).toEqual([]);
  });

  it("CA-7.5 · as chamadas de animate do Motion em src/scripts/ só animam opacity, transform ou filter", () => {
    const scripts = arquivosJs().filter(({ relativo }) => relativo.startsWith("src/scripts/"));
    const chamadas = scripts.flatMap(({ relativo, texto }) => {
      const codigo = semComentarios(texto);
      return [...codigo.matchAll(/\b(animar|animateMini|animate)\(\s*[^,()]+,\s*([^,]+),/g)].map(([, funcao, argumento]) => {
        // O argumento de quadros é um objeto literal ou um nome; o nome é resolvido no próprio arquivo.
        const atribuicao = new RegExp(`const\\s+${argumento.trim()}\\s*=\\s*([^;]+);`).exec(codigo)?.[1] ?? argumento;
        const objetos = /^\s*\{/.test(atribuicao)
          ? [atribuicao]
          : [...atribuicao.matchAll(/\b(QUADROS_\w+)\b/g)].map(([, nome]) => new RegExp(`const\\s+${nome}\\s*=\\s*(\\{[^}]*\\})`).exec(codigo)?.[1]);
        return { relativo, funcao, objetos };
      });
    });
    expect(chamadas.length, "revelar.js chama o animate do Motion").toBeGreaterThan(0);

    const propriedades = chamadas.flatMap(({ relativo, objetos }) => {
      expect(objetos.length, `${relativo}: quadros resolvidos`).toBeGreaterThan(0);
      return objetos.flatMap((objeto) => {
        expect(objeto, `${relativo}: quadros como objeto literal`).toBeDefined();
        return [...objeto.matchAll(/([\w-]+)\s*:/g)].map(([, propriedade]) => propriedade);
      });
    });
    expect(new Set(propriedades)).toEqual(new Set(["opacity", "transform", "filter"]));
    expect(propriedades.filter((propriedade) => !["opacity", "transform", "filter"].includes(propriedade))).toEqual([]);
  });
});

describe("CA-7.6 · Motion entra leve e só onde é usado", () => {
  const MODULOS_DE_MOVIMENTO = ["src/scripts/brilho.js", "src/scripts/revelar.js"];
  const importaMotion = (texto) => /from\s*["']motion(\/[\w-]+)?["']|import\(\s*["']motion|require\(\s*["']motion/.test(texto);

  it("CA-7.6 · motion está em dependencies, com versão fixa como as demais", () => {
    const pacote = JSON.parse(readFileSync(path.join(raizDoProjeto, "package.json"), "utf8"));
    expect(pacote.dependencies?.motion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pacote.devDependencies?.motion).toBeUndefined();
  });

  it("CA-7.6 · o motion é importado só por nome e só nos módulos de movimento", () => {
    const arquivos = arquivosJs();
    const comMotion = arquivos.filter(({ texto }) => importaMotion(texto));
    expect(comMotion.map(({ relativo }) => relativo).filter((relativo) => !MODULOS_DE_MOVIMENTO.includes(relativo))).toEqual([]);
    expect(comMotion.map(({ relativo }) => relativo)).toContain("src/scripts/revelar.js");

    for (const { relativo, texto } of comMotion) {
      const importacoes = [...texto.matchAll(/import\s+([^;]*?)\s+from\s*["']motion[^"']*["']/g)].map(([, alvo]) => alvo.trim());
      expect(importacoes.length, relativo).toBeGreaterThan(0);
      expect(importacoes.filter((alvo) => !/^\{[\s\w,]+\}$/.test(alvo)), `${relativo}: só import { nome }`).toEqual([]);
      expect(texto, relativo).not.toMatch(/import\s*\*\s*as[^;]*["']motion/);
      expect(texto, relativo).not.toMatch(/import\(\s*["']motion|require\(\s*["']motion/);
    }
  });

  it("CA-7.6 · src/main.js não importa o motion: só chama iniciarRevelar e iniciarBrilho", () => {
    const main = readFileSync(path.join(raizDoProjeto, "src/main.js"), "utf8");
    expect(importaMotion(main)).toBe(false);
    expect(main).toMatch(/import\s*\{\s*iniciarRevelar\s*\}\s*from\s*"\.\/scripts\/revelar\.js"/);
    expect(main).toMatch(/import\s*\{\s*iniciarBrilho\s*\}\s*from\s*"\.\/scripts\/brilho\.js"/);
    expect(main).toMatch(/^iniciarRevelar\(\);$/m);
    expect(main).toMatch(/^iniciarBrilho\(\);$/m);
    expect(main).not.toMatch(/IntersectionObserver/);
  });
});
