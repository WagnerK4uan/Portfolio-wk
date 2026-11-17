/* Injeta em dist/index.html (pt) e dist/en/index.html (en) o HTML gerado por src/entry-server.jsx
   (build SSR em dist-ssr/) */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const servidor = path.join(raiz, "dist-ssr", "entry-server.js");
const { render } = await import(pathToFileURL(servidor).href);

const paginas = [
  ["pt", path.join(raiz, "dist", "index.html")],
  ["en", path.join(raiz, "dist", "en", "index.html")],
];

/* as versões alternativas de cada página (o Vite trataria o href de pasta como arquivo, então entram aqui) */
const alternativas = {
  pt: '<link rel="alternate" hreflang="pt-BR" href="./" /><link rel="alternate" hreflang="en" href="en/" />',
  en: '<link rel="alternate" hreflang="pt-BR" href="../" /><link rel="alternate" hreflang="en" href="./" />',
};

for (const [idioma, pagina] of paginas) {
  const { header, main, footer } = render(idioma);
  let html = fs.readFileSync(pagina, "utf8");
  const trocas = [
    ['<header class="nav" id="topo"></header>', `<header class="nav" id="topo">${header}</header>`],
    ['<main id="conteudo" tabindex="-1"></main>', `<main id="conteudo" tabindex="-1">${main}</main>`],
    ['<footer class="closing" id="contato" aria-labelledby="contato-h"></footer>', `<footer class="closing" id="contato" aria-labelledby="contato-h">${footer}</footer>`],
  ];
  trocas.push(["</head>", `${alternativas[idioma]}</head>`]);
  for (const [vazio, cheio] of trocas) {
    if (!html.includes(vazio)) throw new Error(`prerender (${idioma}): marcador não encontrado: ${vazio}`);
    html = html.replace(vazio, cheio);
  }
  fs.writeFileSync(pagina, html);
  console.log(`prerender: ${path.relative(raiz, pagina)} (${idioma}) com header, main e footer prontos`);
}
fs.rmSync(path.join(raiz, "dist-ssr"), { recursive: true, force: true });
