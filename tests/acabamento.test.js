import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { carregarIndexDist, lerIndexDist, pastaDist, raizDoProjeto } from "./dist.js";
import { lerTokensDoRoot, oklchParaSrgbLinear } from "./cores.js";

/*
 * Spec 8 · acabamento. CA-8.1 lê o <head> do dist/index.html e o cabeçalho do PNG da imagem OG;
 * CA-8.4 cruza os arquivos de dist/img/ com as referências do HTML, do CSS e do JS do build;
 * CA-8.5 confere, por nome, o frontmatter do DESIGN.md e o colorMeta de .impeccable/design.json
 * contra as cores de src/styles/tokens.css, e o README.md.
 * CA-8.2 e CA-8.3 são provados pelos relatórios de benchmark, Lighthouse e audit, fora do npm test.
 */

const TRAVESSOES = /[—–]/;
const URL_DO_SITE = "https://portfolio-wk.vercel.app";
const URL_DA_IMAGEM_OG = `${URL_DO_SITE}/img/og.png`;
const LIMITE_DESCRICAO = 160;

/** Largura e altura gravadas no chunk IHDR de um PNG (bytes 16 a 24, big-endian). */
function dimensoesDoPng(caminho) {
  const bytes = readFileSync(caminho);
  const assinatura = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const ihdr = bytes.subarray(12, 16).toString("latin1") === "IHDR";
  if (!assinatura || !ihdr) throw new Error(`${caminho} não é um PNG válido.`);
  return { largura: bytes.readUInt32BE(16), altura: bytes.readUInt32BE(20) };
}

describe("<head> do dist/index.html", () => {
  let documento;

  beforeAll(() => {
    documento = carregarIndexDist();
  });

  const conteudoDe = (seletor) => documento.head.querySelector(seletor)?.getAttribute("content") ?? null;

  it("CA-8.1 · description, Open Graph e twitter:card existem, sem travessão, com og:url e og:image do domínio público", () => {
    const metas = {
      description: conteudoDe('meta[name="description"]'),
      "og:title": conteudoDe('meta[property="og:title"]'),
      "og:description": conteudoDe('meta[property="og:description"]'),
      "og:image": conteudoDe('meta[property="og:image"]'),
      "og:url": conteudoDe('meta[property="og:url"]'),
      "twitter:card": conteudoDe('meta[name="twitter:card"]'),
    };

    const ausentes = Object.entries(metas)
      .filter(([, valor]) => !valor || !valor.trim())
      .map(([nome]) => nome);
    expect(ausentes, "metas ausentes ou vazias").toEqual([]);

    expect(metas["og:url"]).toBe(URL_DO_SITE);
    expect(metas["og:image"]).toBe(URL_DA_IMAGEM_OG);
    expect(conteudoDe('meta[property="og:image:width"]')).toBe("1200");
    expect(conteudoDe('meta[property="og:image:height"]')).toBe("630");
    expect(metas.description.length).toBeLessThanOrEqual(LIMITE_DESCRICAO);

    const todasAsMetas = [...documento.head.querySelectorAll("meta[content]")].map((meta) => meta.getAttribute("content"));
    const textosDoHead = [documento.title, ...todasAsMetas];
    expect(textosDoHead.filter((texto) => TRAVESSOES.test(texto))).toEqual([]);
  });

  it("CA-8.1 · public/img/og.png existe, é PNG 1200×630 e o build o copia para dist/img/", () => {
    const origem = path.join(raizDoProjeto, "public", "img", "og.png");
    expect(existsSync(origem), "public/img/og.png").toBe(true);
    expect(dimensoesDoPng(origem)).toEqual({ largura: 1200, altura: 630 });
    expect(existsSync(path.join(pastaDist, "img", "og.png")), "dist/img/og.png").toBe(true);
  });
});

/** Todos os arquivos de uma pasta, recursivo, como caminhos relativos com "/". */
function arquivosEm(pasta) {
  return readdirSync(pasta, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile())
    .map((entrada) => path.relative(pasta, path.join(entrada.parentPath, entrada.name)).split(path.sep).join("/"));
}

