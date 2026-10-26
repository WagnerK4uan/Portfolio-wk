import { beforeAll, describe, expect, it } from "vitest";
import { carregarIndexDist } from "./dist.js";
import { projetos } from "../src/data/projetos.js";
import { habilidades } from "../src/data/habilidades.js";
import { contatos } from "../src/data/contatos.js";
import { textoSemMarcacao } from "../src/render/escape.js";

let documento;

beforeAll(() => {
  documento = carregarIndexDist();
});

function normalizar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

describe("estrutura das seções", () => {
  it("CA-3.1 · as seções de <main> seguem a ordem nova e a nav tem um link para cada uma, menos home", () => {
    const ordemEsperada = ["home", "sobre", "experiencia", "habilidades", "projetos", "contato"];

    const secoes = [...documento.querySelectorAll("main#conteudo section")].map((secao) => secao.id);
    expect(secoes).toEqual(ordemEsperada);

    const destinosDaNav = [...documento.querySelectorAll('nav a[href^="#"]')].map((link) => link.getAttribute("href"));
    expect(destinosDaNav).toEqual(ordemEsperada.slice(1).map((id) => `#${id}`));

    const logo = documento.querySelector("header .logo");
    expect(logo.tagName).toBe("A");
    expect(logo.getAttribute("href")).toBe("#home");
    expect(logo.getAttribute("aria-label")).toMatch(/voltar ao topo/i);
  });

  it("CA-3.2 · #home diz nome, cargo atual na Bruning e leva a #projetos e #contato", () => {
    const home = documento.getElementById("home");
    const texto = normalizar(home.textContent);

    expect(texto).toContain("Wagner Kauan");
    expect(texto).toContain("Desenvolvedor Web e Migração de Dados na Bruning Sistemas");
    expect(home.querySelector("h1").textContent).toContain("Wagner Kauan");

    const destinos = [...home.querySelectorAll("a[href]")].map((link) => link.getAttribute("href"));
    expect(destinos).toContain("#projetos");
    expect(destinos).toContain("#contato");
  });
});

describe("conteúdo vindo dos arquivos de dados", () => {
  it("CA-3.3 · cada projeto de src/data/projetos.js vira um <article> com o mesmo título, descrição, tags e link", () => {
    expect(projetos).toHaveLength(5);

    const artigos = [...documento.querySelectorAll("#projetos article")];
    expect(artigos).toHaveLength(projetos.length);

    projetos.forEach((projeto, i) => {
      const artigo = artigos[i];
      expect(normalizar(artigo.querySelector("h3").textContent)).toBe(projeto.titulo);
      expect(normalizar(artigo.querySelector("p").textContent)).toBe(textoSemMarcacao(projeto.descricao));

      const tags = [...artigo.querySelectorAll(".project-tags > *")].map((tag) => normalizar(tag.textContent));
      expect(tags).toEqual(projeto.tags);

      const imagem = artigo.querySelector("img");
      expect(imagem.getAttribute("src")).toBe(projeto.preview.src);
      expect(imagem.getAttribute("alt")).toBe(projeto.preview.alt);
      expect(imagem.getAttribute("width")).toBe(String(projeto.preview.largura));
      expect(imagem.getAttribute("height")).toBe(String(projeto.preview.altura));

      const link = artigo.querySelector("a.project-link");
      if (projeto.privado) {
        expect(link, `${projeto.titulo} não tem link`).toBeNull();
        expect(normalizar(artigo.querySelector(".project-link--private").textContent)).toBe("Repositório privado");
      } else {
        expect(link.getAttribute("href")).toBe(projeto.repositorio);
      }
    });
  });

  it("CA-3.3 · cada grupo de src/data/habilidades.js tem título e exatamente os seus itens no HTML", () => {
    const titulosEsperados = ["Front-end", "Back-end", "Dados", "Cloud e infra", "IA", "Ferramentas"];
    expect(habilidades.map((grupo) => grupo.titulo)).toEqual(titulosEsperados);

    const grupos = [...documento.querySelectorAll("#habilidades .skill-group")];
    expect(grupos).toHaveLength(habilidades.length);

    habilidades.forEach((grupo, i) => {
      expect(normalizar(grupos[i].querySelector("h3").textContent)).toBe(grupo.titulo);
      const itens = [...grupos[i].querySelectorAll(".skill")].map((item) => normalizar(item.textContent));
      expect(itens).toEqual(grupo.itens.map((item) => item.nome));
    });
  });

  it("CA-3.3 · os contatos de src/data/contatos.js aparecem em #contato e no rodapé", () => {
    const hrefsEsperados = contatos.map((contato) => contato.href);
    const emContato = [...documento.querySelectorAll("#contato a[href]")].map((link) => link.getAttribute("href"));
    const noRodape = [...documento.querySelectorAll("footer a[href]")].map((link) => link.getAttribute("href"));
    expect(emContato).toEqual(hrefsEsperados);
    expect(noRodape).toEqual(hrefsEsperados);
  });
});

