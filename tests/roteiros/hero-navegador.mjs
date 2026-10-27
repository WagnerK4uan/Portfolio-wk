/*
 * Roteiro de navegador da Spec 4: CA-4.4 e CA-4.5 em layout real, mais a conferência de
 * CA-4.1 a CA-4.3 e do menu só por teclado num Chromium de verdade.
 *
 * Não roda no `npm test` (o jsdom não mede layout nem avalia media queries, S-4.2). Uso:
 *   npm run build && npm run preview -- --port 4173 --strictPort
 *   node tests/roteiros/hero-navegador.mjs [url] [pasta-dos-screenshots]
 *
 * O Playwright não é dependência do projeto: vem do gstack (o mesmo motor do /browse), ou do
 * caminho em PLAYWRIGHT_MODULE. Sai com código 1 se alguma checagem falhar.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://localhost:4173/";
const pasta = path.resolve(process.argv[3] || ".gstack/spec4");
const modulo =
  process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), ".claude/skills/gstack/node_modules/playwright");
const { chromium } = createRequire(import.meta.url)(modulo);

const LARGURAS = [
  { largura: 320, altura: 568 },
  { largura: 375, altura: 667 },
  { largura: 768, altura: 1024 },
  { largura: 1440, altura: 900 },
];

const falhas = [];
function conferir(rotulo, ok, detalhe = "") {
  console.log(`${ok ? "ok  " : "FALHA"} ${rotulo}${detalhe ? ` · ${detalhe}` : ""}`);
  if (!ok) falhas.push(rotulo);
}

/** Espera a entrada coreografada terminar, por evento das próprias animações. */
async function esperarAnimacoes(pagina) {
  await pagina.evaluate(() => Promise.all(document.getAnimations().map((animacao) => animacao.finished)));
}

mkdirSync(pasta, { recursive: true });
const navegador = await chromium.launch();

