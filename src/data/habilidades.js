/**
 * Habilidades exibidas em #habilidades, agrupadas por área e na ordem da página.
 *
 * Formato de cada grupo:
 *   titulo  texto do <h3> do grupo
 *   itens   lista de { nome, icone } ou { nome, iconeFa }
 *             icone    caminho do SVG em public/img/skills/
 *             iconeFa  classes de ícone locais (src/styles/icones.css), quando não há SVG
 *             atual    true na stack do trabalho atual na Bruning Sistemas (destaque discreto)
 */
export const habilidades = [
  {
    titulo: "Front-end",
    itens: [
      { nome: "HTML", icone: "img/skills/html5-original.svg" },
      { nome: "CSS", icone: "img/skills/css3-original.svg" },
      { nome: "JavaScript", icone: "img/skills/javascript-original.svg" },
      { nome: "TypeScript", icone: "img/skills/typescript-original.svg" },
      { nome: "Vue.js", icone: "img/skills/vuejs-original.svg" },
      { nome: "Nuxt.js", icone: "img/skills/nuxt-original.svg", atual: true },
      { nome: "React", icone: "img/skills/react-original.svg" },
      { nome: "Next.js", icone: "img/skills/nextjs-original.svg" },
      { nome: "Tailwind CSS", icone: "img/skills/tailwindcss-original.svg" },
      { nome: "Responsive Design", iconeFa: "fas fa-mobile-screen" },
    ],
  },
  {
    titulo: "Back-end",
    itens: [
      { nome: "PHP", icone: "img/skills/php-original.svg" },
      { nome: "Laravel", icone: "img/skills/laravel-original.svg", atual: true },
      { nome: "C#", icone: "img/skills/csharp-original.svg" },
      { nome: ".NET", icone: "img/skills/dotnetcore-original.svg" },
      { nome: "Java", icone: "img/skills/java-original.svg" },
      { nome: "Python", icone: "img/skills/python-original.svg" },
      { nome: "APIs REST", iconeFa: "fas fa-plug" },
    ],
  },
  {
    titulo: "Dados",
    itens: [
      { nome: "SQL", iconeFa: "fas fa-database", atual: true },
      { nome: "MySQL", icone: "img/skills/mysql-original.svg" },
      { nome: "PostgreSQL", icone: "img/skills/postgresql-original.svg" },
    ],
  },
  {
    titulo: "Cloud e infra",
    itens: [
      { nome: "Linux", icone: "img/skills/linux-original.svg" },
      { nome: "AWS", icone: "img/skills/amazonwebservices-original-wordmark.svg" },
    ],
  },
  {
    titulo: "IA",
    itens: [{ nome: "Claude Code", icone: "img/skills/claude.svg" }],
  },
  {
    titulo: "Ferramentas",
    itens: [
      { nome: "Git", icone: "img/skills/git-original.svg" },
      { nome: "GitHub", icone: "img/skills/github-original.svg" },
    ],
  },
];
