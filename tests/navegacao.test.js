import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lerCssDoIndexDist } from "./dist.js";
import { montarPaginaDoDist, simularIntersectionObserver } from "./pagina.js";
import { CLASSE_ROLAGEM_TRAVADA, iniciarMenu } from "../src/scripts/menu.js";
import { iniciarNavegacao } from "../src/scripts/navegacao.js";

function pressionar(elemento, key) {
  elemento.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

describe("menu mobile", () => {
  let botao;
  let menu;
  let encerrar;

  beforeEach(() => {
    window.innerWidth = 375;
    montarPaginaDoDist();
    encerrar = iniciarMenu(document);
    botao = document.querySelector("header button[aria-controls]");
    menu = botao && document.getElementById(botao.getAttribute("aria-controls"));
  });

  afterEach(() => {
    encerrar?.();
    vi.unstubAllGlobals();
  });

  it("CA-4.2 · o botão de menu controla a lista de links e nasce fechado", () => {
    expect(botao, "botão de menu no header").not.toBeNull();
    expect(botao.getAttribute("type")).toBe("button");
    expect(menu, "elemento de aria-controls existe").not.toBeNull();
    expect(menu.querySelectorAll('a[href^="#"]').length).toBe(5);
    expect(botao.textContent.trim().length, "nome acessível visível").toBeGreaterThan(0);
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("is-open")).toBe(false);
  });

  it("CA-4.2 · clicar alterna aria-expanded, mostra a lista e põe o foco no primeiro link", () => {
    botao.click();
    expect(botao.getAttribute("aria-expanded")).toBe("true");
    expect(menu.classList.contains("is-open")).toBe(true);
    expect(document.activeElement).toBe(menu.querySelector("a"));

    botao.click();
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("is-open")).toBe(false);
  });

  it("CA-4.2 · pelo teclado: Enter no botão abre (botão nativo) e Esc fecha devolvendo o foco ao botão", () => {
    // Enter e Espaço num <button> nativo disparam click; o jsdom não sintetiza isso, então o
    // teste prova que é um <button> e aciona o click que o navegador geraria.
    expect(botao.tagName).toBe("BUTTON");
    botao.focus();
    botao.click();
    expect(botao.getAttribute("aria-expanded")).toBe("true");

    const primeiroLink = menu.querySelector("a");
    expect(document.activeElement).toBe(primeiroLink);
    pressionar(primeiroLink, "Escape");

    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("is-open")).toBe(false);
    expect(document.activeElement).toBe(botao);
  });

  it("CA-4.2 · clicar num link fecha o menu", () => {
    botao.click();
    const linkProjetos = menu.querySelector('a[href="#projetos"]');
    linkProjetos.click();
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(menu.classList.contains("is-open")).toBe(false);
  });

  it("CA-4.2 · Esc com o menu fechado não rouba o foco", () => {
    const logo = document.querySelector("header .logo");
    logo.focus();
    pressionar(logo, "Escape");
    expect(document.activeElement).toBe(logo);
    expect(botao.getAttribute("aria-expanded")).toBe("false");
  });

  const rolagemTravada = () => document.documentElement.classList.contains(CLASSE_ROLAGEM_TRAVADA);

  it("CA-8.3 · abrir o menu trava a rolagem da página (is-menu-aberto em <html>) e fechar pelo botão destrava", () => {
    expect(CLASSE_ROLAGEM_TRAVADA).toBe("is-menu-aberto");
    expect(rolagemTravada(), "nasce destravada").toBe(false);
    botao.click();
    expect(rolagemTravada(), "aberto: rolagem travada").toBe(true);
    botao.click();
    expect(rolagemTravada(), "fechado pelo botão: destravada").toBe(false);
  });

  it("CA-8.3 · Esc destrava a rolagem e o foco volta ao botão", () => {
    botao.click();
    expect(rolagemTravada(), "aberto: rolagem travada").toBe(true);
    pressionar(menu.querySelector("a"), "Escape");
    expect(rolagemTravada()).toBe(false);
    expect(document.activeElement).toBe(botao);
  });

  it("CA-8.3 · clicar num link âncora destrava a rolagem antes da navegação do navegador", () => {
    botao.click();
    expect(rolagemTravada(), "aberto: rolagem travada").toBe(true);
    const linkProjetos = menu.querySelector('a[href="#projetos"]');
    let travadaNaNavegacao = null;
    // O ouvinte no document roda depois do ouvinte do menu e antes da ação padrão do link (navegar).
    const registrar = () => (travadaNaNavegacao = rolagemTravada());
    document.addEventListener("click", registrar);
    linkProjetos.click();
    document.removeEventListener("click", registrar);
    expect(travadaNaNavegacao, "estado da trava quando o navegador segue o link").toBe(false);
    expect(rolagemTravada()).toBe(false);
  });

  it("CA-8.3 · Tab para fora do header (focusout) destrava a rolagem", () => {
    botao.click();
    expect(rolagemTravada(), "aberto: rolagem travada").toBe(true);
    const destino = document.querySelector("main a[href], main button") || document.body;
    menu.querySelector("a").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: destino }));
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(rolagemTravada()).toBe(false);
  });

  it("CA-8.3 · passar para a largura de desktop com o menu aberto destrava a rolagem", () => {
    encerrar();
    const ouvintes = [];
    vi.stubGlobal("matchMedia", (consulta) => ({
      media: consulta,
      matches: false,
      addEventListener: (tipo, ouvinte) => ouvintes.push(ouvinte),
      removeEventListener() {},
    }));
    encerrar = iniciarMenu(document);
    botao.click();
    expect(rolagemTravada()).toBe(true);
    expect(ouvintes.length, "o menu escuta a troca de largura").toBe(1);
    ouvintes[0]({ matches: true });
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(rolagemTravada()).toBe(false);
  });

  it("CA-8.3 · o CSS do build esconde o overflow de html.is-menu-aberto só na largura do menu mobile", () => {
    const css = lerCssDoIndexDist();
    const blocos = [...css.matchAll(/@media\s*\(([^)]*47\.99rem[^)]*)\)\s*\{/g)].map((m) => {
      let profundidade = 1;
      let fim = m.index + m[0].length;
      for (; fim < css.length && profundidade > 0; fim++) {
        if (css[fim] === "{") profundidade++;
        if (css[fim] === "}") profundidade--;
      }
      return css.slice(m.index + m[0].length, fim - 1).replace(/\s+/g, "");
    });
    expect(blocos.length, "@media do menu mobile no build").toBeGreaterThan(0);
    expect(blocos.join("")).toMatch(/html\.is-menu-aberto\{overflow:hidden;?\}/);
    const foraDoMobile = css.replace(/\s+/g, "").split("html.is-menu-aberto{").length - 1;
    expect(foraDoMobile, "a regra existe uma vez, dentro do @media").toBe(1);
  });
});