try {
  // CA-4.4 · primeiro viewport e rolagem horizontal, por largura
  for (const { largura, altura } of LARGURAS) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "domcontentloaded" });

    const duracaoDaEntrada = await pagina.evaluate(() => {
      const home = document.getElementById("home");
      const doHero = document
        .getAnimations()
        .filter((animacao) => home.contains(animacao.effect?.target));
      return Math.max(0, ...doHero.map((animacao) => animacao.effect.getComputedTiming().endTime));
    });
    await pagina.waitForLoadState("load");
    await esperarAnimacoes(pagina);

    const medida = await pagina.evaluate(() => {
      const header = document.querySelector("header").getBoundingClientRect();
      const seletores = {
        nome: "#home h1",
        cargo: "#home .hero-cargo",
        frase: "#home .hero-posicionamento",
        "Ver projetos": '#home a[href="#projetos"]',
        "Entrar em contato": '#home a[href="#contato"]',
      };
      const foraDaPrimeiraTela = Object.entries(seletores)
        .map(([nome, seletor]) => [nome, document.querySelector(seletor).getBoundingClientRect()])
        .filter(([, r]) => r.top < header.bottom || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth)
        .map(([nome, r]) => `${nome} (${Math.round(r.top)}..${Math.round(r.bottom)})`);
      const foto = document.querySelector("#home img");
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        fundoDoHero: Math.round(document.querySelector('#home a[href="#contato"]').getBoundingClientRect().bottom),
        foraDaPrimeiraTela,
        alt: foto.getAttribute("alt"),
        fetchpriority: foto.getAttribute("fetchpriority"),
        fotoNaTela: foto.getBoundingClientRect().bottom <= innerHeight,
      };
    });

    const rotulo = `CA-4.4 · ${largura}×${altura}`;
    conferir(`${rotulo} sem rolagem horizontal`, medida.scrollWidth <= medida.innerWidth,
      `scrollWidth ${medida.scrollWidth} / innerWidth ${medida.innerWidth}`);
    conferir(`${rotulo} nome, cargo, frase e botões no primeiro viewport`, medida.foraDaPrimeiraTela.length === 0,
      medida.foraDaPrimeiraTela.join(", ") || `último botão termina em ${medida.fundoDoHero}px`);
    conferir(`${rotulo} foto com alt e fetchpriority=high`,
      Boolean(medida.alt) && medida.fetchpriority === "high" && medida.fotoNaTela);
    conferir(`Spec 4 passo 5 · ${largura}px entrada abaixo de 900 ms`, duracaoDaEntrada > 0 && duracaoDaEntrada < 900,
      `${Math.round(duracaoDaEntrada)} ms`);

    await pagina.screenshot({ path: path.join(pasta, `hero-${largura}.png`) });
    await contexto.close();
  }

  // CA-4.5 · movimento reduzido: nada anima no hero, nada nasce deslocado
  for (const largura of [375, 1440]) {
    const contexto = await navegador.newContext({
      viewport: { width: largura, height: largura === 375 ? 667 : 900 },
      reducedMotion: "reduce",
    });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "domcontentloaded" });
    const estado = await pagina.evaluate(() => {
      const home = document.getElementById("home");
      const animacoes = document.getAnimations().filter((animacao) => home.contains(animacao.effect?.target));
      const deslocados = [...home.querySelectorAll("*")]
        .filter((el) => getComputedStyle(el).transform !== "none" || getComputedStyle(el).opacity !== "1")
        .map((el) => el.className || el.tagName);
      return { animacoes: animacoes.length, deslocados };
    });
    conferir(`CA-4.5 · ${largura}px sob reduce, nenhuma animação no hero`, estado.animacoes === 0,
      `${estado.animacoes} animações`);
    conferir(`CA-4.5 · ${largura}px sob reduce, nenhum elemento do hero deslocado ou transparente`,
      estado.deslocados.length === 0, estado.deslocados.join(", "));
    await pagina.screenshot({ path: path.join(pasta, `hero-${largura}-movimento-reduzido.png`) });
    await contexto.close();
  }

  // CA-4.2 · menu mobile só por teclado, em 375 e 320 px
  for (const largura of [375, 320]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: largura === 375 ? 667 : 568 } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    const focado = () =>
      pagina.evaluate(() => {
        const el = document.activeElement;
        return el.getAttribute("href") || el.className || el.tagName;
      });
    const expandido = () => pagina.getAttribute("header button[aria-controls]", "aria-expanded");

    await pagina.keyboard.press("Tab"); // link de pular
    await pagina.keyboard.press("Tab"); // logo
    await pagina.keyboard.press("Tab"); // botão de menu
    conferir(`CA-4.2 · ${largura}px Tab chega ao botão de menu depois do logo`, (await focado()) === "menu-botao");
    const navVisivelFechada = await pagina.isVisible('nav a[href="#sobre"]');
    conferir(`CA-4.2 · ${largura}px lista fechada fora da tela e da tabulação`, !navVisivelFechada);

    await pagina.keyboard.press("Enter");
    await esperarAnimacoes(pagina);
    conferir(`CA-4.2 · ${largura}px Enter abre: aria-expanded=true`, (await expandido()) === "true");
    conferir(`CA-4.2 · ${largura}px foco no primeiro link`, (await focado()) === "#sobre");
    await pagina.keyboard.press("Tab");
    conferir(`CA-4.2 · ${largura}px Tab segue para o segundo link`, (await focado()) === "#experiencia");
    await pagina.screenshot({ path: path.join(pasta, `menu-${largura}-aberto-teclado.png`) });

    await pagina.keyboard.press("Escape");
    conferir(`CA-4.2 · ${largura}px Esc fecha e devolve o foco ao botão`,
      (await expandido()) === "false" && (await focado()) === "menu-botao");

    await pagina.keyboard.press("Space");
    conferir(`CA-4.2 · ${largura}px Espaço também abre`, (await expandido()) === "true");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.press("Tab"); // #projetos
    await pagina.keyboard.press("Enter");
    await pagina.waitForFunction(() => document.querySelector('nav a[href="#projetos"]').classList.contains("is-active"));
    conferir(`CA-4.2 · ${largura}px Enter num link fecha o menu e navega`, (await expandido()) === "false");

    const largo = await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    conferir(`CA-4.4 · ${largura}px sem rolagem horizontal com a página rolada`, largo);
    await contexto.close();
  }

  // CA-8.3 · menu aberto trava a rolagem da página; fechar destrava; link âncora ainda leva à seção
  for (const largura of [375, 320]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: largura === 375 ? 667 : 568 } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    await pagina.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
    const trava = () =>
      pagina.evaluate(() => ({
        classe: document.documentElement.classList.contains("is-menu-aberto"),
        overflow: getComputedStyle(document.documentElement).overflowY,
        y: Math.round(scrollY),
      }));
    /** Espera dois quadros de pintura, por evento, para a rolagem pedida já ter sido aplicada. */
    const doisQuadros = () =>
      pagina.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));

    await pagina.click(".menu-botao");
    await esperarAnimacoes(pagina);
    const aberto = await trava();
    conferir(`CA-8.3 · ${largura}px menu aberto: <html> com is-menu-aberto e overflow hidden`,
      aberto.classe && aberto.overflow === "hidden", `overflow ${aberto.overflow}`);

    await pagina.mouse.move(largura / 2, (largura === 375 ? 667 : 568) - 40);
    await pagina.mouse.wheel(0, 600);
    await pagina.keyboard.press("PageDown");
    await pagina.keyboard.press("ArrowDown");
    await pagina.keyboard.press("End");
    await doisQuadros();
    await esperarAnimacoes(pagina);
    const depois = await trava();
    conferir(`CA-8.3 · ${largura}px menu aberto: roda do mouse e teclado não rolam a página`, depois.y === aberto.y,
      `scrollY ${aberto.y} → ${depois.y}`);

    await pagina.click(".menu-botao");
    const fechado = await trava();
    conferir(`CA-8.3 · ${largura}px menu fechado: rolagem destravada`, !fechado.classe && fechado.overflow !== "hidden",
      `overflow ${fechado.overflow}`);
    await pagina.mouse.wheel(0, 400);
    await pagina
      .waitForFunction((y) => Math.round(scrollY) !== y, fechado.y, { timeout: 2000 })
      .catch(() => {});
    const rolou = await trava();
    conferir(`CA-8.3 · ${largura}px menu fechado: a roda do mouse volta a rolar`, rolou.y !== fechado.y,
      `scrollY ${fechado.y} → ${rolou.y}`);

    await pagina.click(".menu-botao");
    await esperarAnimacoes(pagina);
    await pagina.click('nav a[href="#projetos"]');
    const chegou = await pagina
      .waitForFunction(() => {
        const topo = document.getElementById("projetos").getBoundingClientRect().top;
        const header = document.querySelector("header").getBoundingClientRect().bottom;
        return Math.abs(topo - header) <= 24;
      }, null, { timeout: 3000 })
      .then(() => true, () => false);
    const final = await trava();
    conferir(`CA-8.3 · ${largura}px clicar num link do menu aberto destrava e leva até #projetos`,
      chegou && !final.classe && final.overflow !== "hidden",
      `topo de #projetos ${await pagina.evaluate(() => Math.round(document.getElementById("projetos").getBoundingClientRect().top))}px, overflow ${final.overflow}`);
    await contexto.close();
  }

  // CA-4.1 · hero parcialmente rolado: o header já tem fundo e nada passa sob ele transparente
  for (const { largura, altura, rolagem } of [
    { largura: 1440, altura: 900, rolagem: 330 },
    { largura: 320, altura: 568, rolagem: 200 },
    { largura: 320, altura: 568, rolagem: 16 },
  ]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    await pagina.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), rolagem);
    await pagina.waitForFunction(() => document.querySelector("header").classList.contains("is-scrolled"), null, {
      timeout: 2000,
    }).catch(() => {});
    await esperarAnimacoes(pagina);
    const estado = await pagina.evaluate(() => {
      const header = document.querySelector("header");
      const fundo = getComputedStyle(header).backgroundColor;
      const alfa = /\/\s*([\d.]+)\)|rgba\([^)]*,\s*([\d.]+)\)/.exec(fundo);
      const ficha = document.querySelector("#home .ficha").getBoundingClientRect();
      return {
        rolado: header.classList.contains("is-scrolled"),
        fundo,
        opacidade: alfa ? Number(alfa[1] ?? alfa[2]) : 1,
        fichaSobOHeader: ficha.top < header.getBoundingClientRect().bottom && ficha.bottom > 0,
      };
    });
    conferir(`CA-4.1 · ${largura}px rolado ${rolagem}px (hero parcial): header com is-scrolled e fundo`,
      estado.rolado && estado.opacidade >= 0.8, `ficha sob o header: ${estado.fichaSobOHeader}, fundo ${estado.fundo}`);
    if (rolagem > 100) await pagina.screenshot({ path: path.join(pasta, `hero-parcial-${largura}.png`) });
    await contexto.close();
  }

  // CA-4.1 e CA-4.3 · header rolado e link ativo, com foco visível no desktop
  {
    const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    conferir("CA-4.1 · no topo o header não tem is-scrolled",
      !(await pagina.evaluate(() => document.querySelector("header").classList.contains("is-scrolled"))));

    await pagina.evaluate(() => document.getElementById("projetos").scrollIntoView({ behavior: "instant" }));
    await pagina.waitForFunction(() => document.querySelector("header").classList.contains("is-scrolled"));
    await pagina.waitForFunction(() => document.querySelector('nav a[href="#projetos"]').classList.contains("is-active"));
    const estado = await pagina.evaluate(() => {
      const header = document.querySelector("header");
      const r = header.getBoundingClientRect();
      return {
        visivel: r.top === 0 && r.height > 0 && getComputedStyle(header).visibility === "visible",
        desfoque: getComputedStyle(header).backdropFilter,
        marcados: [...document.querySelectorAll('nav a[aria-current="true"]')].map((a) => a.getAttribute("href")),
        ativos: [...document.querySelectorAll("nav a.is-active")].map((a) => a.getAttribute("href")),
      };
    });
    conferir("CA-4.1 · rolado, o header ganha is-scrolled e continua visível no topo", estado.visivel,
      `backdrop-filter ${estado.desfoque}`);
    conferir("CA-4.3 · em #projetos só o link de projetos está marcado",
      JSON.stringify(estado.marcados) === '["#projetos"]' && JSON.stringify(estado.ativos) === '["#projetos"]',
      `aria-current ${estado.marcados.join(",")}`);
    await esperarAnimacoes(pagina);
    await pagina.screenshot({ path: path.join(pasta, "header-rolado-1440.png") });

    // Spec 8 · alvos de 44 px em largura e altura em todos os links da navegação
    const alvos = await pagina.evaluate(() =>
      [...document.querySelectorAll(".menu-secoes a")].map((a) => {
        const r = a.getBoundingClientRect();
        return { texto: a.textContent.trim(), largura: r.width, altura: r.height };
      }),
    );
    const pequenos = alvos.filter((alvo) => alvo.largura < 44 || alvo.altura < 44);
    conferir("CA-8.3 · 1440px todos os links da navegação têm alvo de pelo menos 44×44 px",
      alvos.length === 5 && pequenos.length === 0,
      alvos.map((alvo) => `${alvo.texto} ${Math.round(alvo.largura)}×${Math.round(alvo.altura)}`).join(", "));

    // Spec 8 correção 1 · rolar até Sobre e voltar ao topo não deixa link ativo
    await pagina.evaluate(() => document.getElementById("sobre").scrollIntoView({ behavior: "instant" }));
    await pagina.waitForFunction(() => document.querySelector('nav a[href="#sobre"]').classList.contains("is-active"));
    await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const semAtivo = await pagina
      .waitForFunction(() => !document.querySelector("nav a.is-active, nav a[aria-current]"), null, { timeout: 2000 })
      .then(() => true, () => false);
    const restantes = await pagina.evaluate(() =>
      [...document.querySelectorAll("nav a.is-active, nav a[aria-current]")].map((a) => a.getAttribute("href")),
    );
    conferir("Spec 8 correção 1 · de volta ao hero, nenhum link fica com is-active ou aria-current", semAtivo,
      restantes.join(",") || "nenhum");

    // Página nova: o scrollIntoView acima move o ponto de partida da tabulação.
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.press("Tab");
    const foco = await pagina.evaluate(() => {
      const el = document.activeElement;
      const estilo = getComputedStyle(el);
      return { href: el.getAttribute("href"), outline: `${estilo.outlineStyle} ${estilo.outlineWidth}` };
    });
    conferir("Teclado · 1440px Tab vai do logo para o primeiro link, com anel de foco",
      foco.href === "#sobre" && foco.outline.startsWith("solid"), `${foco.href} ${foco.outline}`);
    await pagina.screenshot({ path: path.join(pasta, "foco-teclado-1440.png") });
    await contexto.close();
  }

  // Spec 8 · medida do Sobre: 62 a 68 caracteres por linha no desktop, sem estourar no celular
  for (const { largura, altura } of [
    { largura: 1440, altura: 900 },
    { largura: 375, altura: 667 },
    { largura: 320, altura: 568 },
  ]) {
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura } });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await pagina.evaluate(() => document.fonts.ready);
    const medida = await pagina.evaluate(() => {
      // Caracteres por linha: cada caractere do texto vai para a linha da sua caixa (Range por caractere).
      const linhasPorParagrafo = [...document.querySelectorAll(".about-text p")].map((paragrafo) => {
        const linhas = new Map();
        const andarilho = document.createTreeWalker(paragrafo, NodeFilter.SHOW_TEXT);
        for (let no = andarilho.nextNode(); no; no = andarilho.nextNode()) {
          for (let i = 0; i < no.data.length; i++) {
            const faixa = document.createRange();
            faixa.setStart(no, i);
            faixa.setEnd(no, i + 1);
            const caixa = faixa.getClientRects()[0];
            if (!caixa) continue;
            const topo = Math.round(caixa.top);
            linhas.set(topo, (linhas.get(topo) ?? "") + no.data[i]);
          }
        }
        return [...linhas.values()].map((linha) => linha.replace(/\s+/g, " ").trim().length);
      });
      const bloco = document.querySelector(".about-text").getBoundingClientRect();
      return {
        linhasPorParagrafo,
        centro: bloco.left + bloco.width / 2,
        dentro: bloco.left >= 0 && bloco.right <= innerWidth,
        largo: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    // A última linha de cada parágrafo é o resto e pode ser curta.
    const cheias = medida.linhasPorParagrafo.flatMap((linhas) => linhas.slice(0, -1));
    const resumo = medida.linhasPorParagrafo.map((linhas) => linhas.join("/")).join(" | ");
    if (largura === 1440) {
      conferir("Spec 8 · 1440px Sobre com 62 a 68 caracteres por linha", cheias.length > 0 &&
        cheias.every((total) => total >= 62 && total <= 68), resumo);
      conferir("Spec 8 · 1440px bloco do Sobre centralizado", Math.abs(medida.centro - largura / 2) <= 1,
        `centro em ${Math.round(medida.centro)}px`);
    }
    conferir(`Spec 8 · ${largura}px Sobre dentro da tela, sem rolagem horizontal`, medida.dentro && medida.largo, resumo);
    await contexto.close();
  }

  // Sem JavaScript: a navegação continua toda visível e a página não rola de lado
  {
    const contexto = await navegador.newContext({ viewport: { width: 320, height: 568 }, javaScriptEnabled: false });
    const pagina = await contexto.newPage();
    await pagina.goto(url, { waitUntil: "load" });
    await esperarAnimacoes(pagina);
    const semJs = await pagina.evaluate(() => ({
      linksVisiveis: [...document.querySelectorAll("nav a")].filter((a) => a.getBoundingClientRect().height > 0 &&
        getComputedStyle(a).visibility === "visible").length,
      botao: getComputedStyle(document.querySelector(".menu-botao")).display,
      largo: document.documentElement.scrollWidth <= innerWidth,
      nomeAbaixoDoHeader:
        document.querySelector("#home h1").getBoundingClientRect().top >= document.querySelector("header").getBoundingClientRect().bottom,
    }));
    conferir("Sem JS · 320px os 5 links ficam visíveis e o botão some",
      semJs.linksVisiveis === 5 && semJs.botao === "none", `${semJs.linksVisiveis} links, botão ${semJs.botao}`);
    conferir("Sem JS · 320px sem rolagem horizontal e o nome não fica sob o header", semJs.largo && semJs.nomeAbaixoDoHeader);
    await pagina.screenshot({ path: path.join(pasta, "sem-js-320.png") });
    await contexto.close();
  }
} finally {
  await navegador.close();
}

console.log(falhas.length ? `\n${falhas.length} falha(s)` : "\nTudo verde");
process.exit(falhas.length ? 1 : 0);
