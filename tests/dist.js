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
