const ENTIDADES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapa texto para uso seguro em conteúdo de elemento ou valor de atributo entre aspas. */
export function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ENTIDADES[caractere]);
}

/** Escapa o texto e transforma trechos entre crases em <code>. Nenhuma outra marcação passa. */
export function textoComCodigo(valor) {
  return escapar(valor).replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** O texto que o leitor vê depois de textoComCodigo: as crases somem. */
export function textoSemMarcacao(valor) {
  return String(valor).replace(/`([^`]+)`/g, "$1");
}

/** Atributos de link externo: nova aba sempre com noopener. */
export function atributosDeLink(externo) {
  return externo ? ' target="_blank" rel="noopener"' : "";
}
