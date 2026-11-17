import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const pagina = (caminho) => fileURLToPath(new URL(caminho, import.meta.url));

export default defineConfig({
  /* Caminhos relativos: o build abre tanto na raiz da Vercel quanto servido de uma pasta */
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    /* duas páginas: / em português e /en/ em inglês, com o mesmo bundle */
    rollupOptions: {
      input: { pt: pagina("./index.html"), en: pagina("./en/index.html") },
    },
  },
});
