// @vitest-environment node
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createServer } from "vite";
import { arquivoNoDist, caminhoIndexDist, lerIndexDist, raizDoProjeto } from "./dist.js";

describe("Build e servidor de desenvolvimento", () => {
  it("CA-1.1 · dist/index.html existe e referencia CSS e JS com hash em dist/assets/", () => {
    expect(existsSync(caminhoIndexDist)).toBe(true);
    const html = lerIndexDist();

    const scripts = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]);
    const estilos = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((href) => !/^https?:/.test(href));

    const comHash = (ext) => new RegExp(`^/assets/[\\w-]+-[\\w-]{8,}\\.${ext}$`);
    const js = scripts.filter((src) => comHash("js").test(src));
    const css = estilos.filter((href) => comHash("css").test(href));

    expect(js).toHaveLength(1);
    expect(css).toHaveLength(1);
    expect(existsSync(arquivoNoDist(js[0]))).toBe(true);
    expect(existsSync(arquivoNoDist(css[0]))).toBe(true);
    expect(html).not.toContain("/src/main.js");
  });

  it("CA-1.1 · npm run dev serve a mesma página em localhost", async () => {
    const servidor = await createServer({
      root: raizDoProjeto,
      logLevel: "silent",
      server: { port: 0, host: "localhost" },
    });
    await servidor.listen();
    try {
      const endereco = servidor.resolvedUrls.local[0];
      const resposta = await fetch(endereco);
      expect(resposta.status).toBe(200);
      const html = await resposta.text();
      expect(html).toContain('<script type="module" src="/src/main.js"></script>');
      expect(html).toContain('id="home"');

      const entrada = await fetch(new URL("/src/main.js", endereco));
      expect(entrada.status).toBe(200);
    } finally {
      await servidor.close();
    }
  });
});
