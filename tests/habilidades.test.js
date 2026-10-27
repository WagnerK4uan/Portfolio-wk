import { beforeAll, describe, expect, it } from "vitest";
import { carregarIndexDist, injetarCssDoIndexDist, regrasDe } from "./dist.js";
import { renderizarHabilidades } from "../src/render/habilidades.js";
import { habilidades } from "../src/data/habilidades.js";

/*
 * CA-5.3 contra o dist/index.html montado, mais o destaque da stack atual e o renderizador sozinho
 * (escape). CA-5.4 tem aqui a metade estática (regras do CSS do build que impedem corte); a
 * metade de layout real fica em tests/roteiros/experiencia-habilidades-navegador.mjs.
 */

function normalizar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

function fragmento(html) {
  const modelo = document.createElement("template");
  modelo.innerHTML = html;
  return modelo.content;
}

let secao;

beforeAll(() => {
  secao = carregarIndexDist().getElementById("habilidades");
});

/** O ícone fica fora da árvore de acessibilidade: <img alt=""> ou elemento com aria-hidden="true". */
function iconeDecorativo(icone) {
  if (icone.tagName === "IMG") return icone.getAttribute("alt") === "";
  return icone.getAttribute("aria-hidden") === "true";
}

describe("#habilidades no dist", () => {
  it("CA-5.3 · cada grupo é uma <ul> com título <h3>, ligada a ele por aria-labelledby", () => {
    const grupos = [...secao.querySelectorAll(".skill-group")];
    expect(grupos).toHaveLength(habilidades.length);

    grupos.forEach((grupo, i) => {
      const titulo = grupo.querySelector(":scope > h3");
      const lista = grupo.querySelector(":scope > ul");
      expect(titulo, `grupo ${i} tem <h3>`).not.toBeNull();
      expect(lista, `grupo ${i} tem <ul>`).not.toBeNull();
      expect(normalizar(titulo.textContent)).toBe(habilidades[i].titulo);
      expect(titulo.id).not.toBe("");
      expect(lista.getAttribute("aria-labelledby")).toBe(titulo.id);
      expect([...lista.children].every((filho) => filho.tagName === "LI")).toBe(true);
    });
  });

  it("CA-5.3 · cada item tem o nome em texto e o ícone com alt=\"\" ou aria-hidden=\"true\"; a soma é 25", () => {
    const itens = [...secao.querySelectorAll(".skill-group ul > li")];
    expect(itens).toHaveLength(25);
    expect(habilidades.reduce((soma, grupo) => soma + grupo.itens.length, 0)).toBe(25);

    const problemas = itens.flatMap((item) => {
      const nome = normalizar(item.querySelector(".skill-nome")?.textContent ?? "");
      const icones = [...item.querySelectorAll("img, i, svg")];
      const erros = [];
      if (!nome) erros.push("sem nome em texto");
      if (normalizar(item.textContent) !== nome) erros.push(`texto extra: "${normalizar(item.textContent)}"`);
      if (icones.length !== 1) erros.push(`${icones.length} ícones`);
      if (icones.some((icone) => !iconeDecorativo(icone))) erros.push("ícone exposto ao leitor de tela");
      return erros.map((erro) => `${nome || "?"}: ${erro}`);
    });
    expect(problemas).toEqual([]);
  });

  it("CA-5.3 · a stack do trabalho atual (Laravel, Nuxt.js e SQL) tem destaque visual e legenda em texto", () => {
    const atuais = [...secao.querySelectorAll(".skill--atual .skill-nome")].map((nome) => normalizar(nome.textContent));
    expect(atuais.sort()).toEqual(["Laravel", "Nuxt.js", "SQL"]);

    const marcas = [...secao.querySelectorAll(".skill-marca")];
    expect(marcas.length).toBeGreaterThan(0);
    expect(marcas.filter((marca) => marca.getAttribute("aria-hidden") !== "true")).toEqual([]);

    const legenda = normalizar(secao.querySelector(".skill-legenda").textContent);
    expect(legenda).toMatch(/^Em destaque, a stack do meu trabalho atual na Bruning Sistemas: /);
    for (const nome of ["Laravel", "Nuxt.js", "SQL"]) expect(legenda).toContain(nome);
  });

  it("CA-5.3 · nenhuma barra de nível, porcentagem ou travessão na seção", () => {
    expect(secao.querySelectorAll("progress, meter, [role='progressbar'], [role='meter']")).toHaveLength(0);
    expect(secao.textContent).not.toMatch(/\d\s*%/);
    expect(secao.textContent).not.toMatch(/[—–]/);
  });
});

