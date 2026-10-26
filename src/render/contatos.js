import { atributosDeLink, escapar } from "./escape.js";

/** Lista de contatos de #contato: ícone, nome do canal e endereço legível. */
export function renderizarContatos(contatos) {
  const itens = contatos
    .map(
      (contato) => `<li><a class="contact-link" href="${escapar(contato.href)}"${atributosDeLink(contato.externo)}>
  <i class="${escapar(contato.iconeFa)}" aria-hidden="true"></i>
  <span class="contact-rede">${escapar(contato.rede)}</span>
  <span class="contact-texto">${escapar(contato.texto)}</span>
</a></li>`,
    )
    .join("\n");
  return `<ul class="contact-list">\n${itens}\n</ul>`;
}

/** Ícones de contato do rodapé: o nome do canal fica no aria-label. */
export function renderizarContatosDoRodape(contatos) {
  const itens = contatos
    .map(
      (contato) =>
        `<li><a href="${escapar(contato.href)}"${atributosDeLink(contato.externo)} aria-label="${escapar(contato.rede)}"><i class="${escapar(contato.iconeFa)}" aria-hidden="true"></i></a></li>`,
    )
    .join("\n");
  return `<ul class="footer-social">\n${itens}\n</ul>`;
}
