/**
 * Leitura de custom properties e cálculo de contraste WCAG a partir de cores oklch().
 * Conversão: OKLCH → OKLab → LMS → sRGB linear (matrizes de Björn Ottosson), recortada ao gamut.
 */

/** Devolve { "--nome": "valor" } com as custom properties declaradas nos blocos :root do CSS. */
export function lerTokensDoRoot(css) {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens = {};
  for (const bloco of semComentarios.matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const [, nome, valor] of bloco[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[nome] = valor.trim().replace(/\s+/g, " ");
    }
  }
  return tokens;
}

/** Converte "oklch(L C H)" ou "oklch(L C H / A)" em sRGB linear [r, g, b], cada canal em 0..1. */
export function oklchParaSrgbLinear(valor) {
  // Aceita a forma escrita em tokens.css e a minificada pelo build (ex.: "oklch(14%.012 290)").
  const corpo = /^oklch\(([^)]*)\)$/.exec(valor.trim());
  const numeros = corpo && corpo[1].split("/")[0].match(/\d*\.?\d+%?/g);
  if (!numeros || numeros.length !== 3) throw new Error(`Cor fora do formato oklch(L C H): ${valor}`);
  const [textoL, textoC, textoH] = numeros;
  const L = textoL.endsWith("%") ? parseFloat(textoL) / 100 : parseFloat(textoL);
  const C = parseFloat(textoC);
  const h = (parseFloat(textoH) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const mm = m_ ** 3;
  const s = s_ ** 3;

  const rgb = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return rgb.map((canal) => Math.min(1, Math.max(0, canal)));
}

/** Luminância relativa WCAG 2.1 a partir do sRGB linear. */
export function luminanciaRelativa(valor) {
  const [r, g, b] = oklchParaSrgbLinear(valor);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores oklch(), de 1 a 21. */
export function razaoDeContraste(corA, corB) {
  const [clara, escura] = [luminanciaRelativa(corA), luminanciaRelativa(corB)].sort((x, y) => y - x);
  return (clara + 0.05) / (escura + 0.05);
}
