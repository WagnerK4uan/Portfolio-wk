/*
 * Roteiro de navegador da Spec 7 (passo 9): rola a página inteira em 375 e 1440 px, com e sem
 * movimento reduzido, mede as tarefas longas (> 50 ms) com PerformanceObserver e confere que, ao
 * fim, todo o conteúdo está visível. Também registra o que anima durante a rolagem: sem preferência,
 * as entradas do Motion (opacity, transform, filter); sob reduce, só transições de opacity de até
 * 200 ms e nenhuma animação do Motion. Em 1440 px passa o ponteiro no hero e num card para conferir
 * o brilho (--mx/--my); em 375 px com toque, o brilho não existe. A 375 px roda também com a CPU
 * 4× mais lenta (CDP), como um celular modesto.
 *
 * Não roda no `npm test` (o jsdom não pinta nem mede). Uso:
 *   npm run build
 *   node tests/roteiros/movimento-navegador.mjs [url] [pasta-dos-screenshots]
 * Sem url, sobe o `vite preview` do dist/ numa porta livre e o encerra no fim.
 *
 * O Playwright não é dependência do projeto: vem do gstack (o mesmo motor do /browse), ou do
 * caminho em PLAYWRIGHT_MODULE. Sai com código 1 se alguma checagem falhar.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { preview } from "vite";

const modulo =
  process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), ".claude/skills/gstack/node_modules/playwright");
const { chromium } = createRequire(import.meta.url)(modulo);

const LIMITE_TAREFA_LONGA = 50;
const CENARIOS = [
  { nome: "375 px", viewport: { width: 375, height: 812 }, toque: true },
  { nome: "375 px · CPU 4×", viewport: { width: 375, height: 812 }, toque: true, cpu: 4 },
  { nome: "1440 px", viewport: { width: 1440, height: 900 }, toque: false },
];

const falhas = [];
function conferir(rotulo, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${rotulo}${detalhe ? ` · ${detalhe}` : ""}`);
  if (!ok) falhas.push(rotulo);
}

/**
 * Antes de qualquer script da página: guarda as tarefas longas e, a cada quadro, o que está animando
 * (transições do CSS, animações do CSS e as do Motion, que são Web Animations sem nome de CSS).
 */
function instrumentar() {
  window.__tarefasLongas = [];
  new PerformanceObserver((lista) => {
    for (const entrada of lista.getEntries()) {
      window.__tarefasLongas.push({ inicio: Math.round(entrada.startTime), duracao: Math.round(entrada.duration) });
    }
  }).observe({ type: "longtask", buffered: true });

  window.__animacoes = new Map();
  const amostrar = () => {
    for (const animacao of document.getAnimations()) {
      if (window.__animacoes.has(animacao)) continue;
      const efeito = animacao.effect;
      const tempo = efeito?.getTiming?.() ?? {};
      const alvo = efeito?.target;
      let tipo = "motion";
      let propriedades = [];
      if (typeof CSSTransition !== "undefined" && animacao instanceof CSSTransition) {
        tipo = "transicao";
        propriedades = [animacao.transitionProperty];
      } else if (typeof CSSAnimation !== "undefined" && animacao instanceof CSSAnimation) {
        tipo = "animacao-css";
        propriedades = [animacao.animationName];
      } else {
        propriedades = [...new Set((efeito?.getKeyframes?.() ?? []).flatMap((quadro) =>
          Object.keys(quadro).filter((chave) => !["offset", "computedOffset", "easing", "composite"].includes(chave))))];
      }
      window.__animacoes.set(animacao, {
        tipo,
        propriedades,
        duracao: Number(tempo.duration) || 0,
        atraso: Number(tempo.delay) || 0,
        alvo: alvo ? `${alvo.tagName.toLowerCase()}.${[...alvo.classList].join(".")}` : "?",
      });
    }
    requestAnimationFrame(amostrar);
  };
  requestAnimationFrame(amostrar);
}

/** Rola do topo ao fim em passos de meia tela, um quadro duplo por passo, e volta a esperar o fim. */
async function rolarPaginaInteira(pagina) {
  return pagina.evaluate(async () => {
    const quadro = () => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver)));
    const inicio = performance.now();
    for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight / 2) {
      scrollTo({ top: y, behavior: "instant" });
      await quadro();
    }
    scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await quadro();
    return { inicio: Math.round(inicio), fim: Math.round(performance.now()) };
  });
}

