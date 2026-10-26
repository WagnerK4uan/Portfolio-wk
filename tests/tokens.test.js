// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { raizDoProjeto } from "./dist.js";
import { lerTokensDoRoot, razaoDeContraste } from "./cores.js";

const pastaEstilos = path.join(raizDoProjeto, "src", "styles");
const caminhoTokens = path.join(pastaEstilos, "tokens.css");

function tokens() {
  expect(existsSync(caminhoTokens), "src/styles/tokens.css existe").toBe(true);
  return lerTokensDoRoot(readFileSync(caminhoTokens, "utf8"));
}

function semComentarios(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

const GRUPOS = {
  cor: [
    "--cor-fundo",
    "--cor-superficie-1",
    "--cor-superficie-2",
    "--cor-superficie-3",
    "--cor-texto-forte",
    "--cor-texto-suave",
    "--cor-borda",
    "--cor-violeta-marca",
    "--cor-violeta-acao",
    "--cor-violeta-acao-hover",
    "--cor-violeta-texto",
    "--cor-texto-sobre-acao",
    "--cor-foco",
  ],
  tipografia: [
    "--fonte-display",
    "--fonte-texto",
    "--fonte-campo",
    "--tipo-xs",
    "--tipo-sm",
    "--tipo-base",
    "--tipo-lg",
    "--tipo-xl",
    "--tipo-2xl",
    "--tipo-3xl",
    "--tipo-display",
  ],
  espaco: [
    "--espaco-1",
    "--espaco-2",
    "--espaco-3",
    "--espaco-4",
    "--espaco-5",
    "--espaco-6",
    "--espaco-7",
    "--espaco-8",
  ],
  raio: ["--raio-sm", "--raio-md", "--raio-pilula"],
  movimento: [
    "--duracao-rapida",
    "--duracao-media",
    "--duracao-lenta",
    "--ease-out",
    "--ease-in-out",
  ],
};

describe("src/styles/tokens.css", () => {
  it("CA-2.2 · :root declara os grupos cor, tipografia, espaço, raio e movimento", () => {
    const declarados = tokens();
    const ausentes = Object.entries(GRUPOS).flatMap(([grupo, nomes]) =>
      nomes.filter((nome) => !(nome in declarados)).map((nome) => `${grupo}: ${nome}`)
    );
    expect(ausentes).toEqual([]);

    const coresForaDeOklch = GRUPOS.cor.filter((nome) => !/^oklch\(/.test(declarados[nome]));
    expect(coresForaDeOklch).toEqual([]);

    const escalaSemClamp = GRUPOS.tipografia
      .filter((nome) => nome.startsWith("--tipo-"))
      .filter((nome) => !/^clamp\(/.test(declarados[nome]));
    expect(escalaSemClamp).toEqual([]);

    const duracoes = GRUPOS.movimento.filter((nome) => nome.startsWith("--duracao-"));
    expect(duracoes.filter((nome) => !/^\d+m?s$/.test(declarados[nome]))).toEqual([]);
    const curvas = GRUPOS.movimento.filter((nome) => nome.startsWith("--ease-"));
    expect(curvas.filter((nome) => !/^cubic-bezier\(/.test(declarados[nome]))).toEqual([]);
  });

  it("CA-2.2 · nenhuma cor hexadecimal ou oklch( aparece fora de tokens.css em src/styles/", () => {
    const outros = readdirSync(pastaEstilos, { recursive: true })
      .filter((arquivo) => arquivo.endsWith(".css"))
      .filter((arquivo) => path.join(pastaEstilos, arquivo) !== caminhoTokens);
    expect(outros.length).toBeGreaterThan(0);

    const violacoes = outros.flatMap((arquivo) => {
      const css = semComentarios(readFileSync(path.join(pastaEstilos, arquivo), "utf8"));
      const achados = css.match(/#[0-9a-fA-F]{3,8}\b|oklch\(/g) || [];
      return achados.map((achado) => `${arquivo}: ${achado}`);
    });
    expect(violacoes).toEqual([]);
  });
});

/*
 * Pares texto/fundo realmente usados no site. Texto normal pede 4,5:1; texto grande, ícone e
 * anel de foco (componente não textual) pedem 3:1 (WCAG 2.1, 1.4.3 e 1.4.11).
 */
const SUPERFICIES = ["--cor-fundo", "--cor-superficie-1", "--cor-superficie-2", "--cor-superficie-3"];
const PARES_TEXTO_NORMAL = [
  ...SUPERFICIES.map((fundo) => ["--cor-texto-forte", fundo]),
  ...SUPERFICIES.map((fundo) => ["--cor-texto-suave", fundo]),
  ...SUPERFICIES.map((fundo) => ["--cor-violeta-texto", fundo]),
  ["--cor-texto-sobre-acao", "--cor-violeta-acao"],
  ["--cor-texto-sobre-acao", "--cor-violeta-acao-hover"],
];
const PARES_GRANDE_OU_ICONE = [
  ...SUPERFICIES.map((fundo) => ["--cor-violeta-marca", fundo]),
  ...SUPERFICIES.map((fundo) => ["--cor-foco", fundo]),
];

describe("Contraste dos tokens", () => {
  it("CA-2.3 · texto normal fica em 4,5:1 ou mais", () => {
    const declarados = tokens();
    const reprovados = PARES_TEXTO_NORMAL.map(([texto, fundo]) => ({
      par: `${texto} sobre ${fundo}`,
      razao: razaoDeContraste(declarados[texto], declarados[fundo]),
    })).filter(({ razao }) => !(razao >= 4.5));
    expect(reprovados).toEqual([]);
  });

  it("CA-2.3 · texto grande, ícone e foco ficam em 3:1 ou mais", () => {
    const declarados = tokens();
    const reprovados = PARES_GRANDE_OU_ICONE.map(([texto, fundo]) => ({
      par: `${texto} sobre ${fundo}`,
      razao: razaoDeContraste(declarados[texto], declarados[fundo]),
    })).filter(({ razao }) => !(razao >= 3));
    expect(reprovados).toEqual([]);
  });

  it("CA-2.3 · a conversão oklch → sRGB bate com valores de referência", () => {
    // Branco, preto e o contraste máximo conhecido (21:1) validam a conversão e a fórmula.
    expect(razaoDeContraste("oklch(1 0 0)", "oklch(0 0 0)")).toBeCloseTo(21, 1);
    // oklch(0.628 0.2577 29.23) é o vermelho sRGB puro (#ff0000): contraste 4,0:1 com branco.
    expect(razaoDeContraste("oklch(0.628 0.2577 29.23)", "oklch(1 0 0)")).toBeCloseTo(4, 1);
  });
});
