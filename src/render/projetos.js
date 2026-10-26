import { atributosDeLink, escapar, textoComCodigo } from "./escape.js";

function renderizarLinkDoProjeto(projeto) {
  if (projeto.privado) {
    return `<span class="project-link project-link--private"><i class="fas fa-lock" aria-hidden="true"></i> Repositório privado</span>`;
  }
  return `<a href="${escapar(projeto.repositorio)}"${atributosDeLink(true)} class="project-link"><i class="fab fa-github" aria-hidden="true"></i> Repositório</a>`;
}

function renderizarProjeto(projeto) {
  const { preview } = projeto;
  const tags = projeto.tags.map((tag) => `<span>${escapar(tag)}</span>`).join("");
  return `<article class="project-card">
  <img src="${escapar(preview.src)}" alt="${escapar(preview.alt)}" class="project-preview" width="${escapar(preview.largura)}" height="${escapar(preview.altura)}" loading="lazy" decoding="async" />
  <div class="project-card-body">
    <h3>${escapar(projeto.titulo)}</h3>
    <p>${textoComCodigo(projeto.descricao)}</p>
    <div class="project-tags">${tags}</div>
    <div class="project-links">${renderizarLinkDoProjeto(projeto)}</div>
  </div>
</article>`;
}

/** HTML da grade de projetos: um <article> por projeto, na ordem do arquivo de dados. */
export function renderizarProjetos(projetos) {
  return `<div class="projects-grid">\n${projetos.map(renderizarProjeto).join("\n")}\n</div>`;
}
