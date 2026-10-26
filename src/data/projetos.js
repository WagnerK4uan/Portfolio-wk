/**
 * Projetos exibidos em #projetos, na ordem da página.
 *
 * Formato de cada item:
 *   titulo       texto do <h3>
 *   descricao    texto do parágrafo; trecho entre crases (`.vue`) vira <code>
 *   tags         tecnologias, na ordem de exibição
 *   preview      { src, largura, altura, alt } da imagem de prévia (arquivo em public/)
 *   repositorio  URL pública no GitHub, ou
 *   privado      true quando o repositório não é público (sem link)
 */
export const projetos = [
  {
    titulo: "Task Manager",
    descricao:
      "Gerenciador de tarefas em formato de quadro kanban, com API REST em Java 21 e Spring Boot e interface em Angular. Arquitetura em camadas validada com ArchUnit, PostgreSQL com migrations Flyway, testes com JUnit, Testcontainers e Playwright, e toda a aplicação sobe com Docker Compose. Desenvolvido com Spec-Driven Development.",
    tags: ["Java 21", "Spring Boot", "Angular", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
    preview: { src: "img/task-manager.webp", largura: 400, altura: 225, alt: "Preview Task Manager" },
    repositorio: "https://github.com/WagnerK4uan/task-manager",
  },
  {
    titulo: "Sistema de RH",
    descricao:
      "Sistema completo de Recursos Humanos desenvolvido com Laravel (PHP) no backend e Vue.js no frontend, com CRUD de colaboradores, rotas protegidas e APIs REST.",
    tags: ["Laravel", "PHP", "Vue.js", "MySQL", "REST API"],
    preview: { src: "img/projeto-rh.webp", largura: 720, altura: 387, alt: "Preview Sistema de RH" },
    repositorio: "https://github.com/WagnerK4uan/projeto-rh",
  },
  {
    titulo: "Cookin-Up",
    descricao:
      "Template inicial para desenvolvimento com Vue 3 e Vite, configurado para TypeScript e suporte a `.vue`, visando agilizar novos projetos front-end.",
    tags: ["Vue 3", "TypeScript", "Vite"],
    preview: { src: "img/cookin-up.webp", largura: 720, altura: 387, alt: "Preview Cookin-Up" },
    repositorio: "https://github.com/WagnerK4uan/Cookin-Up",
  },
  {
    titulo: "Xadrez",
    descricao:
      "Projeto de jogo de xadrez desenvolvido em React e Next.js com TypeScript, com tabuleiro interativo, movimentação de peças e regras básicas do jogo implementadas.",
    tags: ["React", "Next.js", "TypeScript"],
    preview: { src: "img/xadrez.gif", largura: 400, altura: 215, alt: "Preview Xadrez" },
    repositorio: "https://github.com/WagnerK4uan/xadrez-react-next",
  },
  {
    titulo: "ForjaSys",
    descricao:
      "Sistema desktop de gestão para metalúrgicas de pequeno e médio porte. Várias máquinas Windows na rede local se conectam a um servidor PostgreSQL central; desenvolvido em Linux com deploy para Windows. Inclui ordens de serviço, cadastros com dados fiscais (NCM, CFOP, CST) e autenticação de usuários. É o meu primeiro projeto feito para uma empresa real, ainda em desenvolvimento.",
    tags: ["C#", ".NET 9", "Avalonia", "PostgreSQL", "EF Core", "Clean Architecture", "xUnit"],
    preview: { src: "img/forjasys.webp", largura: 692, altura: 388, alt: "Preview ForjaSys" },
    privado: true,
  },
];