/** Caminhos "img/..." citados num texto (HTML, CSS ou JS), já sem a barra inicial, consulta e âncora. */
function referenciasAImagens(texto) {
  return [...texto.matchAll(/(?:^|[^\w-])\/?img\/([^"'`()\s,?#<>]+)/g)].map((m) => decodeURI(m[1]));
}

describe("dist/img/", () => {
  it("CA-8.4 · todo arquivo copiado para dist/img/ é referenciado pelo HTML, pelo CSS ou pelo JS do build", () => {
    const pastaImagens = path.join(pastaDist, "img");
    const arquivos = arquivosEm(pastaImagens);
    expect(arquivos.length).toBeGreaterThan(0);

    const pastaAssets = path.join(pastaDist, "assets");
    const textosDoBuild = [
      lerIndexDist(),
      ...readdirSync(pastaAssets)
        .filter((nome) => /\.(css|js)$/.test(nome))
        .map((nome) => readFileSync(path.join(pastaAssets, nome), "utf8")),
    ];
    const referenciados = new Set(textosDoBuild.flatMap(referenciasAImagens));

    const orfaos = arquivos.filter((arquivo) => !referenciados.has(arquivo));
    expect(orfaos, `arquivos sem referência em dist/img/: ${orfaos.join(", ")}`).toEqual([]);
  });
});

/** Converte um canal sRGB linear (0..1) para 0..255 com a curva de transferência do sRGB. */
function canalParaByte(linear) {
  const codificado = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, codificado)) * 255);
}

/** Normaliza uma cor ("#rgb", "#rrggbb" ou "oklch(L C H)") para [r, g, b] em 0..255. */
function corParaRgb(valor) {
  const texto = valor.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(texto);
  if (hex) {
    const digitos = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(digitos.slice(i, i + 2), 16));
  }
  if (texto.startsWith("oklch(")) return oklchParaSrgbLinear(texto).map(canalParaByte);
  throw new Error(`Cor em formato não suportado: ${valor}`);
}

const paraHex = (rgb) => `#${rgb.map((canal) => canal.toString(16).padStart(2, "0")).join("")}`;

/** Hex "#rrggbb" em minúsculas, expandindo a forma curta "#rgb". */
const hexNormalizado = (valor) => paraHex(corParaRgb(valor));

/** Valor de cor com espaços colapsados, para comparar oklch() escritos à mão. */
const semEspacosExtras = (valor) => valor.trim().replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

/**
 * Nome no DESIGN.md (e em .impeccable/design.json) de cada token de cor: o nome do token sem o
 * prefixo `--cor-`, exceto os três renomeados abaixo. Token novo sem entrada aqui segue a regra geral.
 */
const NOMES_DOCUMENTADOS_DIFERENTES = {
  "--cor-fundo": "fundo-noturno",
  "--cor-borda": "borda-fina",
  "--cor-foco": "foco-menta",
};
const nomeDocumentado = (token) => NOMES_DOCUMENTADOS_DIFERENTES[token] ?? token.replace(/^--cor-/, "");

/** { "nome-documentado": { token, valor } } para cada --cor-* de src/styles/tokens.css. */
function coresDosTokensPorNome() {
  const tokens = lerTokensDoRoot(readFileSync(path.join(raizDoProjeto, "src", "styles", "tokens.css"), "utf8"));
  return Object.fromEntries(
    Object.entries(tokens)
      .filter(([nome]) => nome.startsWith("--cor-"))
      .map(([token, valor]) => [nomeDocumentado(token), { token, valor }]),
  );
}

/** Nomes que faltam de um lado e sobram do outro, para a mensagem de falha. */
function diferencaDeNomes(esperados, documentados) {
  return {
    semEntrada: esperados.filter((nome) => !documentados.includes(nome)),
    semToken: documentados.filter((nome) => !esperados.includes(nome)),
  };
}

/**
 * Lê o bloco `colors:` do frontmatter YAML do DESIGN.md: as linhas indentadas `nome: "valor"` logo
 * abaixo de `colors:`, até a próxima chave de nível zero. Sem dependência de parser YAML.
 */