/** Regras de estilo de nível superior do CSS do build cujo seletor é exatamente `seletor`. */
function regrasDoBuild(seletor) {
  const estilo = document.createElement("style");
  estilo.textContent = lerCssDoIndexDist();
  document.head.appendChild(estilo);
  const regras = [...estilo.sheet.cssRules].filter((regra) =>
    (regra.selectorText || "").split(",").map((parte) => parte.trim()).includes(seletor),
  );
  estilo.remove();
  return regras.map((regra) => regra.style);
}

describe("header e link ativo", () => {
  let io;

  beforeEach(() => {
    montarPaginaDoDist();
    io = simularIntersectionObserver();
    iniciarNavegacao(document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("CA-4.1 · o header recebe is-scrolled quando #home sai da vista e perde ao voltar", () => {
    const header = document.querySelector("header");
    const home = document.getElementById("home");
    const observador = io.queObserva(home);
    expect(observador, "um IntersectionObserver observa o conteúdo do hero").toBeDefined();
    const alvo = observador.alvos.find((el) => home.contains(el));

    expect(header.classList.contains("is-scrolled")).toBe(false);
    observador.disparar(alvo, false);
    expect(header.classList.contains("is-scrolled")).toBe(true);
    observador.disparar(alvo, true);
    expect(header.classList.contains("is-scrolled")).toBe(false);
  });

  it("CA-4.1 · com o hero só parcialmente rolado o header já tem fundo (nada passa sob o header transparente)", () => {
    const header = document.querySelector("header");
    const home = document.getElementById("home");
    const sentinela = home.querySelector(".hero-sentinela");
    expect(sentinela, "sentinela no topo de #home").not.toBeNull();
    expect(home.firstElementChild).toBe(sentinela);

    // O alvo do header é a sentinela, sem margem: o primeiro pixel rolado já a tira da vista,
    // enquanto a ficha do hero continua visível.
    const observador = io.queObserva(home);
    expect(observador.alvos).toEqual([sentinela]);
    expect(observador.opcoes.rootMargin).toBe("0px");
    expect(observador.alvos.some((alvo) => alvo.closest(".hero-content"))).toBe(false);

    const [regra] = regrasDoBuild(".hero-sentinela");
    expect(regra.getPropertyValue("position")).toBe("absolute");
    expect(regra.getPropertyValue("top")).toBe("0px");

    observador.disparar(sentinela, false);
    expect(header.classList.contains("is-scrolled")).toBe(true);
  });

  it("CA-4.1 · o header continua visível: fixo no topo, e rolado ganha fundo translúcido com desfoque", () => {
    const header = document.querySelector("header");
    expect(header.hidden).toBe(false);

    const base = regrasDoBuild(".site-header");
    expect(base.some((regra) => regra.getPropertyValue("position") === "fixed")).toBe(true);
    expect(header.classList.contains("site-header")).toBe(true);

    const rolado = regrasDoBuild(".site-header.is-scrolled");
    expect(rolado.length).toBeGreaterThan(0);
    const declaracoes = rolado.map((regra) => regra.cssText).join(";");
    expect(declaracoes).toMatch(/backdrop-filter:\s*blur\(/);
    expect(declaracoes).toMatch(/color-mix\([^;]*transparent\)/);
    // Nada esconde o header ao rolar.
    expect(declaracoes).not.toMatch(/transform|visibility:\s*hidden|display:\s*none|opacity:\s*0/);
  });

  it("CA-4.3 · rolada até #projetos, só o link de projetos fica com aria-current e is-active", () => {
    const sobre = document.getElementById("sobre");
    const projetos = document.getElementById("projetos");
    const observador = io.queObserva(projetos);
    expect(observador, "um IntersectionObserver observa as seções da nav").toBeDefined();

    observador.disparar(sobre, true);
    observador.disparar(projetos, true);

    const links = [...document.querySelectorAll('nav a[href^="#"]')];
    const marcados = links.filter((link) => link.getAttribute("aria-current") === "true");
    const ativos = links.filter((link) => link.classList.contains("is-active"));
    expect(marcados.map((link) => link.getAttribute("href"))).toEqual(["#projetos"]);
    expect(ativos.map((link) => link.getAttribute("href"))).toEqual(["#projetos"]);
  });

  it("Spec 8 correção 1 · rolar até Sobre e voltar ao hero deixa nenhum link com is-active ou aria-current", () => {
    const home = document.getElementById("home");
    const sobre = document.getElementById("sobre");
    const observador = io.queObserva(sobre);
    expect(observador.alvos, "o observador do link ativo também observa #home").toContain(home);

    observador.disparar(sobre, true);
    expect(document.querySelector('nav a[href="#sobre"]').classList.contains("is-active")).toBe(true);

    observador.disparar(sobre, false);
    observador.disparar(home, true);

    const links = [...document.querySelectorAll('nav a[href^="#"]')];
    expect(links.filter((link) => link.classList.contains("is-active"))).toEqual([]);
    expect(links.filter((link) => link.hasAttribute("aria-current"))).toEqual([]);
  });

  it("CA-4.3 · seção saindo da vista não desmarca o link atual", () => {
    const sobre = document.getElementById("sobre");
    const projetos = document.getElementById("projetos");
    const observador = io.queObserva(projetos);

    observador.disparar(projetos, true);
    observador.disparar(sobre, false);

    const ativo = document.querySelector("nav a.is-active");
    expect(ativo.getAttribute("href")).toBe("#projetos");
  });
});
