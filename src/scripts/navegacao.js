/* ============================================
   NAVEGAÇÃO: link da seção atual e header rolado
   Movido de src/main.js sem mudar o comportamento (Spec 4).
   ============================================ */

/**
 * Marca na navegação o link da seção visível (classe is-active e aria-current). O hero (#home) não
 * tem link no menu, mas também é observado: quando ele cruza a linha de leitura, nenhum link fica
 * marcado, então voltar ao topo desmarca a última seção visitada.
 */
export function marcarLinkAtivo(raiz = document) {
  const links = raiz.querySelectorAll('nav a[href^="#"]');
  const secoes = Array.prototype.map.call(links, (link) => raiz.querySelector(link.getAttribute("href")));
  const hero = raiz.querySelector("#home");
  if (hero && !secoes.includes(hero)) secoes.push(hero);

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        links.forEach((link) => {
          const ativo = link.getAttribute("href") === "#" + entrada.target.id;
          link.classList.toggle("is-active", ativo);
          if (ativo) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  secoes.forEach((secao) => {
    if (secao) observador.observe(secao);
  });
}

/**
 * O header ganha fundo translúcido (is-scrolled) assim que a página sai do topo do hero: o alvo é
 * a sentinela de 1px no topo de #home, então nenhum conteúdo passa sob o header transparente.
 * Sem a sentinela, cai no comportamento antigo (o conteúdo do hero inteiro sair de vista).
 */
export function marcarHeaderRolado(raiz = document) {
  const header = raiz.querySelector("header");
  const hero = raiz.querySelector(".hero");
  if (!header || !hero) return;

  const sentinela = hero.querySelector(".hero-sentinela");
  new IntersectionObserver(
    (entradas) => {
      header.classList.toggle("is-scrolled", !entradas[0].isIntersecting);
    },
    { rootMargin: sentinela ? "0px" : "-80px 0px 0px 0px" },
  ).observe(sentinela || hero.querySelector(".hero-content") || hero);
}

export function iniciarNavegacao(raiz = document) {
  if (!("IntersectionObserver" in window)) return;
  marcarHeaderRolado(raiz);
  marcarLinkAtivo(raiz);
}
