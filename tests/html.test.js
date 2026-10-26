import { existsSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { arquivoNoDist, carregarIndexDist } from "./dist.js";

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
    for (const id of ["home", "sobre", "habilidades", "projects", "conteudo"]) {
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
