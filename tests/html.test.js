import { existsSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { arquivoNoDist, carregarIndexDist, lerCssDoIndexDist, raizDoProjeto } from "./dist.js";
import { lerTokensDoRoot, luminanciaRelativa, oklchParaSrgbLinear } from "./cores.js";

const TRAVESSOES = /[—–]/;

let documento;

beforeAll(() => {
  documento = carregarIndexDist();
});

function textoVisivelDoBody(doc) {
  const copia = doc.body.cloneNode(true);
  copia.querySelectorAll("script, style, template, noscript").forEach((el) => el.remove());
  return copia.textContent;
}

describe("dist/index.html", () => {
  it("CA-1.2 · todo src de <img> e o href do favicon apontam para arquivo existente em dist/", () => {
    const imagens = [...documento.querySelectorAll("img")].map((img) => img.getAttribute("src"));
    const favicons = [...documento.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute("href"));

    expect(imagens.length).toBeGreaterThan(0);
    expect(favicons).toHaveLength(1);

    const caminhos = [...imagens, ...favicons];
    const ausentes = caminhos.filter((caminho) => !caminho || !existsSync(arquivoNoDist(caminho)));
    expect(ausentes).toEqual([]);
  });

  it("CA-1.3 · as seções atuais existem e todo link da nav aponta para um id existente", () => {
    for (const id of ["home", "sobre", "experiencia", "habilidades", "projetos", "contato", "conteudo"]) {
      expect(documento.getElementById(id), `id "${id}"`).not.toBeNull();
    }

    const links = [...documento.querySelectorAll('nav a[href^="#"]')];
    expect(links.length).toBeGreaterThan(0);
    const quebrados = links
      .map((link) => link.getAttribute("href").slice(1))
      .filter((id) => !id || !documento.getElementById(decodeURIComponent(id)));
    expect(quebrados).toEqual([]);
  });

  it("CA-1.4 · texto do body e atributos alt, aria-label e title não têm travessão", () => {
    const texto = textoVisivelDoBody(documento);
    const linhasComTravessao = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter((linha) => TRAVESSOES.test(linha));
    expect(linhasComTravessao).toEqual([]);

    const atributosComTravessao = [];
    for (const nome of ["alt", "aria-label", "title"]) {
      documento.querySelectorAll(`[${nome}]`).forEach((el) => {
        const valor = el.getAttribute(nome);
        if (TRAVESSOES.test(valor)) atributosComTravessao.push(`${nome}="${valor}"`);
      });
    }
    expect(atributosComTravessao).toEqual([]);
  });

  it("CA-1.5 · toda <img> tem alt e todo link target=_blank tem rel com noopener", () => {
    const imagens = [...documento.querySelectorAll("img")];
    const semAlt = imagens.filter((img) => !img.hasAttribute("alt")).map((img) => img.getAttribute("src"));
    expect(semAlt).toEqual([]);

    // alt vazio só vale para imagem decorativa: ela não pode ser o único conteúdo de um link ou botão.
    const vaziasQueNomeiamAcao = imagens
      .filter((img) => img.getAttribute("alt").trim() === "")
      .filter((img) => {
        const acao = img.closest("a, button");
        return acao && acao.textContent.trim() === "" && !acao.hasAttribute("aria-label");
      })
      .map((img) => img.getAttribute("src"));
    expect(vaziasQueNomeiamAcao).toEqual([]);

    const links = [...documento.querySelectorAll('a[target="_blank"]')];
    expect(links.length).toBeGreaterThan(0);
    const inseguros = links
      .filter((link) => !(link.getAttribute("rel") || "").split(/\s+/).includes("noopener"))
      .map((link) => link.getAttribute("href"));
    expect(inseguros).toEqual([]);
  });
});

describe("Tema escuro aplicado", () => {
  /*
   * O jsdom resolve custom properties no getComputedStyle, mas não substitui var() dentro de
   * propriedades comuns: `background: var(--cor-fundo)` sai como o valor inicial transparente.
   * Por isso a prova tem duas metades: a regra do body no CSS do build declara o fundo pelo
   * token, e o getComputedStyle do body resolve esse token para o valor de tokens.css.
   */
  it("CA-2.4 · o <body> usa o fundo escuro do token e o <head> declara color-scheme dark", () => {
    const meta = documento.head.querySelector('meta[name="color-scheme"]');
    expect(meta, '<meta name="color-scheme"> no <head>').not.toBeNull();
    expect(meta.getAttribute("content")).toBe("dark");

    const estilo = document.createElement("style");
    estilo.textContent = lerCssDoIndexDist();
    document.head.appendChild(estilo);
    try {
      const regrasDoBody = [...estilo.sheet.cssRules].filter((regra) => regra.selectorText === "body");
      expect(regrasDoBody.length).toBeGreaterThan(0);
      const ultimaRegra = regrasDoBody.at(-1).style;
      const fundoDeclarado = ultimaRegra.getPropertyValue("background-color") || ultimaRegra.getPropertyValue("background");
      expect(fundoDeclarado.replace(/\s+/g, "")).toBe("var(--cor-fundo)");

      const tokens = lerTokensDoRoot(readFileSync(path.join(raizDoProjeto, "src/styles/tokens.css"), "utf8"));
      const fundoNoBody = getComputedStyle(document.body).getPropertyValue("--cor-fundo").trim();
      expect(fundoNoBody, "--cor-fundo resolvido no body").not.toBe("");

      const noBuild = oklchParaSrgbLinear(fundoNoBody);
      const noToken = oklchParaSrgbLinear(tokens["--cor-fundo"]);
      noBuild.forEach((canal, i) => expect(canal).toBeCloseTo(noToken[i], 5));

      // Escuro de fato: luminância relativa abaixo da de um cinza sRGB #1a1a1a (cerca de 0,01).
      expect(luminanciaRelativa(fundoNoBody)).toBeLessThan(0.011);
    } finally {
      estilo.remove();
    }
  });
});
