/**
 * Canais de contato exibidos em #contato e no rodapé, na ordem da página.
 *
 * Formato de cada item:
 *   rede     nome do canal (rótulo visível e nome acessível do ícone no rodapé)
 *   texto    endereço legível mostrado em #contato
 *   href     destino do link
 *   iconeFa  classes de ícone locais (src/styles/icones.css)
 *   externo  true abre em nova aba (com rel="noopener")
 */
export const contatos = [
  {
    rede: "E-mail",
    texto: "w.kauanmachado@gmail.com",
    href: "mailto:w.kauanmachado@gmail.com",
    iconeFa: "fas fa-envelope",
    externo: false,
  },
  {
    rede: "LinkedIn",
    texto: "linkedin.com/in/wagner-kauan",
    href: "https://www.linkedin.com/in/wagner-kauan/",
    iconeFa: "fab fa-linkedin-in",
    externo: true,
  },
  {
    rede: "GitHub",
    texto: "github.com/WagnerK4uan",
    href: "https://github.com/WagnerK4uan",
    iconeFa: "fab fa-github",
    externo: true,
  },
  {
    rede: "Instagram",
    texto: "@_wagnerkauan",
    href: "https://www.instagram.com/_wagnerkauan/",
    iconeFa: "fab fa-instagram",
    externo: true,
  },
];
