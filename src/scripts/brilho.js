/* ============================================
   MOVIMENTO: brilho que segue o ponteiro (Spec 7)
   No hero e nos cards de projeto, um gradiente violeta acompanha o ponteiro. Este módulo só
   escreve a posição em --mx e --my, no máximo uma vez por quadro (requestAnimationFrame); o
   desenho e o fade são do CSS (src/styles/movimento.css), que só mostra o brilho em quem tem a
   classe tem-brilho. Em toque, em ponteiro grosso ou sob prefers-reduced-motion: reduce o
   listener nem é registrado e nada muda. Se o visitante liga "reduzir movimento" com a página
   aberta, o change do matchMedia remove o listener; se desliga, o brilho volta.
   ============================================ */

const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";
const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

/** Elementos que recebem o brilho. */
export const ALVOS_DO_BRILHO = ".hero, .project-card";

/** O brilho só existe com mouse ou trackpad (hover fino) e sem pedido de movimento reduzido. */
export function podeBrilhar() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(PONTEIRO_FINO).matches && !window.matchMedia(MOVIMENTO_REDUZIDO).matches;
}

function seguirPonteiro(alvo, signal) {
  let quadroPendente = false;
  let x = 0;
  let y = 0;

  function escrever() {
    quadroPendente = false;
    const caixa = alvo.getBoundingClientRect();
    alvo.style.setProperty("--mx", `${Math.round(x - caixa.left)}px`);
    alvo.style.setProperty("--my", `${Math.round(y - caixa.top)}px`);
  }

  alvo.classList.add("tem-brilho");
  alvo.addEventListener(
    "pointermove",
    (evento) => {
      x = evento.clientX;
      y = evento.clientY;
      if (quadroPendente) return;
      quadroPendente = true;
      requestAnimationFrame(escrever);
    },
    { passive: true, signal },
  );
}

/**
 * Liga o brilho em cada alvo da raiz, se o dispositivo pede, e acompanha as mudanças de
 * preferência com a página aberta. Devolve uma função que desfaz tudo (usada nos testes).
 */
export function iniciarBrilho(raiz = document) {
  let ouvintes = null;

  function desligar() {
    if (!ouvintes) return;
    ouvintes.abort();
    raiz.querySelectorAll(ALVOS_DO_BRILHO).forEach((alvo) => alvo.classList.remove("tem-brilho"));
    ouvintes = null;
  }

  function sincronizar() {
    if (podeBrilhar() === Boolean(ouvintes)) return;
    if (!podeBrilhar()) {
      desligar();
      return;
    }
    ouvintes = new AbortController();
    raiz.querySelectorAll(ALVOS_DO_BRILHO).forEach((alvo) => seguirPonteiro(alvo, ouvintes.signal));
  }

  sincronizar();
  if (typeof window.matchMedia !== "function") return desligar;

  const mudancas = new AbortController();
  [PONTEIRO_FINO, MOVIMENTO_REDUZIDO].forEach((consulta) =>
    window.matchMedia(consulta).addEventListener("change", sincronizar, { signal: mudancas.signal }),
  );
  return () => {
    mudancas.abort();
    desligar();
  };
}
