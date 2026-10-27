import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/main.css";
import "./styles/navegacao.css";
import "./styles/hero.css";
import "./styles/experiencia.css";
import "./styles/habilidades.css";
import "./styles/projetos.css";
import { iniciarMenu } from "./scripts/menu.js";
import { iniciarNavegacao } from "./scripts/navegacao.js";
import { iniciarProjetos } from "./scripts/projetos.js";

iniciarMenu();
iniciarNavegacao();
iniciarProjetos();

/* ============================================
   MOVIMENTO: revelar ao rolar (link ativo e header em scripts/navegacao.js)
   ============================================ */
(function () {
  var root = document.documentElement;

  if (!("IntersectionObserver" in window)) {
    root.classList.remove("js");
    return;
  }

  /* Listas entram em sequência; o atraso total fica limitado */
  var lists = [
    { selector: ".experience-list > *", step: 60, max: 360 },
    { selector: ".skills-grid > *", step: 25, max: 400 },
    { selector: ".projects-grid > *", step: 90, max: 360 },
    { selector: ".contact-list > *", step: 60, max: 360 },
  ];

  lists.forEach(function (list) {
    document.querySelectorAll(list.selector).forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--delay", Math.min(i * list.step, list.max) + "ms");
    });
  });

  document
    .querySelectorAll(".section-title, .section-subtitle, .about-text, .skill-group-title")
    .forEach(function (el) {
      el.classList.add("reveal");
    });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });
})();
