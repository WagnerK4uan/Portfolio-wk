import { escapar } from "./escape.js";

function renderizarIcone(item) {
  if (item.icone) {
    return `<img class="skill-icone" src="${escapar(item.icone)}" alt="" width="24" height="24" loading="lazy" />`;
  }
  return `<i class="skill-icone ${escapar(item.iconeFa)}" aria-hidden="true"></i>`;
}

/** O destaque é visual (borda e marca); a legenda diz em texto quais itens são a stack atual. */
function renderizarItem(item) {
  const classe = item.atual ? "skill skill--atual" : "skill";
  const marca = item.atual ? `<span class="skill-marca" aria-hidden="true"></span>` : "";
  return `<li class="${classe}">${renderizarIcone(item)}<span class="skill-nome">${escapar(item.nome)}</span>${marca}</li>`;
}

function renderizarLegenda(grupos) {
  const atuais = grupos.flatMap((grupo) => grupo.itens).filter((item) => item.atual).map((item) => item.nome);
  if (!atuais.length) return "";
  const lista = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" }).format(atuais);
  return `<p class="skill-legenda"><span class="skill-marca" aria-hidden="true"></span>Em destaque, a stack do meu trabalho atual na Bruning Sistemas: ${escapar(lista)}.</p>`;
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
  const itens = grupo.itens.map(renderizarItem).join("\n");
  return `<div class="skill-group">
  <h3 class="skill-group-title" id="${id}">${escapar(grupo.titulo)}</h3>
  <ul class="skills-grid" aria-labelledby="${id}">
${itens}
  </ul>
</div>`;
}

/**
 * HTML das habilidades: a legenda da stack atual e um grupo com título por área, na ordem do
 * arquivo de dados.
 */
export function renderizarHabilidades(grupos) {
  return `${renderizarLegenda(grupos)}\n<div class="skill-groups">\n${grupos.map(renderizarGrupo).join("\n")}\n</div>`;
}
