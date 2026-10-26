import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/main.css";

/* ============================================
   MOVIMENTO: revelar ao rolar, link ativo, header
   ============================================ */
(function () {
  var root = document.documentElement;

  if (!("IntersectionObserver" in window)) {
    root.classList.remove("js");
    return;
  }

  /* Listas entram em sequência; o atraso total fica limitado */
  var lists = [
    { selector: ".about-highlights > *", step: 60, max: 360 },
    { selector: ".skills-grid > *", step: 25, max: 400 },
    { selector: ".projects-grid > *", step: 90, max: 360 },
  ];

  lists.forEach(function (list) {
    document.querySelectorAll(list.selector).forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--delay", Math.min(i * list.step, list.max) + "ms");
    });
  });

  document
    .querySelectorAll(".section-title, .section-subtitle, .about-text")
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

  /* Link da seção visível fica marcado na navegação */
  var links = document.querySelectorAll('nav a[href^="#"]');
  var sections = Array.prototype.map.call(links, function (link) {
    return document.querySelector(link.getAttribute("href"));
  });

  var navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach(function (section) {
    if (section) navObserver.observe(section);
  });

  /* Header ganha sombra quando o hero sai de vista */
  var header = document.querySelector("header");
  var hero = document.querySelector(".hero");

  if (header && hero) {
    new IntersectionObserver(
      function (entries) {
        header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      },
      { rootMargin: "-80px 0px 0px 0px" }
    ).observe(hero.querySelector(".hero-content") || hero);
  }
})();
