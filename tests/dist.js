import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const raizDoProjeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const pastaDist = path.join(raizDoProjeto, "dist");
export const caminhoIndexDist = path.join(pastaDist, "index.html");

export function lerIndexDist() {
  if (!existsSync(caminhoIndexDist)) {
    throw new Error("dist/index.html não existe: rode `npm run build` antes dos testes.");
  }
  return readFileSync(caminhoIndexDist, "utf8");
}

export function carregarIndexDist() {
  return new DOMParser().parseFromString(lerIndexDist(), "text/html");
}

/** Converte um caminho do HTML (relativo ou absoluto à raiz do site) para o arquivo em dist/. */
export function arquivoNoDist(caminhoNoHtml) {
  const semConsulta = caminhoNoHtml.split(/[?#]/)[0];
  const relativo = decodeURI(semConsulta).replace(/^\.?\//, "");
  return path.join(pastaDist, relativo);
}

/** Lê o CSS local (com hash, em dist/assets/) que o dist/index.html referencia. */
export function lerCssDoIndexDist() {
  const html = lerIndexDist();
  const locais = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((href) => !/^https?:/.test(href));
  if (locais.length !== 1) throw new Error(`Esperado 1 CSS local em dist/index.html, achados ${locais.length}.`);
  return readFileSync(arquivoNoDist(locais[0]), "utf8");
}

/** Anexa ao document.head um <style> com o CSS do build e retorna a CSSStyleSheet dele. */
export function injetarCssDoIndexDist() {
  const estilo = document.createElement("style");
  estilo.textContent = lerCssDoIndexDist();
  document.head.appendChild(estilo);
  return estilo.sheet;
}

/** Regras de estilo do CSS do build cujo seletor tem exatamente esta parte, em qualquer media. */
export function regrasDe(folha, seletor) {
  const percorrer = (regras) =>
    [...regras].flatMap((regra) => {
      if (regra.cssRules && !regra.selectorText) return percorrer(regra.cssRules);
      if (regra.selectorText?.split(",").map((parte) => parte.trim()).includes(seletor)) return [regra.style];
      return [];
    });
  return percorrer(folha.cssRules);
}
