import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  arquivoNoDist,
  carregarIndexDist,
  injetarCssDoIndexDist,
  lerIndexDist,
  raizDoProjeto,
  regrasDe,
} from "./dist.js";
import { lerTokensDoRoot, razaoDeContraste } from "./cores.js";
import { projetos } from "../src/data/projetos.js";
import { ordenarProjetos, renderizarProjetos } from "../src/render/projetos.js";
import { iniciarProjetos } from "../src/scripts/projetos.js";

/*
 * Spec 6 · seção #projetos. CA-6.1 a CA-6.3 contra o dist/index.html montado (e os arquivos de
 * imagem copiados para dist/); o comportamento de troca de preview (CA-6.3, CA-6.5) roda em jsdom
 * sobre o HTML do dist, com matchMedia simulado; CA-6.4 lê as regras do CSS do build e o contraste
 * dos tokens.
 */

const ORDEM_ESPERADA = ["Task Manager", "ForjaSys", "Sistema de RH", "Cookin-Up", "Xadrez"];
const DESTAQUES = ["Task Manager", "ForjaSys"];
const LIMITE_POSTER = 150 * 1024;

function normalizar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

function fragmento(html) {
  const modelo = document.createElement("template");
  modelo.innerHTML = html;
  return modelo.content;
}

const tituloDe = (artigo) => normalizar(artigo.querySelector("h3")?.textContent ?? "");

/** Webp animado tem quadros em chunks ANMF; o poster tem de ser um quadro só. */
function webpEstatico(caminho) {
  const bytes = readFileSync(caminho);
  const ehWebp = bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP";
  return ehWebp && !bytes.includes(Buffer.from("ANMF", "latin1"));
}

let secao;

beforeAll(() => {
  secao = carregarIndexDist().getElementById("projetos");
});