/** Espera por condição: todo .reveal com is-in, e as animações em curso terminadas. */
async function esperarRevelacao(pagina) {
  await pagina.waitForFunction(() => [...document.querySelectorAll(".reveal")].every((el) => el.classList.contains("is-in")), null, {
    timeout: 10000,
  });
  await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished.catch(() => {}))));
}

/** O que, dentro de main, ainda está invisível, desfocado, deslocado pela entrada ou com estilo inline. */
function medirConteudo(pagina) {
  return pagina.evaluate(() => {
    const problemas = [];
    for (const el of document.querySelectorAll("main *")) {
      const estilo = getComputedStyle(el);
      const nome = `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`;
      if (el.closest("[aria-hidden='true']")) continue;
      if (estilo.opacity !== "1") problemas.push(`${nome} opacity ${estilo.opacity}`);
      if (estilo.filter !== "none") problemas.push(`${nome} filter ${estilo.filter}`);
      if (el.classList.contains("reveal") && estilo.transform !== "none") problemas.push(`${nome} transform ${estilo.transform}`);
      if (["opacity", "transform", "filter"].some((p) => el.style.getPropertyValue(p))) problemas.push(`${nome} estilo inline`);
    }
    return {
      problemas,
      revelados: document.querySelectorAll(".reveal.is-in").length,
      totalReveal: document.querySelectorAll(".reveal").length,
      temJs: document.documentElement.classList.contains("js"),
    };
  });
}

