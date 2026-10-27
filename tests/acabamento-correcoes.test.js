import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { beforeAll, describe, expect, it } from "vitest";
import {
  arquivoNoDist,
  carregarIndexDist,
  injetarCssDoIndexDist,
  lerCssDoIndexDist,
  lerIndexDist,
  raizDoProjeto,
  regrasDe,
} from "./dist.js";
import { projetos } from "../src/data/projetos.js";

/*
 * Spec 8 · correções do audit e do revisor final (passos 2 e 3). Cada bloco cita a correção que
 * prova; a correção 1 (link ativo ao voltar ao hero) está em tests/navegacao.test.js e no roteiro
 * tests/roteiros/hero-navegador.mjs. O que depende de layout real (sem overflow em 320 px, grade
 * de contato por largura) é conferido no navegador; aqui ficam as regras do CSS do build.
 */

const pastaPublica = path.join(raizDoProjeto, "public");
const HIFEN_NAO_SEPARAVEL = "\u2011";

/** Declarações de `seletor` dentro dos @media de largura mínima (min-width ou, minificado, width>=). */
function blocoDeMedia(css, largura, seletor) {
  const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const abertura = new RegExp(`@media\\s*\\((?:min-width:\\s*${escapar(largura)}|width\\s*>=\\s*${escapar(largura)})\\)\\s*\\{`, "g");
  const regra = new RegExp(`(?<=^|[{};])\\s*${escapar(seletor)}\\s*\\{([^}]*)\\}`, "g");
  return [...css.matchAll(abertura)].flatMap((m) => {
    // Corpo do @media por contagem de chaves.
    let profundidade = 1;
    let fim = m.index + m[0].length;
    for (; fim < css.length && profundidade > 0; fim++) {
      if (css[fim] === "{") profundidade++;
      if (css[fim] === "}") profundidade--;
    }
    const corpo = css.slice(m.index + m[0].length, fim - 1);
    return [...corpo.matchAll(regra)].map((r) => r[1].replace(/\s+/g, ""));
  });
}

describe("Spec 8 correção 2 · posters dos projetos", () => {
  // Largura de exibição: o card de destaque chega a ~500 px no desktop, os demais a ~350 px.
  const LARGURA_MINIMA = (projeto) => (projeto.destaque ? 1000 : 700);

  it("Spec 8 correção 2 · cada poster tem ao menos o dobro da largura de exibição e as dimensões declaradas nos dados", async () => {
    for (const projeto of projetos) {
      const { width, height } = await sharp(path.join(pastaPublica, projeto.poster.src)).metadata();
      expect(width, projeto.titulo).toBeGreaterThanOrEqual(LARGURA_MINIMA(projeto));
      expect({ largura: projeto.poster.largura, altura: projeto.poster.altura }, projeto.titulo).toEqual({
        largura: width,
        altura: height,
      });
    }
  });

  it("Spec 8 correção 2 · o campo opcional quadro é um índice válido do preview animado", async () => {
    for (const projeto of projetos.filter((p) => p.poster.quadro !== undefined)) {
      const { quadro } = projeto.poster;
      expect(Number.isInteger(quadro) && quadro >= 0, projeto.titulo).toBe(true);
      const { pages } = await sharp(path.join(pastaPublica, projeto.animado), { limitInputPixels: false }).metadata();
      expect(quadro, projeto.titulo).toBeLessThan(pages);
    }
  });

  it("Spec 8 correção 2 · Sistema de RH, Task Manager e Cookin-Up usam um quadro escolhido; o do RH não é quase todo branco", async () => {
    const porTitulo = Object.fromEntries(projetos.map((p) => [p.titulo, p]));
    for (const titulo of ["Sistema de RH", "Task Manager", "Cookin-Up"]) {
      expect(porTitulo[titulo].poster.quadro, titulo).toBeGreaterThan(0);
    }
    // O primeiro quadro do RH tem luminância média ~240 (tela branca); o poster tem de ser escuro.
    const { channels } = await sharp(path.join(pastaPublica, porTitulo["Sistema de RH"].poster.src)).stats();
    const media = channels.slice(0, 3).reduce((soma, canal) => soma + canal.mean, 0) / 3;
    expect(media).toBeLessThan(160);
  });
});

