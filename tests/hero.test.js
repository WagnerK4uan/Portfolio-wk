import { beforeAll, describe, expect, it } from "vitest";
import { lerCssDoIndexDist } from "./dist.js";
import { montarPaginaDoDist } from "./pagina.js";

/*
 * O jsdom não mede layout nem avalia media queries. Aqui fica a metade estática de CA-4.4 e
 * CA-4.5 (marcação do hero e regras do CSS do build); a metade de layout real (primeiro viewport
 * e rolagem horizontal em 320, 375, 768 e 1440 px, animações sob movimento reduzido) é provada
 * pelo roteiro de navegador em tests/roteiros/hero-navegador.mjs, com screenshots.
 */

function normalizar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

let home;
let folha;

beforeAll(() => {
  montarPaginaDoDist();
  home = document.getElementById("home");
  const estilo = document.createElement("style");
  estilo.textContent = lerCssDoIndexDist();
  document.head.appendChild(estilo);
  folha = estilo.sheet;
});

/** Percorre as regras de estilo do CSS, com a lista de media queries que as envolvem. */
function regrasComContexto(regras, medias = []) {
  return [...regras].flatMap((regra) => {
    if (regra.media && regra.cssRules) return regrasComContexto(regra.cssRules, [...medias, regra.media.mediaText]);
    if (regra.selectorText) return [{ regra, medias }];
    return [];
  });
}

/** A regra alcança algum elemento do hero (o pseudo-elemento conta como o elemento dono). */
function alcancaOHero(seletor) {
  return seletor.split(",").some((parte) => {
    const base = parte.replace(/::?(before|after)\b/g, "").trim() || "*";
    try {
      return home.matches(base) || home.querySelector(base) !== null;
    } catch {
      return false;
    }
  });
}

function animacaoDeclarada(estilo) {
  const nome = estilo.getPropertyValue("animation-name") || estilo.getPropertyValue("animation");
  return nome && !/^none\b/.test(nome.trim()) ? nome.trim() : "";
}

const SEM_PREFERENCIA = /prefers-reduced-motion:\s*no-preference/;

describe("hero", () => {
  it("CA-4.4 · #home tem nome, cargo, frase e os dois botões, com o texto aprovado em P-3.2", () => {
    expect(normalizar(home.querySelector("h1").textContent)).toBe("Wagner Kauan");
    expect(normalizar(home.querySelector(".hero-cargo").textContent)).toBe(
      "Desenvolvedor Web e Migração de Dados na Bruning Sistemas",
    );
    expect(normalizar(home.querySelector(".hero-posicionamento").textContent)).toBe(
      "Desenvolvo sistemas web com Laravel e Nuxt.js, migro dados reais de clientes entre sistemas e estou em transição para Cloud e DevOps.",
    );

    const botoes = [...home.querySelectorAll(".hero-acoes a.btn")].map((link) => [
      normalizar(link.textContent),
      link.getAttribute("href"),
    ]);
    expect(botoes).toEqual([
      ["Ver projetos", "#projetos"],
      ["Entrar em contato", "#contato"],
    ]);
  });

  it("CA-4.4 · a foto do hero tem alt, fetchpriority=high e dimensões declaradas", () => {
    const fotos = [...home.querySelectorAll("img")];
    expect(fotos).toHaveLength(1);
    const [foto] = fotos;
    expect(foto.getAttribute("src")).toMatch(/foto-wagner\.webp$/);
    expect(foto.getAttribute("alt").trim().length).toBeGreaterThan(0);
    expect(foto.getAttribute("fetchpriority")).toBe("high");
    expect(foto.getAttribute("loading")).not.toBe("lazy");
    expect(foto.getAttribute("width")).toBe("440");
    expect(foto.getAttribute("height")).toBe("487");
  });

  it("CA-4.4 · nomes de campo e conectores são decorativos e ficam fora da árvore de acessibilidade", () => {
    const decorativos = [...home.querySelectorAll(".ficha-campo, .ficha-conector, .ficha-cab")];
    expect(decorativos.length).toBeGreaterThan(0);
    expect(decorativos.filter((el) => !el.closest('[aria-hidden="true"]'))).toEqual([]);
  });

  it("CA-4.5 · nenhuma regra fora de prefers-reduced-motion: no-preference anima elementos do hero", () => {
    const violacoes = regrasComContexto(folha.cssRules)
      .filter(({ medias }) => !medias.some((media) => SEM_PREFERENCIA.test(media)))
      .filter(({ regra }) => alcancaOHero(regra.selectorText))
      .filter(({ regra }) => animacaoDeclarada(regra.style))
      .map(({ regra, medias }) => `${medias.join(" ")} ${regra.selectorText}: ${animacaoDeclarada(regra.style)}`);
    expect(violacoes).toEqual([]);
  });

  it("CA-4.5 · a entrada existe só sem preferência de movimento e anima apenas opacity e transform", () => {
    const animadas = regrasComContexto(folha.cssRules)
      .filter(({ medias }) => medias.some((media) => SEM_PREFERENCIA.test(media)))
      .filter(({ regra }) => alcancaOHero(regra.selectorText))
      .map(({ regra }) => animacaoDeclarada(regra.style))
      .filter(Boolean);
    expect(animadas.length, "o hero tem entrada coreografada").toBeGreaterThanOrEqual(4);

    const nomes = new Set(animadas.map((valor) => valor.match(/hero-[\w-]+/)?.[0]).filter(Boolean));
    expect(nomes.size).toBeGreaterThan(0);

    const keyframes = [...folha.cssRules].filter((regra) => nomes.has(regra.name) && regra.cssRules);
    expect(keyframes.map((regra) => regra.name).sort()).toEqual([...nomes].sort());

    const propriedades = new Set(
      keyframes.flatMap((regra) =>
        [...regra.cssRules].flatMap((quadro) => [...quadro.style].map((propriedade) => propriedade)),
      ),
    );
    expect([...propriedades].filter((propriedade) => !["opacity", "transform"].includes(propriedade))).toEqual([]);
  });
});
