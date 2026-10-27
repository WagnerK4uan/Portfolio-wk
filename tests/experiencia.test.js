import { beforeAll, describe, expect, it } from "vitest";
import { carregarIndexDist, injetarCssDoIndexDist, regrasDe } from "./dist.js";
import { renderizarExperiencia } from "../src/render/experiencia.js";
import { experiencia } from "../src/data/experiencia.js";

/*
 * CA-5.1 e CA-5.2 contra o dist/index.html montado; o renderizador também é testado sozinho
 * (escape e formatos de período). CA-5.4 tem aqui a metade estática (regras do CSS do build que
 * impedem corte); a metade de layout real fica em tests/roteiros/experiencia-habilidades-navegador.mjs.
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
let itens;

beforeAll(() => {
  secao = carregarIndexDist().getElementById("experiencia");
  itens = [...secao.querySelectorAll("ol.experience-list > li")];
});

const texto = (el) => normalizar(el.textContent);
const anos = (el) => [...el.querySelectorAll("time")].map((tempo) => tempo.getAttribute("datetime"));

describe("#experiencia no dist", () => {
  it("CA-5.1 · o primeiro item é a Bruning Sistemas com web e dados no mesmo bloco, marcado como atual", () => {
    expect(itens.length).toBe(experiencia.length);
    const [primeiro] = itens;

    expect(texto(primeiro.querySelector("h3"))).toBe("Bruning Sistemas");
    expect(texto(primeiro.querySelector(".experience-cargo"))).toBe("Desenvolvedor Web e Migração de Dados");

    const frentes = [...primeiro.querySelectorAll(".experience-frentes > li")].map(texto);
    const web = frentes.find((frente) => frente.toLowerCase().includes("desenvolvimento web"));
    expect(web, "frente de desenvolvimento web").toBeDefined();
    expect(web).toContain("Laravel");
    expect(web).toContain("Nuxt.js");
    expect(frentes.some((frente) => frente.toLowerCase().includes("migração, integração e importação de dados"))).toBe(true);

    expect(primeiro.classList.contains("experience-item--atual")).toBe(true);
    expect(texto(primeiro.querySelector(".experience-periodo .experience-situacao"))).toBe("atual");
    expect(texto(primeiro.querySelector(".experience-periodo"))).toBe("2024 · atual");
    expect(anos(primeiro.querySelector(".experience-periodo"))).toEqual(["2024"]);
    expect(texto(primeiro.querySelector(".experience-marcos"))).toBe("Estagiário desde 2024 · em tempo integral desde 2025");
    expect(anos(primeiro.querySelector(".experience-marcos"))).toEqual(["2024", "2025"]);

    // Só a Bruning é atual
    expect(secao.querySelectorAll(".experience-item--atual")).toHaveLength(1);
  });

  it("CA-5.2 · Engenharia de Software na UNISATC aparece em andamento, desde 2026", () => {
    const unisatc = itens.find((item) => texto(item.querySelector("h3")) === "UNISATC");
    expect(unisatc).toBeDefined();
    expect(texto(unisatc.querySelector(".experience-cargo"))).toBe("Engenharia de Software");
    expect(texto(unisatc.querySelector(".experience-periodo"))).toBe("2026 · em andamento");
    expect(anos(unisatc)).toEqual(["2026"]);
  });

  it("CA-5.2 · técnico em ADS no SENAI Tubarão, de 2023 a 2024", () => {
    const senai = itens.find((item) => texto(item.querySelector("h3")) === "SENAI Tubarão");
    expect(senai).toBeDefined();
    expect(texto(senai.querySelector(".experience-cargo"))).toBe("Técnico em Análise e Desenvolvimento de Sistemas");
    expect(texto(senai.querySelector(".experience-periodo"))).toBe("2023 a 2024");
    expect(anos(senai)).toEqual(["2023", "2024"]);
  });

  it("CA-5.2 · a transição para Cloud/DevOps é estudo em andamento, sem cargo de DevOps", () => {
    const cloud = itens.find((item) => /cloud/i.test(texto(item.querySelector("h3"))));
    expect(cloud).toBeDefined();
    expect(texto(cloud.querySelector("h3"))).toBe("Transição para Cloud Engineering, com objetivo em DevOps");
    expect(texto(cloud.querySelector(".experience-periodo"))).toBe("em andamento");
    expect(texto(cloud).toLowerCase()).toContain("estudo em andamento");
    expect(cloud.classList.contains("experience-item--atual")).toBe(false);
    expect(cloud.querySelector(".experience-cargo"), "não há cargo nem empresa no item de estudo").toBeNull();

    // Nenhum cargo da seção cita DevOps, e nenhum texto se apresenta como profissional de DevOps
    const cargos = [...secao.querySelectorAll(".experience-cargo")].map(texto);
    expect(cargos.filter((cargo) => /devops/i.test(cargo))).toEqual([]);
    expect(texto(secao)).not.toMatch(/(engenheiro|analista|especialista|desenvolvedor)\s+(de\s+)?devops/i);
  });

  it("CA-5.2 · a formação mantém os cursos complementares do site atual", () => {
    const cursos = itens.find((item) => texto(item.querySelector("h3")) === "Cursos complementares");
    expect(cursos).toBeDefined();
    expect(texto(cursos)).toContain("Redes (Google, pela Coursera), AWS e Alura");
  });

  it("CA-5.2 · o texto da seção não usa travessão", () => {
    expect(secao.textContent).not.toMatch(/[—–]/);
  });
});

describe("render · renderizarExperiencia", () => {
  it("CA-5.1 · gera uma <ol> com um <li> por item, na ordem dos dados", () => {
    const lista = fragmento(renderizarExperiencia(experiencia)).querySelector("ol.experience-list");
    const titulos = [...lista.children].map((li) => texto(li.querySelector("h3")));
    expect(titulos).toEqual(experiencia.map((item) => item.organizacao ?? item.papel));
  });

  it("CA-5.2 · formata os períodos com <time datetime> e omite o que não foi informado", () => {
    const html = renderizarExperiencia([
      { organizacao: "A", papel: "x", periodo: { inicio: 2020, fim: 2021 } },
      { organizacao: "B", papel: "y", periodo: { inicio: 2022, situacao: "atual" } },
      { papel: "C", periodo: { situacao: "em andamento" } },
      { papel: "D" },
    ]);
    const [a, b, c, d] = [...fragmento(html).querySelectorAll("li.experience-item")];
    expect(texto(a.querySelector(".experience-periodo"))).toBe("2020 a 2021");
    expect(anos(a)).toEqual(["2020", "2021"]);
    expect(b.classList.contains("experience-item--atual")).toBe(true);
    expect(texto(b.querySelector(".experience-periodo"))).toBe("2022 · atual");
    expect(texto(c.querySelector(".experience-periodo"))).toBe("em andamento");
    expect(c.querySelector(".experience-cargo")).toBeNull();
    expect(d.querySelector(".experience-periodo")).toBeNull();
    expect(d.querySelector("ul")).toBeNull();
    expect(texto(d)).toBe("D");
  });

  it("CA-5.1 · escapa todo texto vindo dos dados", () => {
    const html = renderizarExperiencia([
      {
        organizacao: "<script>x</script>",
        papel: '"papel" & <b>',
        periodo: { inicio: '2020"><i>', situacao: "<em>atual</em>" },
        marcos: [{ rotulo: "<u>desde</u>", ano: "<s>" }],
        frentes: ["<img src=x onerror=alert(1)>"],
        descricao: "a & b",
        tecnologias: ["<x>"],
      },
    ]);
    expect(html).not.toMatch(/<(script|b|i|em|u|s|img|x)[\s>]/);
    const item = fragmento(html).querySelector("li");
    expect(texto(item.querySelector("h3"))).toBe("<script>x</script>");
    expect(texto(item.querySelector(".experience-cargo"))).toBe('"papel" & <b>');
    expect(item.querySelector("time").getAttribute("datetime")).toBe('2020"><i>');
    expect(texto(item.querySelector(".experience-frentes li"))).toBe("<img src=x onerror=alert(1)>");
    expect(texto(item.querySelector(".experience-stack li"))).toBe("<x>");
  });
});

describe("CSS de #experiencia no build", () => {
  let folha;

  beforeAll(() => {
    folha = injetarCssDoIndexDist();
  });

  it("CA-5.4 · a linha do tempo usa colunas minmax(0, 1fr), que encolhem em vez de estourar a largura", () => {
    const colunas = regrasDe(folha, ".experience-item")
      .map((estilo) => estilo.getPropertyValue("grid-template-columns"))
      .filter(Boolean);
    expect(colunas.length).toBeGreaterThanOrEqual(2);
    expect(colunas.filter((valor) => !/minmax\(0,\s*1fr\)/.test(valor))).toEqual([]);
    expect(regrasDe(folha, ".experience-item").some((estilo) => estilo.getPropertyValue("min-width") === "0px" ||
      estilo.getPropertyValue("min-width") === "0")).toBe(true);
  });

  it("CA-5.4 · a lista de tecnologias quebra linha", () => {
    const quebra = regrasDe(folha, ".experience-stack").map((estilo) => estilo.getPropertyValue("flex-wrap"));
    expect(quebra).toContain("wrap");
  });

  it("Movimento · a seção não declara transição nem animação própria fora da revelação de main.js", () => {
    const seletores = [".experience-list", ".experience-item", ".experience-item::before", ".experience-item::after",
      ".experience-titulo", ".experience-cargo", ".experience-periodo", ".experience-frentes li", ".experience-stack li"];
    const animadas = seletores.flatMap((seletor) =>
      regrasDe(folha, seletor)
        .filter((estilo) => estilo.getPropertyValue("transition") || estilo.getPropertyValue("animation") ||
          estilo.getPropertyValue("animation-name"))
        .map(() => seletor),
    );
    expect(animadas).toEqual([]);
  });
});
