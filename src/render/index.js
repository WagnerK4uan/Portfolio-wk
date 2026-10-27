import { projetos } from "../data/projetos.js";
import { experiencia } from "../data/experiencia.js";
import { habilidades } from "../data/habilidades.js";
import { contatos } from "../data/contatos.js";
import { renderizarProjetos } from "./projetos.js";
import { renderizarExperiencia } from "./experiencia.js";
import { renderizarHabilidades } from "./habilidades.js";
import { renderizarContatos, renderizarContatosDoRodape } from "./contatos.js";

/** Marcadores aceitos em index.html (<!-- render:nome -->) e o HTML que cada um gera. */
export const renderizadores = {
  projetos: () => renderizarProjetos(projetos),
  experiencia: () => renderizarExperiencia(experiencia),
  habilidades: () => renderizarHabilidades(habilidades),
  contatos: () => renderizarContatos(contatos),
  "contatos-rodape": () => renderizarContatosDoRodape(contatos),
};

const MARCADOR = /<!--\s*render:([\w-]+)\s*-->/g;

/**
 * Troca cada <!-- render:nome --> pelo HTML do renderizador correspondente.
 * Marcador desconhecido é erro: o build falha em vez de publicar a página sem a seção.
 */
export function renderizarMarcadores(html, mapa = renderizadores) {
  return html.replace(MARCADOR, (_marcador, nome) => {
    const renderizar = mapa[nome];
    if (!renderizar) throw new Error(`Marcador de render desconhecido: render:${nome}`);
    return renderizar();
  });
}
