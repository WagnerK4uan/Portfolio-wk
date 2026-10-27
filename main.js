/* ============================================
   MOVIMENTO: revelar ao rolar, link ativo, header, brilho do ponteiro e preview dos projetos
   Script clássico (defer), sem dependências. Sem IntersectionObserver ou sem element.animate a
   classe js sai e todo o conteúdo fica visível, como sem JavaScript.
   ============================================ */
var MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";
var COM_HOVER = "(hover: hover)";
var PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";

/* Teto do atraso de qualquer item de lista, em ms */
var ATRASO_MAXIMO = 400;

/* Listas que entram em sequência: cada filho do contêiner atrasa `passo` ms, até `teto` */
var LISTAS_EM_SEQUENCIA = [
  { seletor: ".about-highlights", passo: 60, teto: 360 },
  { seletor: ".skills-grid", passo: 25, teto: 400 },
  { seletor: ".projects-grid", passo: 90, teto: 360 },
  { seletor: ".contact-list", passo: 60, teto: 360 },
];

/* Blocos que entram sozinhos, sem atraso */
var BLOCOS_AVULSOS = ".section-title, .section-subtitle, .about-text";

/* Entrada dos blocos e itens: sobe 18 px e sai do desfoque, terminando no estado natural */
var QUADROS_ENTRADA = {
  opacity: [0, 1],
  transform: ["translateY(18px)", "none"],
  filter: ["blur(4px)", "blur(0px)"],
};

/* O título não se desloca: só aparece e desfoca; o traço de baixo se estende pelo CSS */
var QUADROS_TITULO = {
  opacity: [0, 1],
  filter: ["blur(4px)", "blur(0px)"],
};

var DURACAO_ENTRADA = 600;
var CURVA_ENTRADA = "cubic-bezier(0.16, 1, 0.3, 1)";
var PROPRIEDADES_ANIMADAS = ["opacity", "transform", "filter"];

/* Elementos que recebem o brilho do ponteiro */
var ALVOS_DO_BRILHO = ".hero, .project-card";

function consultar(midia) {
  return typeof window.matchMedia === "function" ? window.matchMedia(midia) : null;
}

function midiaAtende(midia) {
  var consulta = consultar(midia);
  return Boolean(consulta && consulta.matches);
}

function suportaMovimento() {
  return "IntersectionObserver" in window && typeof Element.prototype.animate === "function";
}

/* ---------- Revelar ao rolar ---------- */

/* Marca os elementos que entram ao rolar e devolve o atraso (ms) de cada um */
function marcarRevelacao() {
  var atrasos = new Map();

  LISTAS_EM_SEQUENCIA.forEach(function (lista) {
    document.querySelectorAll(lista.seletor).forEach(function (conteiner) {
      Array.prototype.forEach.call(conteiner.children, function (item, indice) {
        atrasos.set(item, Math.min(indice * lista.passo, lista.teto, ATRASO_MAXIMO));
      });
    });
  });

  document.querySelectorAll(BLOCOS_AVULSOS).forEach(function (el) {
    atrasos.set(el, 0);
  });

  atrasos.forEach(function (_, el) {
    el.classList.add("reveal");
  });
  return atrasos;
}

/* Ao fim da entrada, is-in assume o estado e o estilo inline sai, na mesma tarefa, para o hover
   dos cards voltar a valer sem disparar transição do CSS */
function concluirRevelacao(el) {
  el.classList.add("is-in");
  PROPRIEDADES_ANIMADAS.forEach(function (propriedade) {
    el.style.removeProperty(propriedade);
  });
}