describe("Spec 8 correções 3, 4 e 6 · CSS do build", () => {
  let folha;
  let css;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
    css = lerCssDoIndexDist();
  });

  it("Spec 8 correção 3 · contato em 1 coluna no celular, 2×2 a partir de 36rem e 4 colunas a partir de 72rem", () => {
    const [base] = regrasDe(folha, ".contact-list");
    expect(base.getPropertyValue("grid-template-columns").replace(/\s+/g, "")).toBe("minmax(0,1fr)");
    expect(base.getPropertyValue("max-width")).toBe("1040px");

    expect(blocoDeMedia(css, "36rem", ".contact-list").join(";")).toContain("grid-template-columns:repeat(2,minmax(0,1fr))");
    expect(blocoDeMedia(css, "72rem", ".contact-list").join(";")).toContain("grid-template-columns:repeat(4,minmax(0,1fr))");
    // Nenhuma outra largura muda o número de colunas (nada de 3 colunas com um cartão sozinho).
    const colunas = [...css.matchAll(/\.contact-list\s*\{[^}]*grid-template-columns:\s*([^;}]+)/g)].map((m) =>
      m[1].replace(/\s+/g, ""),
    );
    expect(new Set(colunas)).toEqual(new Set(["minmax(0,1fr)", "repeat(2,minmax(0,1fr))", "repeat(4,minmax(0,1fr))"]));
  });

  it("Spec 8 correção 3 · no desktop de 4 colunas o ícone fica acima do texto, para o endereço caber sem quebrar no meio", () => {
    expect(blocoDeMedia(css, "72rem", ".contact-link").join(";")).toContain("grid-template-columns:minmax(0,1fr)");
    expect(blocoDeMedia(css, "72rem", ".contact-link i").join(";")).toContain("grid-row:auto");
  });

  it("Spec 8 correção 3 · o ícone do cartão de contato tem largura fixa de 1.75rem, centralizado", () => {
    const icone = regrasDe(folha, ".contact-link i");
    const declaracoes = icone.map((regra) => regra.cssText).join(";").replace(/\s+/g, "");
    expect(declaracoes).toContain("width:1.75rem");
    expect(declaracoes).toContain("justify-content:center");
    const cartao = regrasDe(folha, ".contact-link").map((regra) => regra.cssText).join(";").replace(/\s+/g, "");
    expect(cartao).toContain("grid-template-columns:autominmax(0,1fr)");
    expect(cartao).toContain("height:100%");
  });

  it("Spec 8 correção 4 · alvos de toque de 44 px: .project-link com min-height e .logo com min-width de 2.75rem", () => {
    const link = regrasDe(folha, ".project-link").map((regra) => regra.getPropertyValue("min-height"));
    const logo = regrasDe(folha, ".logo").map((regra) => regra.getPropertyValue("min-width"));
    expect(link).toContain("2.75rem");
    expect(logo).toContain("2.75rem");
  });

  it("Spec 8 correção 6 · .skill-nome usa --tipo-sm em todas as larguras, e --tipo-sm não fica abaixo de 14 px", () => {
    const tamanhos = regrasDe(folha, ".skill-nome")
      .map((regra) => regra.getPropertyValue("font-size"))
      .filter(Boolean);
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(new Set(tamanhos)).toEqual(new Set(["var(--tipo-sm)"]));

    const tokens = readFileSync(path.join(raizDoProjeto, "src/styles/tokens.css"), "utf8");
    const [, minimo] = /--tipo-sm:\s*clamp\(\s*([\d.]+)rem/.exec(tokens);
    expect(Number(minimo) * 16).toBeGreaterThanOrEqual(14);
  });
});

