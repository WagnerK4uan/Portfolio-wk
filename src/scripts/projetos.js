/* ============================================
   PREVIEW DOS PROJETOS
   O HTML nasce com o poster (quadro estático leve) no src de cada imagem de projeto e o preview
   animado em data-animado. Este módulo troca para o animado quando o visitante demonstra interesse
   no card (pointerenter ou focusin) e volta ao poster na saída (pointerleave ou focusout).
   Só age em telas com (hover: hover) e sem prefers-reduced-motion: reduce; as consultas são lidas
   a cada evento, então mudar a preferência com a página aberta já vale na próxima interação.
   Sem JavaScript o poster fica, e o card continua legível.
   ============================================ */

const COM_HOVER = "(hover: hover)";
const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

/** O preview animado só carrega com ponteiro que tem hover e sem pedido de movimento reduzido. */
function podeAnimar() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(COM_HOVER).matches && !window.matchMedia(MOVIMENTO_REDUZIDO).matches;
}

function ligarCard(card, signal) {
  const imagem = card.querySelector("img[data-animado]");
  if (!imagem) return;
  const poster = imagem.getAttribute("src");
  const animado = imagem.dataset.animado;

  const mostrarAnimado = () => {
    if (podeAnimar() && imagem.getAttribute("src") !== animado) imagem.setAttribute("src", animado);
  };
  const mostrarPoster = () => {
    if (imagem.getAttribute("src") !== poster) imagem.setAttribute("src", poster);
  };

  card.addEventListener("pointerenter", mostrarAnimado, { signal });
  card.addEventListener("pointerleave", mostrarPoster, { signal });
  card.addEventListener("focusin", mostrarAnimado, { signal });
  card.addEventListener(
    "focusout",
    (evento) => {
      // Foco que passa para outro elemento do mesmo card não é saída.
      if (!card.contains(evento.relatedTarget)) mostrarPoster();
    },
    { signal },
  );
}

/**
 * Liga a troca de preview em cada `.project-card` da raiz.
 * Devolve uma função que desfaz os ouvintes (usada nos testes).
 */
export function iniciarProjetos(raiz = document) {
  const ouvintes = new AbortController();
  raiz.querySelectorAll(".project-card").forEach((card) => ligarCard(card, ouvintes.signal));
  return () => ouvintes.abort();
}
