import { atributosDeLink, escapar, textoComCodigo } from "./escape.js";

function renderizarLinkDoProjeto(projeto) {
  if (projeto.privado) {
    return `<span class="project-link project-link--private"><i class="fas fa-lock" aria-hidden="true"></i> Repositório privado</span>`;
  }
  return `<a href="${escapar(projeto.repositorio)}"${atributosDeLink(true)} class="project-link"><i class="fab fa-github" aria-hidden="true"></i> Repositório</a>`;
}

/**
 * O HTML mostra só o poster (quadro estático leve). O preview animado fica em data-animado e só
 * entra no src pelo hover ou foco do card (src/scripts/projetos.js).
 */
function renderizarPreview(projeto) {
  const { poster } = projeto;
  return `<img src="${escapar(poster.src)}" data-animado="${escapar(projeto.animado)}" alt="${escapar(poster.alt)}" class="project-preview" width="${escapar(poster.largura)}" height="${escapar(poster.altura)}" loading="lazy" decoding="async" />`;
}

function renderizarProjeto(projeto) {
  const classe = projeto.destaque ? "project-card project--destaque" : "project-card";
  const tags = projeto.tags.map((tag) => `<li>${escapar(tag)}</li>`).join("");
  return `<article class="${classe}">
  <div class="project-media">${renderizarPreview(projeto)}</div>
  <div class="project-card-body">
    <h3>${escapar(projeto.titulo)}</h3>
    <p>${textoComCodigo(projeto.descricao)}</p>
    <ul class="project-tags" aria-label="Tecnologias">${tags}</ul>
    <div class="project-links">${renderizarLinkDoProjeto(projeto)}</div>
  </div>
</article>`;
}

/** Os projetos de destaque primeiro, depois os demais; cada grupo mantém a ordem recebida. */
export function ordenarProjetos(projetos) {
  return [...projetos.filter((projeto) => projeto.destaque), ...projetos.filter((projeto) => !projeto.destaque)];
}

/** HTML da grade de projetos: um <article> por projeto, na ordem de ordenarProjetos. */
export function renderizarProjetos(projetos) {
  return `<div class="projects-grid">\n${ordenarProjetos(projetos).map(renderizarProjeto).join("\n")}\n</div>`;
}
