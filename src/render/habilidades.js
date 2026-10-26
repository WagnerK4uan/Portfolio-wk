import { escapar } from "./escape.js";

function renderizarIcone(item) {
  if (item.icone) {
    return `<img src="${escapar(item.icone)}" alt="" width="44" height="44" loading="lazy" />`;
  }
  return `<i class="${escapar(item.iconeFa)}" aria-hidden="true"></i>`;
}

function idDoGrupo(titulo) {
  const slug = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `habilidades-${slug}`;
}

function renderizarGrupo(grupo) {
  const id = idDoGrupo(grupo.titulo);
  const itens = grupo.itens
    .map((item) => `<li class="skill">${renderizarIcone(item)}<span>${escapar(item.nome)}</span></li>`)
    .join("\n");
  return `<div class="skill-group">
  <h3 class="skill-group-title" id="${id}">${escapar(grupo.titulo)}</h3>
  <ul class="skills-grid" aria-labelledby="${id}">
${itens}
  </ul>
</div>`;
}

/** HTML das habilidades: um grupo com título por área, na ordem do arquivo de dados. */
export function renderizarHabilidades(grupos) {
  return `<div class="skill-groups">\n${grupos.map(renderizarGrupo).join("\n")}\n</div>`;
}
