// @vitest-environment node
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { escapar, textoComCodigo } from "../src/render/escape.js";
import { renderizarProjetos } from "../src/render/projetos.js";
import { renderizarHabilidades } from "../src/render/habilidades.js";
import { renderizarContatos, renderizarContatosDoRodape } from "../src/render/contatos.js";
import { renderizarMarcadores } from "../src/render/index.js";
import { projetos } from "../src/data/projetos.js";
import { habilidades } from "../src/data/habilidades.js";
import { contatos } from "../src/data/contatos.js";

function fragmento(html) {
  return JSDOM.fragment(html);
}

describe("render · escape", () => {
  it("escapa os caracteres especiais de HTML", () => {
    expect(escapar(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });

  it("só crase vira <code>; qualquer outra marcação sai escapada", () => {
    expect(textoComCodigo("suporte a `.vue` e <b>nada</b>")).toBe("suporte a <code>.vue</code> e &lt;b&gt;nada&lt;/b&gt;");
  });
});

describe("render · funções puras sem build", () => {
  it("CA-3.3 · renderizarProjetos gera um <article> por projeto e escapa texto vindo dos dados", () => {
    const html = renderizarProjetos([
      ...projetos,
      { titulo: "<script>x</script>", descricao: "a & b", tags: ['"t"'], poster: { src: "img/posters/a.webp", largura: 1, altura: 1, alt: "a" }, animado: "img/a.webp", privado: true },
    ]);
    const artigos = fragmento(html).querySelectorAll("article");
    expect(artigos).toHaveLength(projetos.length + 1);
    expect(html).not.toContain("<script>");
    expect(artigos[projetos.length].querySelector("h3").textContent).toBe("<script>x</script>");
    expect(artigos[projetos.length].querySelector(".project-tags li").textContent).toBe('"t"');
  });

  it("CA-3.3 · renderizarProjetos dá link com noopener ao repositório público e selo ao privado", () => {
    const artigos = [...fragmento(renderizarProjetos(projetos)).querySelectorAll("article")];
    projetos.forEach((projeto, i) => {
      const link = artigos[i].querySelector("a");
      if (projeto.privado) {
        expect(link).toBeNull();
        expect(artigos[i].querySelector(".project-link--private")).not.toBeNull();
      } else {
        expect(link.getAttribute("href")).toBe(projeto.repositorio);
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noopener");
      }
    });
  });

  it("CA-3.3 · renderizarHabilidades gera um grupo titulado por área com os itens do arquivo", () => {
    const grupos = [...fragmento(renderizarHabilidades(habilidades)).querySelectorAll(".skill-group")];
    expect(grupos).toHaveLength(habilidades.length);
    habilidades.forEach((grupo, i) => {
      const titulo = grupos[i].querySelector("h3");
      expect(titulo.textContent).toBe(grupo.titulo);
      const lista = grupos[i].querySelector("ul");
      expect(lista.getAttribute("aria-labelledby")).toBe(titulo.id);
      expect([...lista.querySelectorAll("li")].map((li) => li.textContent.trim())).toEqual(grupo.itens.map((item) => item.nome));
    });
    const ids = grupos.map((grupo) => grupo.querySelector("h3").id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("CA-3.3 · renderizarContatos e renderizarContatosDoRodape geram os 4 canais com nome visível ou aria-label", () => {
    expect(contatos.map((contato) => contato.rede)).toEqual(["E-mail", "LinkedIn", "GitHub", "Instagram"]);

    const naSecao = [...fragmento(renderizarContatos(contatos)).querySelectorAll("a")];
    expect(naSecao.map((link) => link.getAttribute("href"))).toEqual(contatos.map((contato) => contato.href));
    naSecao.forEach((link, i) => expect(link.textContent).toContain(contatos[i].rede));

    const noRodape = [...fragmento(renderizarContatosDoRodape(contatos)).querySelectorAll("a")];
    expect(noRodape.map((link) => link.getAttribute("aria-label"))).toEqual(contatos.map((contato) => contato.rede));

    for (const link of [...naSecao, ...noRodape]) {
      const externo = !link.getAttribute("href").startsWith("mailto:");
      expect(link.getAttribute("target")).toBe(externo ? "_blank" : null);
      if (externo) expect(link.getAttribute("rel")).toBe("noopener");
    }
  });

  it("CA-3.3 · renderizarMarcadores troca cada marcador e falha no marcador desconhecido", () => {
    const html = renderizarMarcadores("<div><!-- render:a --></div><p><!--render:b--></p>", { a: () => "<i>A</i>", b: () => "B" });
    expect(html).toBe("<div><i>A</i></div><p>B</p>");
    expect(() => renderizarMarcadores("<!-- render:inexistente -->", {})).toThrow(/render:inexistente/);
  });
});
