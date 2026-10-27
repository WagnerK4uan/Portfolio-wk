/*
 * Gera a imagem de compartilhamento (Open Graph) a partir do hero do site.
 *
 * Roda à mão, fora do build:
 *   npm run build
 *   node scripts/og.mjs [url]
 * Sem url, sobe o `vite preview` do dist/ numa porta livre e o encerra no fim.
 *
 * Abre a página numa janela de 1200×630 (escala 1), com movimento reduzido para o hero aparecer no
 * estado final, espera as fontes e as animações terminarem e grava public/img/og.png com o recorte
 * 0,0,1200,630. Se o PNG passar de LIMITE_BYTES, o sharp o recomprime em paleta. A imagem gerada é
 * versionada; o build só a copia de public/.
 *
 * O Playwright não é dependência do projeto: vem do gstack (o mesmo motor do /browse), ou do
 * caminho em PLAYWRIGHT_MODULE.
 */
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { preview } from "vite";

const modulo =
  process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), ".claude/skills/gstack/node_modules/playwright");
const { chromium } = createRequire(import.meta.url)(modulo);

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = path.join(raiz, "public", "img", "og.png");

const LARGURA = 1200;
const ALTURA = 630;
const LIMITE_BYTES = 300 * 1024;
const ESPERA_ANIMACOES = 1200;

let servidor;
let url = process.argv[2];
if (!url) {
  servidor = await preview({ root: raiz, preview: { port: 0, strictPort: false }, logLevel: "warn" });
  url = servidor.resolvedUrls.local[0];
}

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage({
    viewport: { width: LARGURA, height: ALTURA },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await pagina.goto(url, { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(ESPERA_ANIMACOES);
  await pagina.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animacao) => Number.isFinite(animacao.effect?.getComputedTiming().endTime))
        .map((animacao) => animacao.finished),
    ),
  );

  let png = await pagina.screenshot({ clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  if (png.length > LIMITE_BYTES) {
    png = await sharp(png).png({ palette: true, compressionLevel: 9, effort: 10 }).toBuffer();
  }
  if (png.length > LIMITE_BYTES) throw new Error(`og.png ficou com ${png.length} bytes, acima de ${LIMITE_BYTES}.`);

  await writeFile(destino, png);
  const { width, height } = await sharp(png).metadata();
  console.log(`public/img/og.png: ${width}x${height}, ${(png.length / 1024).toFixed(1)} KB`);
} finally {
  await navegador.close();
  await servidor?.close();
}
