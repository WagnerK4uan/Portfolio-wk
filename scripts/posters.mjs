/*
 * Gera os quadros estáticos (posters) dos previews animados dos projetos.
 *
 * Roda à mão, fora do build:  node scripts/posters.mjs
 *
 * Para cada projeto de src/data/projetos.js, lê o primeiro quadro do preview animado (`animado`,
 * webp ou gif em public/) e grava `poster.src` (public/img/posters/<projeto>.webp). A largura fica
 * na do original, limitada a LARGURA_MAXIMA; a qualidade desce de QUALIDADES até o arquivo caber em
 * LIMITE_BYTES. Os posters gerados são versionados; o build só os copia de public/.
 * Ao fim imprime a largura e a altura de cada poster, para conferir com `poster` nos dados.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { projetos } from "../src/data/projetos.js";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaPublica = path.join(raiz, "public");

export const LIMITE_BYTES = 150 * 1024;
const LARGURA_MAXIMA = 720;
const QUALIDADES = [82, 74, 66, 58, 50, 42];

/** Primeiro quadro do arquivo animado, redimensionado e em webp, no menor custo que caiba no limite. */
async function gerarPoster(origem) {
  // Os GIFs antigos passam do limite de pixels padrão do sharp somando os quadros; só o 1º é lido.
  const base = sharp(origem, { pages: 1, page: 0, limitInputPixels: false })
    .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true });
  for (const qualidade of QUALIDADES) {
    const { data, info } = await base.clone().webp({ quality: qualidade, effort: 6 }).toBuffer({ resolveWithObject: true });
    if (data.length <= LIMITE_BYTES) return { data, info, qualidade };
  }
  throw new Error(`Poster de ${origem} não coube em ${LIMITE_BYTES} bytes.`);
}

for (const projeto of projetos) {
  const origem = path.join(pastaPublica, projeto.animado);
  const destino = path.join(pastaPublica, projeto.poster.src);
  const { data, info, qualidade } = await gerarPoster(origem);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, data);
  console.log(
    `${projeto.poster.src}: ${info.width}x${info.height}, ${(data.length / 1024).toFixed(1)} KB, qualidade ${qualidade}`,
  );
}
