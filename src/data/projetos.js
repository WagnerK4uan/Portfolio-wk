/**
 * Projetos exibidos em #projetos. A página mostra primeiro os de `destaque: true`, depois os
 * demais, cada grupo na ordem deste arquivo (ver ordenarProjetos em src/render/projetos.js).
 *
 * Formato de cada item:
 *   titulo       texto do <h3>
 *   descricao    texto do parágrafo; trecho entre crases (`.vue`) vira <code>
 *   tags         tecnologias, na ordem de exibição
 *   destaque     true nos projetos de mais rigor de engenharia: vêm primeiro, em card maior
 *   poster       { src, largura, altura, alt } do quadro estático (webp, até 150 KB) que o HTML
 *                mostra; gerado por scripts/posters.mjs em public/img/posters/<projeto>.webp
 *   animado      caminho (em public/) do preview animado; só vai para o src no hover ou foco do
 *                card, por src/scripts/projetos.js
 *   repositorio  URL pública no GitHub, ou
 *   privado      true quando o repositório não é público (sem link)
 */
export const projetos = [
  {
    titulo: "Task Manager",
    destaque: true,
    descricao:
      "Gerenciador de tarefas em formato de quadro kanban, com API REST em Java 21 e Spring Boot e interface em Angular. Arquitetura em camadas validada com ArchUnit, PostgreSQL com migrations Flyway, testes com JUnit, Testcontainers e Playwright, e toda a aplicação sobe com Docker Compose. Desenvolvido com Spec-Driven Development.",
    tags: ["Java 21", "Spring Boot", "Angular", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
    poster: { src: "img/posters/task-manager.webp", largura: 400, altura: 225, alt: "Preview Task Manager" },
    animado: "img/task-manager.webp",
    repositorio: "https://github.com/WagnerK4uan/task-manager",
  },
  {
    titulo: "ForjaSys",
    destaque: true,
    descricao:
      "Sistema desktop de gestão para metalúrgicas de pequeno e médio porte. Várias máquinas Windows na rede local se conectam a um servidor PostgreSQL central; desenvolvido em Linux com deploy para Windows. Inclui ordens de serviço, cadastros com dados fiscais (NCM, CFOP, CST) e autenticação de usuários. É o meu primeiro projeto feito para uma empresa real, ainda em desenvolvimento.",
    tags: ["C#", ".NET 9", "Avalonia", "PostgreSQL", "EF Core", "Clean Architecture", "xUnit"],
    poster: { src: "img/posters/forjasys.webp", largura: 692, altura: 388, alt: "Preview ForjaSys" },
    animado: "img/forjasys.webp",
    privado: true,
  },
  {
    titulo: "Sistema de RH",
    descricao:
      "Sistema completo de Recursos Humanos desenvolvido com Laravel (PHP) no backend e Vue.js no frontend, com CRUD de colaboradores, rotas protegidas e APIs REST.",
    tags: ["Laravel", "PHP", "Vue.js", "MySQL", "REST API"],
    poster: { src: "img/posters/projeto-rh.webp", largura: 720, altura: 387, alt: "Preview Sistema de RH" },
    animado: "img/projeto-rh.webp",
    repositorio: "https://github.com/WagnerK4uan/projeto-rh",
  },
  {
    titulo: "Cookin-Up",
    descricao:
      "Template inicial para desenvolvimento com Vue 3 e Vite, configurado para TypeScript e suporte a `.vue`, visando agilizar novos projetos front-end.",
    tags: ["Vue 3", "TypeScript", "Vite"],
    poster: { src: "img/posters/cookin-up.webp", largura: 720, altura: 387, alt: "Preview Cookin-Up" },
    animado: "img/cookin-up.webp",
    repositorio: "https://github.com/WagnerK4uan/Cookin-Up",
  },
  {
    titulo: "Xadrez",
    descricao:
      "Projeto de jogo de xadrez desenvolvido em React e Next.js com TypeScript, com tabuleiro interativo, movimentação de peças e regras básicas do jogo implementadas.",
    tags: ["React", "Next.js", "TypeScript"],
    poster: { src: "img/posters/xadrez.webp", largura: 400, altura: 215, alt: "Preview Xadrez" },
    animado: "img/xadrez.gif",
    repositorio: "https://github.com/WagnerK4uan/xadrez-react-next",
  },
];
