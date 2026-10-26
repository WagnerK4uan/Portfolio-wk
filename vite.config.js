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

export default defineConfig({
  plugins: [renderDeConteudo()],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
  },
});