async function cenario(navegador, url, pasta, { nome, viewport, toque, cpu }, reduzido) {
  const rotulo = `${nome}${reduzido ? " · reduce" : ""}`;
  const contexto = await navegador.newContext({
    viewport,
    hasTouch: toque,
    isMobile: toque,
    reducedMotion: reduzido ? "reduce" : "no-preference",
  });
  const pagina = await contexto.newPage();
  await pagina.addInitScript(instrumentar);
  if (cpu) {
    const cdp = await contexto.newCDPSession(pagina);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  }
  await pagina.goto(url, { waitUntil: "load" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished.catch(() => {}))));
  const fimDaCarga = await pagina.evaluate(() => Math.round(performance.now()));

  const janela = await rolarPaginaInteira(pagina);
  await esperarRevelacao(pagina);

  // Brilho: o ponteiro passa pelo hero e por um card (só faz efeito com hover fino)
  await pagina.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const brilho = { alvos: await pagina.evaluate(() => document.querySelectorAll(".tem-brilho").length), mx: "", hover: "" };
  if (!toque) {
    await pagina.mouse.move(200, 300);
    await pagina.mouse.move(420, 360, { steps: 12 });
    const card = pagina.locator(".project-card").first();
    await card.scrollIntoViewIfNeeded();
    const caixa = await card.boundingBox();
    await pagina.mouse.move(caixa.x + 40, caixa.y + 40);
    await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2, { steps: 20 });
    await pagina.evaluate(() => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver))));
    await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished.catch(() => {}))));
    brilho.mx = await card.evaluate((el) => el.style.getPropertyValue("--mx"));
    // Depois da entrada do Motion, o hover do card volta a valer (nada de transform inline preso)
    brilho.hover = await card.evaluate((el) => getComputedStyle(el).transform);
    if (!reduzido) await card.screenshot({ path: path.join(pasta, `card-brilho-${viewport.width}.png`) });
    await pagina.mouse.move(5, 5);
    await pagina.evaluate(() => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver))));
    await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished.catch(() => {}))));
  }
  const fimDoPonteiro = await pagina.evaluate(() => Math.round(performance.now()));

  const conteudo = await medirConteudo(pagina);
  const { tarefas, animacoes } = await pagina.evaluate(() => ({
    tarefas: window.__tarefasLongas,
    animacoes: [...window.__animacoes.values()],
  }));
  await contexto.close();

  const naCarga = tarefas.filter((tarefa) => tarefa.inicio < fimDaCarga);
  const noUso = tarefas.filter((tarefa) => tarefa.inicio >= janela.inicio && tarefa.inicio <= fimDoPonteiro);
  const maior = (lista) => (lista.length ? Math.max(...lista.map((tarefa) => tarefa.duracao)) : 0);
  const motion = animacoes.filter((animacao) => animacao.tipo === "motion");
  const transicoes = animacoes.filter((animacao) => animacao.tipo === "transicao");
  const animacoesCss = animacoes.filter((animacao) => animacao.tipo === "animacao-css");

  console.log(`\n# ${rotulo}`);
  console.log(`  carga: ${naCarga.length} tarefa(s) longa(s), maior ${maior(naCarga)} ms (informativo: carga da página, fora da janela medida)`);
  console.log(`  rolagem + ponteiro (${fimDoPonteiro - janela.inicio} ms): ${noUso.length} tarefa(s) longa(s), maior ${maior(noUso)} ms`);
  console.log(`  animações vistas: ${motion.length} do Motion, ${transicoes.length} transições de CSS, ${animacoesCss.length} animações de CSS`);

  conferir(`${rotulo} · nenhuma tarefa > ${LIMITE_TAREFA_LONGA} ms ao rolar e mover o ponteiro`, noUso.length === 0,
    noUso.map((tarefa) => `${tarefa.duracao} ms`).join(", "));
  conferir(`${rotulo} · a classe js continua (há IntersectionObserver)`, conteudo.temJs);
  conferir(`${rotulo} · todo .reveal com is-in ao fim`, conteudo.revelados === conteudo.totalReveal && conteudo.totalReveal > 20,
    `${conteudo.revelados}/${conteudo.totalReveal}`);
  conferir(`${rotulo} · todo conteúdo visível, sem desfoque nem estilo inline ao fim`, conteudo.problemas.length === 0,
    conteudo.problemas.slice(0, 8).join(", "));

  if (reduzido) {
    const foraDoPermitido = [...transicoes, ...animacoesCss].filter(
      (animacao) => animacao.tipo !== "transicao" || animacao.propriedades.some((p) => p !== "opacity") || animacao.duracao > 200,
    );
    conferir(`${rotulo} · nenhuma animação do Motion`, motion.length === 0, motion.slice(0, 4).map((a) => a.alvo).join(", "));
    conferir(`${rotulo} · só transições de opacity de até 200 ms`, foraDoPermitido.length === 0,
      foraDoPermitido.slice(0, 6).map((a) => `${a.alvo} ${a.propriedades.join("+")} ${a.duracao} ms`).join(", "));
  } else {
    const entradas = motion.filter((animacao) => animacao.alvo.includes("reveal"));
    const propriedades = new Set(entradas.flatMap((animacao) => animacao.propriedades));
    const maiorAtraso = Math.max(0, ...entradas.map((animacao) => animacao.atraso));
    const fora = entradas.flatMap((animacao) => animacao.propriedades).filter((p) => !["opacity", "transform", "filter"].includes(p));
    conferir(`${rotulo} · as entradas são do Motion e combinam opacity, transform e filter`,
      entradas.length > 20 && ["opacity", "transform", "filter"].every((p) => propriedades.has(p)) && fora.length === 0,
      `${entradas.length} animações; ${[...propriedades].join(", ")}`);
    conferir(`${rotulo} · maior atraso de entrada ≤ 400 ms`, maiorAtraso <= 400, `${maiorAtraso} ms`);
  }

  if (toque) conferir(`${rotulo} · em toque o brilho não é ligado`, brilho.alvos === 0, `${brilho.alvos} alvos`);
  else if (reduzido) conferir(`${rotulo} · sob reduce o brilho não é ligado`, brilho.alvos === 0, `${brilho.alvos} alvos`);
  else {
    conferir(`${rotulo} · o brilho segue o ponteiro no card (--mx)`, brilho.alvos === 6 && /^\d+px$/.test(brilho.mx),
      `${brilho.alvos} alvos, --mx ${brilho.mx || "vazio"}`);
    conferir(`${rotulo} · com o ponteiro em cima, o card sobe pelo hover de projetos.css`, /matrix\(1, 0, 0, 1, 0, -6\)/.test(brilho.hover),
      brilho.hover);
  }
}

const pasta = path.resolve(process.argv[3] || path.join(os.tmpdir(), "portfolio-spec7"));
mkdirSync(pasta, { recursive: true });

let servidor;
let url = process.argv[2];
if (!url) {
  servidor = await preview({ preview: { port: 0, strictPort: false }, logLevel: "warn" });
  url = servidor.resolvedUrls.local[0];
}

const navegador = await chromium.launch();
try {
  console.log(`Página: ${url}\nScreenshots: ${pasta}`);
  for (const reduzido of [false, true]) {
    for (const definicao of CENARIOS) await cenario(navegador, url, pasta, definicao, reduzido);
  }
} finally {
  await navegador.close();
  await servidor?.close();
}

console.log(falhas.length ? `\n${falhas.length} falha(s)` : "\nTudo verde");
process.exit(falhas.length ? 1 : 0);
