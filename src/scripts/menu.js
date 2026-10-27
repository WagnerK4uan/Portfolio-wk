/* ============================================
   MENU MOBILE
   Abaixo de 768 px o CSS recolhe a lista de seções atrás do botão de menu. Este módulo só cuida
   do estado: aria-expanded, foco no primeiro link ao abrir, Esc fecha e devolve o foco ao botão,
   clicar num link fecha. Com o menu aberto, a classe is-menu-aberto em <html> trava a rolagem da
   página (navegacao.css); todo fechamento a retira antes de o navegador seguir o link âncora.
   Sem JavaScript o botão some e a lista fica sempre visível.
   ============================================ */

const LARGURA_DESKTOP = "(min-width: 48rem)";
export const CLASSE_ROLAGEM_TRAVADA = "is-menu-aberto";

/**
 * Liga o botão `header button[aria-controls]` ao elemento que ele controla.
 * Devolve uma função que desfaz os ouvintes (usada nos testes).
 */
export function iniciarMenu(raiz = document) {
  const header = raiz.querySelector("header");
  const botao = header?.querySelector("button[aria-controls]");
  const menu = botao && raiz.getElementById(botao.getAttribute("aria-controls"));
  if (!botao || !menu) return () => {};
  const html = raiz.documentElement ?? document.documentElement;

  const ouvintes = new AbortController();
  const { signal } = ouvintes;

  const estaAberto = () => botao.getAttribute("aria-expanded") === "true";

  function definirAberto(aberto) {
    botao.setAttribute("aria-expanded", String(aberto));
    menu.classList.toggle("is-open", aberto);
    header.classList.toggle("is-menu-open", aberto);
    html.classList.toggle(CLASSE_ROLAGEM_TRAVADA, aberto);
  }

  function abrir() {
    definirAberto(true);
    menu.querySelector("a[href]")?.focus();
  }

  function fechar({ devolverFoco = false } = {}) {
    if (!estaAberto()) return;
    definirAberto(false);
    if (devolverFoco) botao.focus();
  }

  definirAberto(false);

  botao.addEventListener("click", () => (estaAberto() ? fechar() : abrir()), { signal });

  menu.addEventListener(
    "click",
    (evento) => {
      if (evento.target.closest("a[href]")) fechar();
    },
    { signal },
  );

  raiz.addEventListener(
    "keydown",
    (evento) => {
      if (evento.key === "Escape" && estaAberto()) {
        evento.preventDefault();
        fechar({ devolverFoco: true });
      }
    },
    { signal },
  );

  // Tab para fora do header fecha o painel, para ele não cobrir o conteúdo que recebe o foco.
  header.addEventListener(
    "focusout",
    (evento) => {
      if (evento.relatedTarget && !header.contains(evento.relatedTarget)) fechar();
    },
    { signal },
  );

  // Ao passar para a largura de desktop, a lista volta a ser a navegação em linha.
  const desktop = typeof window.matchMedia === "function" ? window.matchMedia(LARGURA_DESKTOP) : null;
  desktop?.addEventListener("change", (evento) => evento.matches && fechar(), { signal });

  return () => {
    ouvintes.abort();
    html.classList.remove(CLASSE_ROLAGEM_TRAVADA);
  };
}