describe("#projetos no dist", () => {
  it("CA-6.1 · cada <article> tem <h3>, descrição, lista de tags e o link Repositório (ou o selo privado no ForjaSys)", () => {
    const artigos = [...secao.querySelectorAll("article")];
    expect(artigos).toHaveLength(5);

    const problemas = artigos.flatMap((artigo) => {
      const titulo = tituloDe(artigo);
      const erros = [];
      if (!titulo) erros.push("sem <h3>");
      if (!normalizar(artigo.querySelector("p")?.textContent ?? "")) erros.push("sem descrição");

      const lista = artigo.querySelector("ul.project-tags");
      const tags = lista ? [...lista.children] : [];
      if (!tags.length) erros.push("sem lista de tags");
      if (tags.some((tag) => tag.tagName !== "LI" || !normalizar(tag.textContent))) erros.push("tag fora de <li> ou vazia");

      const links = [...artigo.querySelectorAll("a")];
      if (titulo === "ForjaSys") {
        if (links.length) erros.push("ForjaSys não pode ter link");
        const selo = artigo.querySelector(".project-link--private");
        if (normalizar(selo?.textContent ?? "") !== "Repositório privado") erros.push("sem selo Repositório privado");
      } else {
        const repositorio = links.filter((link) => normalizar(link.textContent) === "Repositório");
        if (repositorio.length !== 1) erros.push(`${repositorio.length} links Repositório`);
        const [link] = repositorio;
        if (link && !/^https:\/\/github\.com\//.test(link.getAttribute("href"))) erros.push("href fora do GitHub");
        if (link && link.getAttribute("target") !== "_blank") erros.push("sem target=_blank");
        if (link && !(link.getAttribute("rel") ?? "").split(/\s+/).includes("noopener")) erros.push("sem rel=noopener");
      }
      return erros.map((erro) => `${titulo || "?"}: ${erro}`);
    });
    expect(problemas).toEqual([]);
  });

  it("CA-6.1 · nenhum travessão no texto da seção", () => {
    expect(secao.textContent).not.toMatch(/[—–]/);
  });

  it("CA-6.2 · Task Manager e ForjaSys vêm primeiro com project--destaque; os outros três depois, sem a classe", () => {
    expect(projetos.filter((projeto) => projeto.destaque).map((projeto) => projeto.titulo).sort()).toEqual([...DESTAQUES].sort());

    const artigos = [...secao.querySelectorAll("article")];
    expect(artigos.map(tituloDe)).toEqual(ORDEM_ESPERADA);
    const comDestaque = artigos.filter((artigo) => artigo.classList.contains("project--destaque")).map(tituloDe);
    expect(comDestaque).toEqual(DESTAQUES);
  });

  it("CA-6.3 · a imagem de cada card é o poster webp estático de até 150 KB, com loading=lazy, width, height e alt", () => {
    const imagens = [...secao.querySelectorAll("article img")];
    expect(imagens).toHaveLength(5);

    const problemas = imagens.flatMap((imagem) => {
      const src = imagem.getAttribute("src") ?? "";
      const erros = [];
      if (!/^img\/posters\/[\w-]+\.webp$/.test(src)) erros.push(`src não é poster webp: ${src}`);
      else {
        const arquivo = arquivoNoDist(src);
        const tamanho = statSync(arquivo, { throwIfNoEntry: false })?.size;
        if (tamanho === undefined) erros.push("poster ausente no dist");
        else {
          if (tamanho > LIMITE_POSTER) erros.push(`poster com ${tamanho} bytes`);
          if (!webpEstatico(arquivo)) erros.push("poster não é webp estático");
        }
      }
      if (imagem.getAttribute("loading") !== "lazy") erros.push("sem loading=lazy");
      if (!/^\d+$/.test(imagem.getAttribute("width") ?? "") || !/^\d+$/.test(imagem.getAttribute("height") ?? "")) {
        erros.push("sem width/height");
      }
      if (!normalizar(imagem.getAttribute("alt") ?? "")) erros.push("sem alt");
      return erros.map((erro) => `${src}: ${erro}`);
    });
    expect(problemas).toEqual([]);
  });

  it("CA-6.3 · o preview animado fica só em data-animado: nenhum src, srcset ou preload do HTML aponta para ele", () => {
    const imagens = [...secao.querySelectorAll("article img")];
    const animados = imagens.map((imagem) => imagem.dataset.animado);
    expect(animados.every(Boolean)).toBe(true);
    for (const animado of animados) {
      expect(statSync(arquivoNoDist(animado), { throwIfNoEntry: false })?.isFile(), `${animado} no dist`).toBe(true);
    }
    expect([...animados].sort()).toEqual(projetos.map((projeto) => projeto.animado).sort());

    const documento = carregarIndexDist();
    const referencias = [...documento.querySelectorAll("[src], [srcset], link[href]")].flatMap((el) =>
      ["src", "srcset", "href"].map((nome) => el.getAttribute(nome)).filter(Boolean),
    );
    const carregaAnimado = referencias.filter((ref) => animados.some((animado) => ref.includes(animado)) || /\.gif\b/.test(ref));
    expect(carregaAnimado).toEqual([]);
    expect(lerIndexDist()).not.toMatch(/src="[^"]*\.gif"/);
  });
});

/** matchMedia falso: cada consulta responde conforme o mapa (consulta ausente = false). */
function simularMidia(respostas) {
  window.matchMedia = (consulta) => ({
    matches: Boolean(respostas[consulta]),
    media: consulta,
    addEventListener() {},
    removeEventListener() {},
  });
}

describe("troca de preview · src/scripts/projetos.js", () => {
  let desligar;
  const matchMediaOriginal = window.matchMedia;

  beforeEach(() => {
    document.body.innerHTML = secao.outerHTML;
  });

  afterEach(() => {
    desligar?.();
    desligar = undefined;
    window.matchMedia = matchMediaOriginal;
    document.body.innerHTML = "";
  });

  const cards = () => [...document.querySelectorAll("#projetos article")];
  const imagemDe = (card) => card.querySelector("img");

  it("CA-6.3 · sem interesse a imagem fica no poster; pointerenter troca para o animado e pointerleave volta", () => {
    simularMidia({ "(hover: hover)": true });
    desligar = iniciarProjetos();

    for (const card of cards()) {
      const imagem = imagemDe(card);
      const poster = imagem.getAttribute("src");
      expect(poster).toMatch(/^img\/posters\//);

      card.dispatchEvent(new Event("pointerenter"));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(imagem.dataset.animado);

      card.dispatchEvent(new Event("pointerleave"));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(poster);
    }
  });

  it("CA-6.3 · o foco no link do card (focusin) troca para o animado e a saída do foco (focusout) volta ao poster", () => {
    simularMidia({ "(hover: hover)": true });
    desligar = iniciarProjetos();

    const comLink = cards().filter((card) => card.querySelector("a"));
    expect(comLink).toHaveLength(4);
    for (const card of comLink) {
      const imagem = imagemDe(card);
      const poster = imagem.getAttribute("src");
      const link = card.querySelector("a");

      link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(imagem.dataset.animado);

      link.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(poster);
    }
  });

  it("CA-6.3 · em tela sem (hover: hover) o pointerenter e o focusin não carregam o animado", () => {
    simularMidia({ "(hover: hover)": false });
    desligar = iniciarProjetos();

    for (const card of cards()) {
      const imagem = imagemDe(card);
      const poster = imagem.getAttribute("src");
      card.dispatchEvent(new Event("pointerenter"));
      card.querySelector("a")?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(poster);
    }
  });

  it("CA-6.5 · com prefers-reduced-motion: reduce o pointerenter e o focusin mantêm o quadro estático", () => {
    simularMidia({ "(hover: hover)": true, "(prefers-reduced-motion: reduce)": true });
    desligar = iniciarProjetos();

    for (const card of cards()) {
      const imagem = imagemDe(card);
      const poster = imagem.getAttribute("src");
      card.dispatchEvent(new Event("pointerenter"));
      card.querySelector("a")?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(imagem.getAttribute("src"), tituloDe(card)).toBe(poster);
    }
  });

  it("CA-6.3 · sem matchMedia (navegador antigo) nada troca e nada quebra", () => {
    window.matchMedia = undefined;
    desligar = iniciarProjetos();
    const [card] = cards();
    const poster = imagemDe(card).getAttribute("src");
    card.dispatchEvent(new Event("pointerenter"));
    expect(imagemDe(card).getAttribute("src")).toBe(poster);
  });
});

describe("render · renderizarProjetos", () => {
  const base = (titulo, extra = {}) => ({
    titulo,
    descricao: "d",
    tags: ["t"],
    poster: { src: `img/posters/${titulo}.webp`, largura: 1, altura: 1, alt: titulo },
    animado: `img/${titulo}.webp`,
    repositorio: `https://github.com/x/${titulo}`,
    ...extra,
  });

  it("CA-6.2 · destaque primeiro, mantendo a ordem relativa do arquivo nos dois grupos", () => {
    const entrada = [base("a"), base("b", { destaque: true }), base("c"), base("d", { destaque: true }), base("e")];
    expect(ordenarProjetos(entrada).map((projeto) => projeto.titulo)).toEqual(["b", "d", "a", "c", "e"]);
    expect(entrada.map((projeto) => projeto.titulo)).toEqual(["a", "b", "c", "d", "e"]);

    const artigos = [...fragmento(renderizarProjetos(entrada)).querySelectorAll("article")];
    expect(artigos.map(tituloDe)).toEqual(["b", "d", "a", "c", "e"]);
    expect(artigos.map((artigo) => artigo.classList.contains("project--destaque"))).toEqual([true, true, false, false, false]);
  });

  it("CA-6.3 · escapa poster e animado e nunca põe o animado em src", () => {
    const html = renderizarProjetos([base("x", { animado: 'img/a.gif" onerror="alert(1)' })]);
    const imagem = fragmento(html).querySelector("img");
    expect(imagem.getAttribute("onerror")).toBeNull();
    expect(imagem.dataset.animado).toBe('img/a.gif" onerror="alert(1)');
    expect(imagem.getAttribute("src")).toBe("img/posters/x.webp");
    expect(imagem.getAttribute("loading")).toBe("lazy");
  });
});

const valores = (estilos, propriedade) => estilos.map((estilo) => estilo.getPropertyValue(propriedade)).filter(Boolean);

/** Declarações (propriedade → valor) das regras com este seletor, fora e dentro de media, em ordem. */
function declaracoes(folha, seletor) {
  return regrasDe(folha, seletor).map((estilo) =>
    Object.fromEntries([...Array(estilo.length).keys()].map((i) => [estilo[i], estilo.getPropertyValue(estilo[i])])),
  );
}

/** Regras com o seletor dentro de @media cuja condição contém o texto pedido. */
function regrasEmMedia(folha, condicao, seletor) {
  const percorrer = (regras, dentro) =>
    [...regras].flatMap((regra) => {
      if (regra.cssRules && !regra.selectorText) {
        const media = regra.media?.mediaText ?? regra.conditionText ?? "";
        return percorrer(regra.cssRules, dentro || media.includes(condicao));
      }
      const partes = regra.selectorText?.split(",").map((parte) => parte.trim()) ?? [];
      return dentro && partes.includes(seletor) ? [regra.style] : [];
    });
  return percorrer(folha.cssRules, false);
}

describe("CSS de #projetos no build", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  it("CA-6.2 · o card de destaque ocupa mais colunas da grade que os demais", () => {
    expect(valores(regrasDe(folha, ".projects-grid"), "display")).toContain("grid");
    const colunasDestaque = valores(regrasDe(folha, ".project--destaque"), "grid-column");
    expect(colunasDestaque.length).toBeGreaterThan(0);
    expect(colunasDestaque.some((valor) => /span\s*[2-9]/.test(valor))).toBe(true);
  });

  it("CA-6.4 · :focus-within dá ao card exatamente o mesmo estado visual do :hover", () => {
    const hover = declaracoes(folha, ".project-card:hover");
    const foco = declaracoes(folha, ".project-card:focus-within");
    expect(hover.length).toBeGreaterThan(0);
    expect(hover.some((estilo) => estilo.transform && estilo["box-shadow"])).toBe(true);
    expect(foco).toEqual(hover);
  });

  it("CA-6.4 · o link do card tem contorno de foco visível com var(--cor-foco)", () => {
    const contornos = regrasDe(folha, ".project-link:focus-visible").map((estilo) => estilo.cssText);
    expect(contornos.length).toBeGreaterThan(0);
    expect(contornos.some((texto) => /outline[^;]*solid/.test(texto) && texto.includes("var(--cor-foco)"))).toBe(true);
    expect(contornos.some((texto) => /outline[^;]*none/.test(texto))).toBe(false);
  });

  it("CA-6.4 · o token de foco tem contraste de 3:1 ou mais contra a superfície do card e a da seção", () => {
    const tokens = lerTokensDoRoot(readFileSync(path.join(raizDoProjeto, "src/styles/tokens.css"), "utf8"));
    const fundos = [".project-card", ".projects"].map((seletor) => {
      const fundo = valores(regrasDe(folha, seletor), "background").concat(valores(regrasDe(folha, seletor), "background-color"));
      const token = fundo.map((valor) => /var\((--[\w-]+)\)/.exec(valor)?.[1]).find(Boolean);
      expect(token, `${seletor} usa um token de fundo`).toBeDefined();
      return token;
    });
    for (const fundo of fundos) {
      expect(razaoDeContraste(tokens["--cor-foco"], tokens[fundo]), fundo).toBeGreaterThanOrEqual(3);
    }
  });

  it("CA-6.4 · hover e focus-within só animam transform e box-shadow, com sombra e borda por token", () => {
    const estados = [...regrasDe(folha, ".project-card:hover"), ...regrasDe(folha, ".project-card:focus-within")];
    expect(valores(estados, "box-shadow").every((valor) => valor.includes("var(--"))).toBe(true);
    const transicoes = valores(regrasDe(folha, ".project-card"), "transition");
    expect(transicoes.length).toBeGreaterThan(0);
    // "none" é o estado de movimento reduzido (CA-6.5); os demais valores listam o que anima.
    const animadas = transicoes
      .filter((valor) => valor !== "none")
      .flatMap((valor) => valor.split(",").map((parte) => parte.trim().split(/\s+/)[0]));
    expect(animadas.length).toBeGreaterThan(0);
    expect(animadas.filter((propriedade) => !["transform", "opacity", "box-shadow"].includes(propriedade))).toEqual([]);
  });

  it("CA-6.5 · com prefers-reduced-motion: reduce o card e o preview não se movem", () => {
    for (const seletor of [".project-card:hover", ".project-card:focus-within", ".project-preview"]) {
      const transformacoes = valores(regrasEmMedia(folha, "reduce", seletor), "transform");
      expect(transformacoes, seletor).toContain("none");
    }
    const transicoes = valores(regrasEmMedia(folha, "reduce", ".project-card"), "transition");
    expect(transicoes.some((valor) => /^none\b/.test(valor))).toBe(true);
  });
});
