/*
 * Roteiro de navegador da Spec 5: CA-5.4 em layout real (sem rolagem horizontal e nenhum nome de
 * habilidade cortado em 320, 768 e 1440 px), mais a conferência das duas seções sem JavaScript e
 * sob movimento reduzido, com screenshots por largura.
 *
 * Não roda no `npm test` (o jsdom não mede layout). Uso:
 *   npm run build && npm run preview -- --port 4173 --strictPort
 *   node tests/roteiros/experiencia-habilidades-navegador.mjs [url] [pasta-dos-screenshots]
 *
 * O Playwright não é dependência do projeto: vem do gstack (o mesmo motor do /browse), ou do
 * caminho em PLAYWRIGHT_MODULE. Sai com código 1 se alguma checagem falhar.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://localhost:4173/";
const pasta = path.resolve(process.argv[3] || ".gstack/spec5");
const modulo =
  process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), ".claude/skills/gstack/node_modules/playwright");
const { chromium } = createRequire(import.meta.url)(modulo);

const LARGURAS = [
  { largura: 320, altura: 568 },
  { largura: 768, altura: 1024 },
  { largura: 1440, altura: 900 },
];
const SECOES = ["experiencia", "habilidades"];

const falhas = [];
function conferir(rotulo, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${rotulo}${detalhe ? ` · ${detalhe}` : ""}`);
  if (!ok) falhas.push(rotulo);
}

/** Espera transições e animações em curso terminarem, por evento delas mesmas. */
async function esperarAnimacoes(pagina) {
  await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished)));
}

/**
 * Rola a seção de ponta a ponta para a revelação ao rolar (main.js) marcar cada item, esperando
 * por condição: todo .reveal da seção com is-in. Sem IntersectionObserver ou sem JS, não há .reveal.
 */
async function revelarSecao(pagina, id) {
  await pagina.evaluate(async (idDaSecao) => {
    const secao = document.getElementById(idDaSecao);
    const quadro = () => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));
    const topo = secao.getBoundingClientRect().top + scrollY;
    for (let y = topo - innerHeight / 2; y < topo + secao.offsetHeight; y += innerHeight / 2) {
      scrollTo({ top: y, behavior: "instant" });
      await quadro();
    }
    secao.scrollIntoView({ behavior: "instant" });
    await quadro();
  }, id);
  await pagina.waitForFunction(
    (idDaSecao) => [...document.querySelectorAll(`#${idDaSecao} .reveal`)].every((el) => el.classList.contains("is-in")),
    id,
    { timeout: 5000 },
  );
  await esperarAnimacoes(pagina);
}

/** Medidas de CA-5.4 na página inteira e em cada item das duas seções. */
function medirLayout(pagina) {
  return pagina.evaluate(() => {
    const cortados = (seletor) =>
      [...document.querySelectorAll(seletor)]
        .filter((el) => el.scrollWidth > el.clientWidth)
        .map((el) => `${el.textContent.trim()} (${el.scrollWidth}/${el.clientWidth})`);
    const foraDaTela = (seletor) =>
      [...document.querySelectorAll(seletor)]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.left < 0 || r.right > document.documentElement.clientWidth;
        })
        .map((el) => el.textContent.trim().slice(0, 40));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      itensDeHabilidade: document.querySelectorAll("#habilidades .skill").length,
      skillsCortados: cortados("#habilidades .skill"),
      nomesCortados: cortados("#habilidades .skill-nome"),
      experienciaCortada: cortados("#experiencia .experience-item, #experiencia .experience-item > *"),
      foraDaTela: foraDaTela("#habilidades .skill, #experiencia .experience-item, #experiencia .experience-item > *"),
    };
  });
}

function conferirLayout(rotulo, medida) {
  conferir(`${rotulo} sem rolagem horizontal`, medida.scrollWidth <= medida.clientWidth,
    `scrollWidth ${medida.scrollWidth} / clientWidth ${medida.clientWidth}`);
  conferir(`${rotulo} 25 itens de habilidade medidos`, medida.itensDeHabilidade === 25, `${medida.itensDeHabilidade}`);
  conferir(`${rotulo} nenhum .skill cortado (scrollWidth <= clientWidth)`, medida.skillsCortados.length === 0,
    medida.skillsCortados.join(", "));
  conferir(`${rotulo} nenhum nome de habilidade cortado`, medida.nomesCortados.length === 0,
    medida.nomesCortados.join(", "));
  conferir(`${rotulo} nenhum bloco da experiência cortado`, medida.experienciaCortada.length === 0,
    medida.experienciaCortada.join(", "));
  conferir(`${rotulo} nada das duas seções sai da tela`, medida.foraDaTela.length === 0, medida.foraDaTela.join(", "));
}

mkdirSync(pasta, { recursive: true });
const navegador = await chromium.launch();

try {
  // CA-5.4 · com JavaScript, depois da revelação ao rolar
  for (const { largura, altura } of LARGURAS) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await pagina.evaluate(() => document.fonts.ready);
    await esperarAnimacoes(pagina);

    for (const id of SECOES) {
      await revelarSecao(pagina, id);
      await pagina.locator(`#${id}`).screenshot({ path: path.join(pasta, `${id}-${largura}.png`) });
    }
    conferirLayout(`CA-5.4 · ${largura}×${altura}`, await medirLayout(pagina));
    await contexto.close();
  }

  // CA-5.4 · sem JavaScript: o conteúdo nasce visível e o layout continua sem quebra
  for (const { largura, altura } of [LARGURAS[0], LARGURAS[2]]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, javaScriptEnabled: false });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await pagina.evaluate(() => document.fonts.ready);
    const visivel = await pagina.evaluate(() =>
      ["#experiencia .experience-item", "#habilidades .skill"].every((seletor) =>
        [...document.querySelectorAll(seletor)].every((el) => getComputedStyle(el).opacity === "1"),
      ),
    );
    conferir(`Sem JS · ${largura}px itens das duas seções visíveis`, visivel);
    conferirLayout(`CA-5.4 · sem JS ${largura}×${altura}`, await medirLayout(pagina));
    await pagina.locator("#experiencia").screenshot({ path: path.join(pasta, `experiencia-${largura}-sem-js.png`) });
    await contexto.close();
  }

  // Movimento reduzido: depois de revelado, nada fica deslocado nas duas seções
  {
    const contexto = await navegador.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: "reduce" });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    for (const id of SECOES) await revelarSecao(pagina, id);
    const deslocados = await pagina.evaluate(() =>
      [...document.querySelectorAll("#experiencia *, #habilidades *")]
        .filter((el) => getComputedStyle(el).transform !== "none" || getComputedStyle(el).opacity !== "1")
        .map((el) => el.className || el.tagName),
    );
    conferir("Movimento reduzido · 768px nada deslocado ou transparente nas duas seções", deslocados.length === 0,
      deslocados.join(", "));
    await pagina.locator("#habilidades").screenshot({ path: path.join(pasta, "habilidades-768-movimento-reduzido.png") });
    await contexto.close();
  }
} finally {
  await navegador.close();
}

console.log(falhas.length ? `\n${falhas.length} falha(s)` : "\nTudo verde");
process.exit(falhas.length ? 1 : 0);
