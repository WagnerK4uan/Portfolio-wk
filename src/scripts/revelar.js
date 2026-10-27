/* ============================================
   MOVIMENTO: revelar ao rolar (Spec 7)
   Extraído de src/main.js e refeito com o Motion: inView vigia cada elemento, stagger calcula o
   atraso dos itens de uma lista e animateMini, o animate do Motion só com Web Animations API, faz a
   entrada (opacity, transform e desfoque). O animate híbrido custaria cerca de 19 kB gzip a mais no bundle (25,59 contra 6,23 kB)
   para recursos (molas, valores em JS) que a entrada não usa. O estado escondido é do CSS e só vale
   sob a classe js (src/styles/movimento.css); sem IntersectionObserver a classe sai e tudo fica visível. Sob prefers-reduced-motion: reduce
   não há animate: o elemento só recebe is-in e o CSS faz um fade curto de opacity. A preferência é
   acompanhada pelo change do matchMedia: quem ainda não entrou passa ao comportamento reduzido.
   ============================================ */
import { animateMini, inView, stagger } from "motion";

const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

/** Teto do atraso de qualquer item de lista, em ms (CA-7.1). */
export const ATRASO_MAXIMO = 400;

/** Listas que entram em sequência: cada filho do contêiner atrasa `passo` ms, até `teto`. */
export const LISTAS = [
  { seletor: ".experience-list", passo: 60, teto: 360 },
  { seletor: ".skills-grid", passo: 25, teto: 400 },
  { seletor: ".projects-grid", passo: 90, teto: 360 },
  { seletor: ".contact-list", passo: 60, teto: 360 },
];

/** Blocos que entram sozinhos, sem atraso. */
export const AVULSOS = ".section-title, .section-subtitle, .about-text, .skill-legenda, .skill-group-title";

/** Entrada dos blocos e itens: sobe 18 px e sai do desfoque. Termina no estado natural. */
export const QUADROS_ENTRADA = {
  opacity: [0, 1],
  transform: ["translateY(18px)", "none"],
  filter: ["blur(4px)", "blur(0px)"],
};

/** O título não se desloca: só aparece e desfoca, e o traço de baixo se estende pelo CSS. */
export const QUADROS_TITULO = {
  opacity: [0, 1],
  filter: ["blur(4px)", "blur(0px)"],
};

const PROPRIEDADES_ANIMADAS = ["opacity", "transform", "filter"];

/** Atraso do item `indice` de uma lista de `total`, em ms: o stagger do Motion, limitado ao teto. */
export function atrasoNaLista(indice, total, { passo, teto }) {
  const segundos = stagger(passo / 1000)(indice, total);
  return Math.min(Math.round(segundos * 1000), teto, ATRASO_MAXIMO);
}

/** Converte "600ms" ou "0.6s" em segundos; devolve o padrão se o valor não for um tempo. */
export function tempoEmSegundos(valor, padrao) {
  const achado = /^\s*(\d*\.?\d+)(ms|s)\s*$/.exec(valor || "");
  if (!achado) return padrao;
  return achado[2] === "ms" ? Number(achado[1]) / 1000 : Number(achado[1]);
}

/** Converte "cubic-bezier(a, b, c, d)" nos quatro números que o Motion aceita como curva. */
export function curvaCubica(valor, padrao) {
  const achado = /cubic-bezier\(([^)]+)\)/.exec(valor || "");
  const numeros = achado?.[1].split(",").map(Number);
  return numeros?.length === 4 && numeros.every(Number.isFinite) ? numeros : padrao;
}

/** Duração e curva da entrada vêm dos tokens de tokens.css (--duracao-lenta e --ease-out). */
function lerTokensDeMovimento(raiz) {
  const estilo = getComputedStyle(raiz.documentElement);
  return {
    duracao: tempoEmSegundos(estilo.getPropertyValue("--duracao-lenta"), 0.6),
    curva: curvaCubica(estilo.getPropertyValue("--ease-out"), [0.16, 1, 0.3, 1]),
  };
}

/** Marca os elementos que entram ao rolar e devolve o atraso (ms) de cada um. */
export function marcarRevelacao(raiz = document) {
  const atrasos = new Map();
  LISTAS.forEach((lista) => {
    raiz.querySelectorAll(lista.seletor).forEach((conteiner) => {
      const itens = [...conteiner.children];
      itens.forEach((item, indice) => atrasos.set(item, atrasoNaLista(indice, itens.length, lista)));
    });
  });
  raiz.querySelectorAll(AVULSOS).forEach((el) => atrasos.set(el, 0));
  atrasos.forEach((_, el) => el.classList.add("reveal"));
  return atrasos;
}

/**
 * Liga a revelação ao rolar. `animar` e `naVista` existem para os testes trocarem o animateMini e
 * o inView do Motion. Devolve uma função que para de vigiar.
 */
export function iniciarRevelar(raiz = document, { animar = animateMini, naVista = inView } = {}) {
  const html = raiz.documentElement;
  if (!("IntersectionObserver" in window)) {
    html.classList.remove("js");
    return () => {};
  }

  const atrasos = marcarRevelacao(raiz);
  const consultaReduzido =
    typeof window.matchMedia === "function" ? window.matchMedia(MOVIMENTO_REDUZIDO) : null;
  let reduzido = Boolean(consultaReduzido?.matches);
  const mudancas = new AbortController();
  consultaReduzido?.addEventListener("change", (evento) => (reduzido = evento.matches), {
    signal: mudancas.signal,
  });
  const { duracao, curva } = lerTokensDeMovimento(raiz);
  const revelados = new WeakSet();

  // Ao fim, o Motion grava o quadro final como estilo inline; ele sai junto com a entrada de is-in,
  // na mesma tarefa, para o hover dos cards voltar a valer sem disparar transição do CSS.
  function concluir(el) {
    el.classList.add("is-in");
    PROPRIEDADES_ANIMADAS.forEach((propriedade) => el.style.removeProperty(propriedade));
  }

  function revelar(el) {
    if (revelados.has(el)) return;
    revelados.add(el);
    if (reduzido) {
      concluir(el);
      return;
    }
    const quadros = el.classList.contains("section-title") ? QUADROS_TITULO : QUADROS_ENTRADA;
    try {
      animar(el, quadros, { duration: duracao, delay: atrasos.get(el) / 1000, ease: curva })
        .finished.then(() => concluir(el), () => concluir(el));
    } catch {
      concluir(el);
    }
  }

  const pararDeVigiar = naVista([...atrasos.keys()], (el) => revelar(el), { margin: "0px 0px -8% 0px" });
  return () => {
    mudancas.abort();
    pararDeVigiar?.();
  };
}
