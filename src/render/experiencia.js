import { escapar } from "./escape.js";

function ano(valor) {
  const texto = escapar(valor);
  return `<time datetime="${texto}">${texto}</time>`;
}

/** "2023 a 2024", "2024 · atual", "2026 · em andamento" ou só a situação, quando não há ano. */
function renderizarPeriodo(periodo) {
  if (!periodo) return "";
  const partes = [];
  if (periodo.inicio && periodo.fim) partes.push(`${ano(periodo.inicio)} a ${ano(periodo.fim)}`);
  else if (periodo.inicio) partes.push(ano(periodo.inicio));
  if (periodo.situacao) partes.push(`<span class="experience-situacao">${escapar(periodo.situacao)}</span>`);
  return `<p class="experience-periodo">${partes.join(" · ")}</p>`;
}

function renderizarMarcos(marcos = []) {
  if (!marcos.length) return "";
  const texto = marcos.map((marco) => `${escapar(marco.rotulo)} ${ano(marco.ano)}`).join(" · ");
  return `<p class="experience-marcos">${texto}</p>`;
}

function renderizarLista(itens = [], classe, rotulo = "") {
  if (!itens.length) return "";
  const atributo = rotulo ? ` aria-label="${escapar(rotulo)}"` : "";
  return `<ul class="${classe}"${atributo}>${itens.map((item) => `<li>${escapar(item)}</li>`).join("")}</ul>`;
}

function renderizarItem(item) {
  const atual = item.periodo?.situacao === "atual";
  const titulo = item.organizacao ?? item.papel;
  const cargo = item.organizacao ? `<p class="experience-cargo">${escapar(item.papel)}</p>` : "";
  const descricao = item.descricao ? `<p class="experience-descricao">${escapar(item.descricao)}</p>` : "";
  const partes = [
    `<h3 class="experience-titulo">${escapar(titulo)}</h3>`,
    cargo,
    renderizarPeriodo(item.periodo),
    renderizarMarcos(item.marcos),
    renderizarLista(item.frentes, "experience-frentes"),
    descricao,
    renderizarLista(item.tecnologias, "experience-stack", "Tecnologias"),
  ].filter(Boolean);
  const classe = atual ? "experience-item experience-item--atual" : "experience-item";
  return `<li class="${classe}">\n${partes.join("\n")}\n</li>`;
}

/** HTML da linha do tempo de #experiencia: uma lista ordenada, um item por bloco. */
export function renderizarExperiencia(itens) {
  return `<ol class="experience-list">\n${itens.map(renderizarItem).join("\n")}\n</ol>`;
}