describe("Spec 8 correção 5 · texto de #experiencia", () => {
  it("Spec 8 correção 5 · back-end e front-end usam hífen não separável (U+2011) e não quebram no hífen", () => {
    const texto = carregarIndexDist().getElementById("experiencia").textContent;
    expect(texto).toContain(`back${HIFEN_NAO_SEPARAVEL}end`);
    expect(texto).toContain(`front${HIFEN_NAO_SEPARAVEL}end`);
    expect(texto).not.toMatch(/back-end|front-end/);
  });
});

describe("Spec 8 correção 7 · preload da fonte do hero", () => {
  // Só a Atkinson (texto da ficha, elemento de LCP no celular). Com a Bricolage também pré-carregada,
  // o LCP mobile do Lighthouse piorou de ~2,27 s para ~2,41 s; ver FONTES_DO_HERO em vite.config.js.
  const ATKINSON_LATIN = /^\/assets\/atkinson-hyperlegible-next-latin-wght-normal-[\w-]+\.woff2$/;

  const preloads = () =>
    [...new DOMParser().parseFromString(lerIndexDist(), "text/html").head.querySelectorAll('link[rel="preload"]')];

  it("Spec 8 correção 7 · o dist/index.html tem exatamente 1 preload de fonte, o woff2 latin da Atkinson Hyperlegible Next", () => {
    const links = preloads();
    expect(links).toHaveLength(1);
    const [link] = links;
    expect(link.getAttribute("as")).toBe("font");
    expect(link.getAttribute("type")).toBe("font/woff2");
    expect(link.hasAttribute("crossorigin")).toBe(true);
    expect(link.getAttribute("href")).toMatch(ATKINSON_LATIN);
    expect(link.getAttribute("href")).not.toMatch(/jetbrains|bricolage|latin-ext|cyrillic|greek|vietnamese/);
  });

  it("Spec 8 correção 7 · o href do preload existe em dist e é a mesma fonte que o CSS do build usa", () => {
    const css = lerCssDoIndexDist();
    preloads().forEach((link) => {
      const href = link.getAttribute("href");
      expect(existsSync(arquivoNoDist(href)), href).toBe(true);
      expect(css, href).toContain(href);
    });
  });
});

/*
 * Ícones locais (src/styles/icones.css). Ícone sem desenho vira uma caixa vazia ao lado do texto e
 * deixa o link de contato só ícone sem nada visível, por isso entra em CA-8.3 (interface acessível).
 */

/** Classes fa-* utilitárias do Font Awesome, que não nomeiam um ícone e não têm desenho próprio. */
const UTILITARIAS_FA = new Set(["fa-fw", "fa-xs", "fa-sm", "fa-lg", "fa-xl", "fa-2xl", "fa-spin", "fa-pulse", "fa-border", "fa-li", "fa-ul", "fa-inverse", "fa-pull-left", "fa-pull-right", "fa-stack", "fa-stack-1x", "fa-stack-2x"]);
const ehClasseDeIcone = (classe) => /^fa-[\w-]+$/.test(classe) && !UTILITARIAS_FA.has(classe) && !/^fa-\d+x$/.test(classe);

const pastaSrc = path.join(raizDoProjeto, "src");
const lerIconesCss = () => readFileSync(path.join(pastaSrc, "styles", "icones.css"), "utf8");

/** Classes de ícone dos elementos <i> de um HTML. */
function iconesDoHtml(html) {
  const documento = new DOMParser().parseFromString(html, "text/html");
  return [...documento.querySelectorAll("i")].flatMap((elemento) => [...elemento.classList].filter(ehClasseDeIcone));
}

/** Classes fa-* escritas literalmente num código-fonte (renderizadores e dados). */
const iconesLiterais = (codigo) => [...codigo.matchAll(/(?<![\w-])fa-[a-z0-9-]+/g)].map((m) => m[0]).filter(ehClasseDeIcone);