describe("render · renderizarHabilidades", () => {
  it("CA-5.3 · escapa nome, ícone e título vindos dos dados", () => {
    const html = renderizarHabilidades([
      {
        titulo: "<b>Área</b>",
        itens: [
          { nome: "<script>x</script>", icone: 'a.svg" onerror="alert(1)', atual: true },
          { nome: "a & b", iconeFa: 'fas" onclick="x' },
        ],
      },
    ]);
    expect(html).not.toMatch(/<(script|b)[\s>]/);
    const raiz = fragmento(html);
    const comEvento = [...raiz.querySelectorAll("*")].filter((el) => [...el.attributes].some((a) => /^on/i.test(a.name)));
    expect(comEvento).toEqual([]);
    expect(normalizar(raiz.querySelector("h3").textContent)).toBe("<b>Área</b>");
    const [primeiro, segundo] = raiz.querySelectorAll(".skill");
    expect(primeiro.querySelector(".skill-nome").textContent).toBe("<script>x</script>");
    expect(primeiro.querySelector("img").getAttribute("src")).toBe('a.svg" onerror="alert(1)');
    expect(primeiro.querySelector("img").getAttribute("alt")).toBe("");
    expect(segundo.querySelector("i").getAttribute("aria-hidden")).toBe("true");
    expect(normalizar(raiz.querySelector(".skill-legenda").textContent)).toContain("<script>x</script>");
  });

  it("CA-5.3 · sem item atual não há legenda nem marca", () => {
    const raiz = fragmento(renderizarHabilidades([{ titulo: "A", itens: [{ nome: "B", iconeFa: "fas fa-x" }] }]));
    expect(raiz.querySelector(".skill-legenda")).toBeNull();
    expect(raiz.querySelector(".skill-marca")).toBeNull();
    expect(raiz.querySelector(".skill--atual")).toBeNull();
  });
});

const valores = (estilos, propriedade) => estilos.map((estilo) => estilo.getPropertyValue(propriedade)).filter(Boolean);
const zero = (valor) => /^0(px)?$/.test(valor);

describe("CSS de #habilidades no build", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  it("CA-5.4 · as listas quebram linha e os grupos usam colunas minmax(0, 1fr)", () => {
    expect(valores(regrasDe(folha, ".skills-grid"), "flex-wrap")).toContain("wrap");
    expect(valores(regrasDe(folha, ".skills-grid"), "min-width").some(zero)).toBe(true);

    for (const seletor of [".skill-groups", ".skill-group"]) {
      const colunas = valores(regrasDe(folha, seletor), "grid-template-columns");
      expect(colunas.length, seletor).toBeGreaterThan(0);
      expect(colunas.filter((valor) => !/minmax\(0,\s*1fr\)/.test(valor)), seletor).toEqual([]);
    }
  });

  it("CA-5.4 · o item encolhe até a largura da linha e o nome quebra em vez de ser cortado", () => {
    const item = regrasDe(folha, ".skill");
    expect(valores(item, "min-width").some(zero)).toBe(true);
    expect(valores(item, "max-width")).toContain("100%");
    expect(valores(item, "overflow").filter((valor) => valor !== "visible")).toEqual([]);

    const nome = regrasDe(folha, ".skill-nome");
    expect(valores(nome, "min-width").some(zero)).toBe(true);
    expect(valores(nome, "overflow-wrap")).toContain("anywhere");
    expect(valores(nome, "white-space").filter((valor) => valor === "nowrap")).toEqual([]);
    expect(valores(nome, "text-overflow")).toEqual([]);
  });

  it("CA-5.4 · o ícone tem tamanho fixo e não disputa largura com o nome", () => {
    const icone = regrasDe(folha, ".skill-icone");
    expect(valores(icone, "flex").some((valor) => /^(none|0 0 auto)$/.test(valor)) ||
      valores(icone, "flex-shrink").includes("0")).toBe(true);
    expect(valores(icone, "width").length).toBeGreaterThan(0);
  });
});