describe("fatos e tamanho do texto", () => {
  // Lista literal, independente dos arquivos de dados: se um dado sumir do arquivo, o teste acusa.
  const fatos = [
    "Bruning Sistemas",
    "Desenvolvedor Web e Migração de Dados",
    "Laravel",
    "Nuxt.js",
    "migração, integração e importação de dados",
    "Engenharia de Software",
    "UNISATC",
    "Análise e Desenvolvimento de Sistemas",
    "SENAI Tubarão",
    "Cloud Engineering",
    "DevOps",
  ];
  const tituloDosProjetos = ["Task Manager", "Sistema de RH", "Cookin-Up", "Xadrez", "ForjaSys"];
  const vinteECincoHabilidades = [
    "HTML", "CSS", "JavaScript", "TypeScript", "Vue.js", "Nuxt", "React", "Next.js", "Tailwind CSS",
    "PHP", "Laravel", "C#", ".NET", "Java", "Python", "APIs REST", "SQL", "MySQL", "PostgreSQL",
    "Linux", "AWS", "Git", "GitHub", "Claude Code", "Responsive Design",
  ];
  const quatroContatos = [
    "mailto:w.kauanmachado@gmail.com",
    "https://www.linkedin.com/in/wagner-kauan/",
    "https://github.com/WagnerK4uan",
    "https://www.instagram.com/_wagnerkauan/",
  ];

  it("CA-3.4 · empresa, duas frentes, formações, 5 projetos, 25 habilidades e 4 contatos aparecem no dist", () => {
    const texto = normalizar(documento.body.textContent).toLowerCase();
    const ausentes = fatos.filter((fato) => !texto.includes(fato.toLowerCase()));
    expect(ausentes).toEqual([]);

    const titulos = [...documento.querySelectorAll("#projetos article h3")].map((h3) => normalizar(h3.textContent));
    expect(titulos).toEqual(tituloDosProjetos);

    const nomes = [...documento.querySelectorAll("#habilidades .skill")].map((item) => normalizar(item.textContent));
    expect(nomes).toHaveLength(25);
    expect([...nomes].sort()).toEqual([...vinteECincoHabilidades].sort());

    const hrefs = new Set([...documento.querySelectorAll("#contato a[href]")].map((link) => link.getAttribute("href")));
    expect([...hrefs].sort()).toEqual([...quatroContatos].sort());
  });

  it("CA-3.4 · o ForjaSys aparece como em desenvolvimento e nada diz que está em produção", () => {
    const forjaSys = [...documento.querySelectorAll("#projetos article")].find(
      (artigo) => normalizar(artigo.querySelector("h3").textContent) === "ForjaSys",
    );
    expect(forjaSys).toBeDefined();
    expect(normalizar(forjaSys.textContent).toLowerCase()).toContain("em desenvolvimento");
    expect(normalizar(documento.body.textContent).toLowerCase()).not.toContain("em produção");
  });

  it("CA-3.5 · o texto da seção #sobre tem no máximo 120 palavras", () => {
    const palavras = normalizar(documento.getElementById("sobre").textContent).split(" ").filter(Boolean);
    expect(palavras.length).toBeGreaterThan(0);
    expect(palavras.length).toBeLessThanOrEqual(120);
  });
});