/** Classes que têm, em icones.css, uma regra própria com --icone: url("data:image/svg+xml,...<svg...>"). */
function iconesComDesenho(css) {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const comDesenho = new Set();
  for (const [, seletores, corpo] of semComentarios.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    // URL entre aspas duplas, simples ou sem aspas; o SVG usa aspas simples por dentro.
    const desenho = /--icone\s*:\s*url\(\s*(?:"data:image\/svg\+xml,([^"]*)"|'data:image\/svg\+xml,([^']*)'|data:image\/svg\+xml,([^)\s]*))\s*\)/.exec(corpo);
    const svg = desenho && (desenho[1] ?? desenho[2] ?? desenho[3]);
    if (!svg || !/(%3C|<)svg[\s\S]*(%3C|<)(path|circle|rect|polygon)/i.test(svg)) continue;
    for (const seletor of seletores.split(",")) {
      const classe = /^\s*\.(fa-[\w-]+)\s*$/.exec(seletor);
      if (classe) comDesenho.add(classe[1]);
    }
  }
  return comDesenho;
}

/** Classes de ícone usadas que não têm desenho em icones.css, sem repetição e em ordem. */
function iconesSemDesenho(classesUsadas, css) {
  const comDesenho = iconesComDesenho(css);
  return [...new Set(classesUsadas)].filter((classe) => !comDesenho.has(classe)).sort();
}

const codigosDe = (pasta) =>
  readdirSync(pasta)
    .filter((nome) => nome.endsWith(".js"))
    .map((nome) => readFileSync(path.join(pasta, nome), "utf8"));

describe("CA-8.3 · ícones locais", () => {
  it("CA-8.3 · todo ícone fa-* do build e dos renderizadores tem desenho SVG em src/styles/icones.css", () => {
    const doHtml = iconesDoHtml(lerIndexDist());
    const dosFontes = [...codigosDe(path.join(pastaSrc, "render")), ...codigosDe(path.join(pastaSrc, "data"))].flatMap(iconesLiterais);
    // Sanidade da extração: o build tem ícones e os de contato e de projeto aparecem nas duas fontes.
    expect(doHtml.length).toBeGreaterThan(0);
    expect(doHtml).toEqual(expect.arrayContaining(["fa-envelope", "fa-github", "fa-lock"]));
    expect(dosFontes).toEqual(expect.arrayContaining(["fa-envelope", "fa-github", "fa-lock"]));

    expect(iconesSemDesenho([...doHtml, ...dosFontes], lerIconesCss()), "ícones sem desenho em icones.css").toEqual([]);
  });

  it("CA-8.3 · a conferência acusa ícone sem desenho no HTML, no código-fonte e regra sem SVG", () => {
    const css = lerIconesCss();
    expect(iconesSemDesenho(iconesDoHtml('<p><i class="fas fa-rocket" aria-hidden="true"></i></p>'), css)).toEqual(["fa-rocket"]);
    expect(iconesSemDesenho(iconesLiterais('{ iconeFa: "fab fa-discord" }'), css)).toEqual(["fa-discord"]);
    expect(iconesSemDesenho(["fa-lock"], ".fa-lock { --icone-largura: 0.875em; }")).toEqual(["fa-lock"]);
    expect(iconesSemDesenho(iconesDoHtml('<i class="fas fa-lock fa-fw"></i>'), css)).toEqual([]);
  });

  it("CA-8.3 · o crédito CC BY 4.0 do Font Awesome (Fonticons), com o link da licença, abre o CSS de dist/assets como comentário /*!", () => {
    const pastaAssets = path.join(raizDoProjeto, "dist", "assets");
    const cssDoBuild = readdirSync(pastaAssets)
      .filter((nome) => nome.endsWith(".css"))
      .map((nome) => readFileSync(path.join(pastaAssets, nome), "utf8"))
      .join("\n");
    expect(cssDoBuild).toMatch(
      /^\s*\/\*!.*Font Awesome Free 6\.4\.0.*CC BY 4\.0.*https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/.*Fonticons.*\*\//,
    );
  });
});