function iniciarRevelacao() {
  var atrasos = marcarRevelacao();
  var revelados = new WeakSet();
  var consultaReduzido = consultar(MOVIMENTO_REDUZIDO);
  var reduzido = Boolean(consultaReduzido && consultaReduzido.matches);

  /* Mudar a preferência com a página aberta vale para quem ainda não entrou */
  if (consultaReduzido && consultaReduzido.addEventListener) {
    consultaReduzido.addEventListener("change", function (evento) {
      reduzido = evento.matches;
    });
  }

  function revelar(el) {
    if (revelados.has(el)) return;
    revelados.add(el);

    /* Sob movimento reduzido não há animate: só is-in, e o CSS faz um fade curto */
    if (reduzido) {
      concluirRevelacao(el);
      return;
    }

    var quadros = el.classList.contains("section-title") ? QUADROS_TITULO : QUADROS_ENTRADA;
    var concluir = function () {
      concluirRevelacao(el);
    };

    try {
      el.animate(quadros, {
        duration: DURACAO_ENTRADA,
        delay: atrasos.get(el),
        easing: CURVA_ENTRADA,
        fill: "backwards",
      }).finished.then(concluir, concluir);
    } catch (erro) {
      concluir();
    }
  }

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        observador.unobserve(entrada.target);
        revelar(entrada.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  atrasos.forEach(function (_, el) {
    observador.observe(el);
  });
}

/* ---------- Link da seção visível fica marcado na navegação ---------- */
function iniciarLinkAtivo() {
  var links = document.querySelectorAll('nav a[href^="#"]');
  var secoes = Array.prototype.map.call(links, function (link) {
    return document.querySelector(link.getAttribute("href"));
  });

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        links.forEach(function (link) {
          var ativo = link.getAttribute("href") === "#" + entrada.target.id;
          link.classList.toggle("is-active", ativo);
          if (ativo) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  secoes.forEach(function (secao) {
    if (secao) observador.observe(secao);
  });
}

/* ---------- Header ganha sombra quando o hero sai de vista ---------- */
function iniciarSombraDoHeader() {
  var header = document.querySelector("header");
  var hero = document.querySelector(".hero");
  if (!header || !hero) return;

  new IntersectionObserver(
    function (entradas) {
      header.classList.toggle("is-scrolled", !entradas[0].isIntersecting);
    },
    { rootMargin: "-80px 0px 0px 0px" }
  ).observe(hero.querySelector(".hero-content") || hero);
}

/* ---------- Brilho que segue o ponteiro ----------
   Grava --mx e --my no máximo uma vez por quadro; o desenho e o fade são do CSS, que só mostra o
   brilho em quem tem tem-brilho. Só existe com mouse ou trackpad e sem movimento reduzido. */
function podeBrilhar() {
  return midiaAtende(PONTEIRO_FINO) && !midiaAtende(MOVIMENTO_REDUZIDO);
}

function seguirPonteiro(alvo, signal) {
  var quadroPendente = false;
  var x = 0;
  var y = 0;

  function escreverPosicao() {
    quadroPendente = false;
    var caixa = alvo.getBoundingClientRect();
    alvo.style.setProperty("--mx", Math.round(x - caixa.left) + "px");
    alvo.style.setProperty("--my", Math.round(y - caixa.top) + "px");
  }

  alvo.classList.add("tem-brilho");
  alvo.addEventListener(
    "pointermove",
    function (evento) {
      x = evento.clientX;
      y = evento.clientY;
      if (quadroPendente) return;
      quadroPendente = true;
      requestAnimationFrame(escreverPosicao);
    },
    { passive: true, signal: signal }
  );
}

function iniciarBrilho() {
  var ouvintes = null;

  function desligar() {
    if (!ouvintes) return;
    ouvintes.abort();
    ouvintes = null;
    document.querySelectorAll(ALVOS_DO_BRILHO).forEach(function (alvo) {
      alvo.classList.remove("tem-brilho");
    });
  }

  function sincronizar() {
    var pode = podeBrilhar();
    if (pode === Boolean(ouvintes)) return;
    if (!pode) {
      desligar();
      return;
    }
    ouvintes = new AbortController();
    document.querySelectorAll(ALVOS_DO_BRILHO).forEach(function (alvo) {
      seguirPonteiro(alvo, ouvintes.signal);
    });
  }

  sincronizar();

  /* Ligar ou desligar "reduzir movimento", ou trocar de ponteiro, vale com a página aberta */
  [PONTEIRO_FINO, MOVIMENTO_REDUZIDO].forEach(function (midia) {
    var consulta = consultar(midia);
    if (consulta && consulta.addEventListener) consulta.addEventListener("change", sincronizar);
  });
}

/* ---------- Preview dos projetos ----------
   O HTML nasce com o poster no src e o preview animado em data-animado. A troca para o animado
   acontece no pointerenter ou focusin do card e volta ao poster na saída. Só age com hover e sem
   movimento reduzido; as consultas são lidas a cada evento. */
function podeAnimarPreview() {
  return midiaAtende(COM_HOVER) && !midiaAtende(MOVIMENTO_REDUZIDO);
}

function ligarPreview(card) {
  var imagem = card.querySelector("img[data-animado]");
  if (!imagem) return;
  var poster = imagem.getAttribute("src");
  var animado = imagem.getAttribute("data-animado");

  function mostrarAnimado() {
    if (podeAnimarPreview() && imagem.getAttribute("src") !== animado) {
      imagem.setAttribute("src", animado);
    }
  }

  function mostrarPoster() {
    if (imagem.getAttribute("src") !== poster) imagem.setAttribute("src", poster);
  }

  card.addEventListener("pointerenter", mostrarAnimado);
  card.addEventListener("pointerleave", mostrarPoster);
  card.addEventListener("focusin", mostrarAnimado);
  card.addEventListener("focusout", function (evento) {
    /* Foco que passa para outro elemento do mesmo card não é saída */
    if (!card.contains(evento.relatedTarget)) mostrarPoster();
  });
}

function iniciarPreviewDosProjetos() {
  document.querySelectorAll(".project-card").forEach(ligarPreview);
}

/* ---------- Início ---------- */
function iniciarPagina() {
  iniciarPreviewDosProjetos();

  /* Link ativo e sombra do header dependem só do IntersectionObserver */
  if ("IntersectionObserver" in window) {
    iniciarLinkAtivo();
    iniciarSombraDoHeader();
  }

  if (!suportaMovimento()) {
    document.documentElement.classList.remove("js");
    return;
  }

  iniciarRevelacao();
  iniciarBrilho();
}

iniciarPagina();