function coresDoFrontmatter(markdown) {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(markdown.replace(/\r\n/g, "\n"));
  if (!frontmatter) throw new Error("DESIGN.md sem frontmatter YAML.");
  const linhas = frontmatter[1].split("\n");
  const inicio = linhas.findIndex((linha) => /^colors:\s*$/.test(linha));
  if (inicio === -1) throw new Error("Frontmatter do DESIGN.md sem o bloco colors:.");

  const cores = {};
  for (const linha of linhas.slice(inicio + 1)) {
    if (/^\S/.test(linha)) break;
    const par = /^\s+([\w-]+):\s*(["']?)(.+?)\2\s*$/.exec(linha);
    if (par) cores[par[1]] = par[3].trim();
  }
  return cores;
}

describe("Documentação do sistema", () => {
  it("CA-8.5 · as cores do frontmatter do DESIGN.md são, por nome, exatamente as cores de src/styles/tokens.css", () => {
    const tokens = coresDosTokensPorNome();
    expect(Object.keys(tokens).length).toBeGreaterThan(0);
    const documentadas = coresDoFrontmatter(readFileSync(path.join(raizDoProjeto, "DESIGN.md"), "utf8"));

    expect(diferencaDeNomes(Object.keys(tokens), Object.keys(documentadas)), "nomes de cor entre tokens.css e DESIGN.md").toEqual({
      semEntrada: [],
      semToken: [],
    });

    // Igualdade exata do hex: o token oklch() convertido para sRGB de 8 bits contra o hex documentado.
    const divergentes = Object.entries(tokens)
      .map(([nome, { token, valor }]) => ({ nome, token, doToken: hexNormalizado(valor), documentado: hexNormalizado(documentadas[nome]) }))
      .filter(({ doToken, documentado }) => doToken !== documentado)
      .map(({ nome, token, doToken, documentado }) => `${nome}: DESIGN.md ${documentado}, ${token} ${doToken}`);
    expect(divergentes, "cores do DESIGN.md diferentes do token de mesmo nome").toEqual([]);
  });

  it("CA-8.5 · extensions.colorMeta do .impeccable/design.json tem as mesmas cores, com canonical igual ao token", () => {
    const tokens = coresDosTokensPorNome();
    const { colorMeta } = JSON.parse(readFileSync(path.join(raizDoProjeto, ".impeccable", "design.json"), "utf8")).extensions;
    const documentadas = coresDoFrontmatter(readFileSync(path.join(raizDoProjeto, "DESIGN.md"), "utf8"));

    expect(diferencaDeNomes(Object.keys(tokens), Object.keys(colorMeta)), "nomes de cor entre tokens.css e design.json").toEqual({
      semEntrada: [],
      semToken: [],
    });
    expect(Object.keys(colorMeta).sort(), "colorMeta com as mesmas chaves do frontmatter").toEqual(Object.keys(documentadas).sort());

    const divergentes = Object.entries(tokens).flatMap(([nome, { token, valor }]) => {
      const meta = colorMeta[nome];
      const erros = [];
      if (semEspacosExtras(meta.canonical ?? "") !== semEspacosExtras(valor)) {
        erros.push(`${nome}: canonical ${meta.canonical}, ${token} ${valor}`);
      }
      // Campos de hex da própria cor (não a tonalRamp), se o arquivo os trouxer, também são exatos.
      for (const [campo, conteudo] of Object.entries(meta)) {
        if (typeof conteudo === "string" && /^#[0-9a-f]{3,6}$/i.test(conteudo.trim()) && hexNormalizado(conteudo) !== hexNormalizado(valor)) {
          erros.push(`${nome}.${campo}: ${conteudo}, ${token} ${hexNormalizado(valor)}`);
        }
      }
      return erros;
    });
    expect(divergentes, "colorMeta diferente do token de mesmo nome").toEqual([]);
  });

  it("CA-8.5 · o README.md descreve Vite, npm run dev, npm run build e npm test", () => {
    const readme = readFileSync(path.join(raizDoProjeto, "README.md"), "utf8");
    const ausentes = ["Vite", "npm run dev", "npm run build", "npm test"].filter((termo) => !readme.includes(termo));
    expect(ausentes).toEqual([]);
  });
});
