import path from "node:path";
import { defineConfig } from "vite";
import { renderizarMarcadores } from "./src/render/index.js";

/**
 * Render no build: troca os marcadores <!-- render:nome --> do index.html pelo HTML gerado a partir
 * de src/data/. Roda antes do processamento de HTML do Vite (order "pre"), então as imagens geradas
 * passam pelo mesmo tratamento das escritas à mão, e o conteúdo sai estático, legível sem JavaScript.
 */
function renderDeConteudo() {
  return {
    name: "portfolio-render-de-conteudo",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => renderizarMarcadores(html),
    },
  };
}

/**
 * Fonte pré-carregada: só o subconjunto latin da Atkinson Hyperlegible Next, a fonte do texto da
 * ficha do hero, que é o elemento de LCP no celular. A Bricolage Grotesque (opsz, 75 KB, dos
 * títulos) ficou de fora de propósito: no Lighthouse mobile, pré-carregar as duas disputa banda com o
 * CSS e o JS e piorou o LCP de ~2,27 s para ~2,41 s; só a Atkinson, ficou em ~2,27 s (Spec 8).
 */
const FONTES_DO_HERO = [/^atkinson-hyperlegible-next-latin-wght-normal-[\w-]+\.woff2$/];

/**
 * Preload das fontes do hero: no build, procura no bundle gerado os woff2 de FONTES_DO_HERO (o nome
 * leva o hash, então não dá para escrever à mão no index.html) e injeta um
 * <link rel="preload" as="font" crossorigin> para cada um, para o texto do hero não esperar o CSS
 * ser baixado e lido antes de pedir a fonte. Fora do build (npm run dev) não faz nada.
 */
function preloadDasFontesDoHero() {
  let base = "/";
  return {
    name: "portfolio-preload-fontes-do-hero",
    apply: "build",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler: (html, { bundle }) => {
        const arquivos = Object.keys(bundle ?? {});
        return FONTES_DO_HERO.flatMap((padrao) => {
          const arquivo = arquivos.find((nome) => padrao.test(path.posix.basename(nome)));
          if (!arquivo) throw new Error(`Fonte do hero não encontrada no bundle: ${padrao}`);
          return {
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", crossorigin: true, href: base + arquivo },
            injectTo: "head",
          };
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [renderDeConteudo(), preloadDasFontesDoHero()],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
  },
});
