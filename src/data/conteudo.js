/* Conteúdo do portfólio nos dois idiomas. Português em primeira pessoa, sem travessão e sem afirmação que não
   seja verdadeira hoje (PRODUCT.md); o inglês traduz o português sem acrescentar fatos. A Bruning Sistemas
   aparece só como a empresa onde trabalho (trajetória e Sobre), nunca como protagonista.
   Nos textos ricos, **assim** vira negrito e [LinkedIn] vira o link do perfil (src/components/Rico.jsx). */

export const LINKEDIN = "https://www.linkedin.com/in/wagner-kauan/";
export const GITHUB = "https://github.com/WagnerK4uan";
export const EMAIL = "w.kauanmachado@gmail.com";

/* ids das seções: iguais nos dois idiomas, para o seletor PT / EN manter a âncora */
export const SECOES = ["sobre", "trajetoria", "habilidades", "projetos", "contato"];

const svg = (nome) => `img/skills/${nome}.svg`;

/* Habilidades: itens iguais nos dois idiomas, só títulos e descrições mudam */
const itensDeHabilidades = {
  front: [
    { nome: "HTML", img: svg("html5-original") },
    { nome: "CSS", img: svg("css3-original") },
    { nome: "JavaScript", img: svg("javascript-original") },
    { nome: "TypeScript", img: svg("typescript-original") },
    { nome: "Vue.js", img: svg("vuejs-original") },
    { nome: "Nuxt", img: svg("nuxt-original") },
    { nome: "React", img: svg("react-original") },
    { nome: "Angular", img: svg("angular") },
    { nome: "Next.js", img: svg("nextjs-original") },
    { nome: "Tailwind CSS", img: svg("tailwindcss-original") },
    { nome: { pt: "Responsive Design", en: "Responsive Design" }, icone: "fa-mobile-screen" },
  ],
  back: [
    { nome: "PHP", img: svg("php-original") },
    { nome: "Laravel", img: svg("laravel-original") },
    { nome: "C#", img: svg("csharp-original") },
    { nome: ".NET", img: svg("dotnetcore-original") },
    { nome: "Java", img: svg("java-original") },
    { nome: "Spring Boot", img: svg("spring") },
    { nome: "Python", img: svg("python-original") },
  ],
  dados: [
    { nome: "SQL", icone: "fa-database" },
    { nome: "MySQL", img: svg("mysql-original") },
    { nome: "PostgreSQL", img: svg("postgresql-original") },
    { nome: "SQL Server", img: svg("microsoftsqlserver-original") },
    { nome: { pt: "APIs REST", en: "REST APIs" }, icone: "fa-plug" },
  ],
  cloud: [
    { nome: "Linux", img: svg("linux-original") },
    { nome: "AWS", img: svg("amazonwebservices-original-wordmark") },
  ],
  ia: [
    { nome: "Claude Code", img: svg("claude") },
    { nome: "Git", img: svg("git-original") },
    { nome: "GitHub", img: svg("github-original") },
    { nome: "Docker", img: svg("docker-original") },
  ],
};

const habilidades = (lang, grupos) =>
  grupos.map((g) => ({
    ...g,
    itens: itensDeHabilidades[g.chave].map((i) => ({ ...i, nome: typeof i.nome === "string" ? i.nome : i.nome[lang] })),
  }));

/* Mídia dos projetos: o pôster é a primeira tela parada; o animado (img/anim, cópias leves de 640 px dos
   GIFs originais em img/) só carrega no projeto ativo */
const midia = {
  task: { poster: "img/posters/task-manager.webp", animado: "img/anim/task-manager.webp", largura: 1000, altura: 563 },
  forja: { poster: "img/posters/forjasys.webp", animado: "img/anim/forjasys.webp", largura: 1000, altura: 561 },
  rh: { poster: "img/posters/projeto-rh.webp", animado: "img/anim/projeto-rh.webp", largura: 700, altura: 376 },
  cookin: { poster: "img/posters/cookin-up.webp", animado: "img/anim/cookin-up.webp", largura: 700, altura: 376 },
  xadrez: { poster: "img/posters/xadrez.webp", animado: "img/anim/xadrez.webp", largura: 700, altura: 376 },
};

const repos = {
  task: "https://github.com/WagnerK4uan/task-manager",
  rh: "https://github.com/WagnerK4uan/projeto-rh",
  cookin: "https://github.com/WagnerK4uan/Cookin-Up",
  xadrez: "https://github.com/WagnerK4uan/xadrez-react-next",
};

const tags = {
  task: ["Java 21", "Spring Boot", "Angular", "PostgreSQL", "Flyway", "Docker Compose", "Spec-Driven Development"],
  forja: ["C#", ".NET 9", "Avalonia", "PostgreSQL", "EF Core", "Clean Architecture", "xUnit"],
  rh: ["Laravel", "PHP", "Vue.js", "MySQL"],
  cookin: ["Vue 3", "TypeScript", "Vite"],
  xadrez: ["React", "Next.js", "TypeScript"],
};

const pt = {
  lang: "pt-BR",
  codigo: "pt",
  meta: {
    titulo: "Wagner Kauan: desenvolvedor web Full Stack",
    descricao: "Portfólio de Wagner Kauan, desenvolvedor web Full Stack: Vue, React e Angular no front-end, PHP, Java e C# no back-end.",
  },
  ui: {
    pular: "Pular para o conteúdo",
    navPrincipal: "Principal",
    abrirMenu: "Abrir menu",
    fecharMenu: "Fechar menu",
    falar: "Falar comigo",
    verProjetos: "Ver projetos",
    idioma: "Idioma",
    outroIdioma: { rotulo: "EN", nome: "English", lang: "en", href: "en/" },
    esteIdioma: "PT",
    copiar: "Copiar e-mail",
    copiado: "E-mail copiado",
    copiadoAviso: "E-mail copiado para a área de transferência.",
    verCodigo: "Ver o código no GitHub",
    privado: "Repositório privado",
    cursorCodigo: "ver código",
    cursorPrivado: "repositório privado",
    pausar: "Pausar animações",
    retomar: "Retomar animações",
    destaques: "Destaques",
  },
  navegacao: [
    { id: "sobre", rotulo: "Sobre" },
    { id: "trajetoria", rotulo: "Trajetória" },
    { id: "habilidades", rotulo: "Habilidades" },
    { id: "projetos", rotulo: "Projetos" },
    { id: "contato", rotulo: "Contato" },
  ],
  hero: {
    frentes: ["Front-end com Vue, React e Angular", "Back-end com PHP, Java e C#", "APIs REST e integrações"],
    frentesLeitor: "Desenvolvimento web: front-end com Vue, React e Angular, back-end com PHP, Java e C#, APIs REST e integrações.",
    titulo: "Wagner Kauan, desenvolvedor web Full Stack",
    lead: "Construo aplicações web de ponta a ponta: front-end com Vue, React ou Angular e back-end com Laravel, Spring Boot ou .NET. Em paralelo, estudo Cloud e DevOps.",
    fotoAlt: "Foto de Wagner Kauan",
  },
  sobre: {
    titulo: "Sobre mim",
    paragrafos: [
      "A curiosidade por tecnologia me acompanha desde criança, quando sonhava em criar jogos. Aos 16 anos entrei no curso técnico em Análise e Desenvolvimento de Sistemas no SENAI Tubarão e ali descobri que gosto de verdade de programar e resolver problemas.",
      "Hoje, com cerca de 3 anos na área, sou **desenvolvedor web Full Stack** na **Bruning Sistemas**, com Laravel no back-end e Nuxt.js no front-end. Antes disso, passei pelo estágio e por um período com migração e integração de dados.",
      "Em paralelo, estou em transição para **Cloud Engineering**, com objetivo de carreira em **DevOps**. Comecei pelos fundamentos com o curso de Redes do Google, fiz cursos da AWS e dediquei o último semestre a estudar cloud e a rotina DevOps. Uso **Linux** (Fedora) no dia a dia, inclusive como ambiente de desenvolvimento.",
      "Também estudo **IA aplicada** ao desenvolvimento: Claude Code, Spec-Driven Development e criação de skills e ferramentas para o Claude. Junto disso, venho aprofundando **arquitetura de software**: Clean Architecture, design patterns, testes unitários e system design.",
      "Curso **Engenharia de Software** na UNISATC e complemento a formação com cursos da Alura, Google (Coursera), AWS, entre outras plataformas online. Sou reconhecido por ser **proativo**, **dedicado** e **colaborativo**, e levo essa vontade de aprender para todos os lugares onde atuo.",
      "Busco uma oportunidade que una **desenvolvimento Full Stack** e **Cloud/DevOps**. Compartilho minha evolução no [LinkedIn].",
    ],
    destaques: [
      { icone: "fa-code", titulo: "Desenvolvedor Web Full Stack", apoio: "Laravel · Java · C# · Vue.js · React · Angular" },
      { icone: "fa-plug", titulo: "APIs e integrações", apoio: "REST · MySQL · PostgreSQL · SQL Server" },
      { icone: "fa-cloud", titulo: "Cloud e DevOps em estudo", apoio: "AWS · Linux · Redes" },
      { icone: "fa-robot", titulo: "IA aplicada", apoio: "Claude Code · Spec Drive Development" },
      { icone: "fa-graduation-cap", titulo: "Engenharia de Software", apoio: "UNISATC · 2º período em andamento" },
      { icone: "fa-graduation-cap", titulo: "Análise e Desenvolvimento de Sistemas", apoio: "Curso técnico no SENAI Tubarão" },
    ],
    diagrama: {
      layout: "hub",
      alt: "Como desenvolvedor Full Stack uso Vue, React e Angular no front-end, Laravel, Spring e .NET no back-end, MySQL, PostgreSQL e SQL Server nos dados, e estudo AWS e Linux.",
      center: { label: "Full Stack" },
      spokes: [
        { label: "Front-end", icon: "ui:layout-template", children: [{ label: "Vue", icon: "vue" }, { label: "React", icon: "react" }, { label: "Angular", icon: "angular" }] },
        { label: "Back-end", icon: "ui:server", children: [{ label: "Laravel", icon: "laravel" }, { label: "Spring", icon: "spring" }, { label: ".NET", icon: "dotnet" }] },
        { label: "Dados", icon: "ui:database", children: [{ label: "MySQL", icon: "mysql" }, { label: "PostgreSQL", icon: "postgres" }, { label: "SQL Server", icon: "sqlserver" }] },
        { label: "Em estudo", icon: "ui:cloud", children: [{ label: "AWS", icon: "aws" }, { label: "Linux", icon: "linux-tux" }] },
      ],
    },
  },
  trajetoria: {
    titulo: "Trajetória",
    lead: "Do curso técnico ao desenvolvimento web Full Stack.",
    atual: "No momento",
    etapas: [
      { periodo: "2023 a 2024", cargo: "Técnico em Análise e Desenvolvimento de Sistemas", local: "SENAI Tubarão", detalhe: "Onde comecei a programar." },
      { periodo: "2024 a 2025", cargo: "Estágio em desenvolvimento", local: "Bruning Sistemas" },
      { periodo: "2025 a 2026", cargo: "Migração e integração de dados", local: "Bruning Sistemas", detalhe: "Migração, integração e importação de dados entre sistemas." },
      { periodo: "2026 até hoje", cargo: "Desenvolvedor web Full Stack", local: "Bruning Sistemas", detalhe: "Laravel no back-end e Nuxt.js no front-end.", atual: true },
    ],
    nota: "Em paralelo: Engenharia de Software na UNISATC, em andamento.",
  },
  habilidades: {
    titulo: "Habilidades e ferramentas",
    lead: "Tecnologias que uso no dia a dia e nas quais tenho experiência.",
    grupos: habilidades("pt", [
      { chave: "front", titulo: "Front-end", descricao: "Nuxt.js e Vue no trabalho, Angular no Task Manager, React e Next.js no projeto de Xadrez." },
      { chave: "back", titulo: "Back-end", descricao: "Laravel no trabalho, C# e .NET no ForjaSys, Java e Spring Boot no Task Manager." },
      { chave: "dados", titulo: "Dados e integração", descricao: "SQL, APIs REST e integração de dados entre sistemas no trabalho." },
      { chave: "cloud", titulo: "Cloud e infra", descricao: "Linux (Fedora) no dia a dia e cursos da AWS." },
      { chave: "ia", titulo: "IA e ferramentas", descricao: "Claude Code com Spec-Driven Development e Docker Compose, usados no Task Manager." },
    ]),
  },
  projetos: {
    titulo: "Projetos",
    lead: "Do sistema desktop ao kanban em Java: o código de cada um está no GitHub.",
    lista: [
      { chave: "task", nome: "Task Manager", tipo: "Full Stack", descricao: "Quadro kanban com API REST em Java 21 e Spring Boot e interface em Angular, camadas validadas com ArchUnit e testes com Testcontainers e Playwright.", alt: "Tela do Task Manager" },
      { chave: "forja", nome: "ForjaSys", tipo: "Desktop · Em desenvolvimento", descricao: "Sistema desktop de gestão para metalúrgicas, com ordens de serviço e dados fiscais (NCM, CFOP, CST), ligando máquinas Windows a um PostgreSQL central.", alt: "Tela do ForjaSys", privado: true },
      { chave: "rh", nome: "Sistema de RH", tipo: "Full Stack", descricao: "Sistema de Recursos Humanos com Laravel no back-end e Vue.js no front-end, com CRUD de colaboradores, rotas protegidas e APIs REST.", alt: "Tela do Sistema de RH" },
      { chave: "cookin", nome: "Cookin-Up", tipo: "Front-end", descricao: "Template inicial com Vue 3 e Vite, configurado para TypeScript e arquivos .vue, para começar novos projetos front-end mais rápido.", alt: "Tela do Cookin-Up" },
      { chave: "xadrez", nome: "Xadrez", tipo: "Front-end", descricao: "Jogo de xadrez em React e Next.js com TypeScript: tabuleiro interativo, movimentação das peças e as regras básicas do jogo.", alt: "Tela do jogo de Xadrez" },
    ],
  },
  contato: {
    titulo: "Contato",
    lead: "Curtiu a minha trajetória? Mande um e-mail para trocarmos uma ideia.",
    rodape: "Wagner Kauan · desenvolvedor web Full Stack",
    redes: ["E-mail", "LinkedIn", "GitHub", "Instagram"],
  },
};

const en = {
  lang: "en",
  codigo: "en",
  meta: {
    titulo: "Wagner Kauan: Full Stack web developer",
    descricao: "Portfolio of Wagner Kauan, Full Stack web developer: Vue, React and Angular on the front end, PHP, Java and C# on the back end.",
  },
  ui: {
    pular: "Skip to content",
    navPrincipal: "Main",
    abrirMenu: "Open menu",
    fecharMenu: "Close menu",
    falar: "Get in touch",
    verProjetos: "See projects",
    idioma: "Language",
    outroIdioma: { rotulo: "PT", nome: "Português", lang: "pt-BR", href: "../" },
    esteIdioma: "EN",
    copiar: "Copy email",
    copiado: "Email copied",
    copiadoAviso: "Email copied to the clipboard.",
    verCodigo: "See the code on GitHub",
    privado: "Private repository",
    cursorCodigo: "see code",
    cursorPrivado: "private repository",
    pausar: "Pause animations",
    retomar: "Play animations",
    destaques: "Highlights",
  },
  navegacao: [
    { id: "sobre", rotulo: "About" },
    { id: "trajetoria", rotulo: "Career" },
    { id: "habilidades", rotulo: "Skills" },
    { id: "projetos", rotulo: "Projects" },
    { id: "contato", rotulo: "Contact" },
  ],
  hero: {
    frentes: ["Front end with Vue, React and Angular", "Back end with PHP, Java and C#", "REST APIs and integrations"],
    frentesLeitor: "Web development: front end with Vue, React and Angular, back end with PHP, Java and C#, REST APIs and integrations.",
    titulo: "Wagner Kauan, Full Stack web developer",
    lead: "I build web applications end to end: front end with Vue, React or Angular and back end with Laravel, Spring Boot or .NET. Alongside that, I study Cloud and DevOps.",
    fotoAlt: "Photo of Wagner Kauan",
  },
  sobre: {
    titulo: "About me",
    paragrafos: [
      "Curiosity about technology has been with me since I was a kid, when I dreamed of making games. At 16 I started the technical course in Systems Analysis and Development at SENAI Tubarão, and that is where I found out I truly enjoy programming and solving problems.",
      "Today, with about 3 years in the field, I am a **Full Stack web developer** at **Bruning Sistemas**, with Laravel on the back end and Nuxt.js on the front end. Before that, I went through my internship and a period working with data migration and integration.",
      "Alongside that, I am moving into **Cloud Engineering**, with a career goal in **DevOps**. I started with the fundamentals through Google's Networking course, took AWS courses and spent the last semester studying cloud and the DevOps routine. I use **Linux** (Fedora) every day, including as my development environment.",
      "I also study **applied AI** for software development: prompt engineering, Claude Code, Spec-Driven Development and building skills and tools for Claude. Along with that, I keep going deeper into **software architecture**: Clean Architecture, design patterns, unit testing and system design.",
      "I study **Software Engineering** at UNISATC and add to it with courses from Alura, Google (Coursera), AWS and other online platforms. People know me as **proactive**, **dedicated** and **collaborative**, and I bring this will to learn to every place I work.",
      "I am looking for an opportunity that brings together **Full Stack development** and **Cloud/DevOps**. I share my progress on [LinkedIn].",
    ],
    destaques: [
      { icone: "fa-code", titulo: "Full Stack Web Developer", apoio: "Laravel · Java · C# · Vue.js · React · Angular" },
      { icone: "fa-plug", titulo: "APIs and integrations", apoio: "REST · MySQL · PostgreSQL · SQL Server" },
      { icone: "fa-cloud", titulo: "Studying Cloud and DevOps", apoio: "AWS · Linux · Networking" },
      { icone: "fa-robot", titulo: "Applied AI", apoio: "Claude Code · Prompt engineering · SDD" },
      { icone: "fa-graduation-cap", titulo: "Software Engineering", apoio: "UNISATC · 2nd semester in progress" },
      { icone: "fa-graduation-cap", titulo: "Systems Analysis and Development", apoio: "Technical course at SENAI Tubarão" },
    ],
    diagrama: {
      layout: "hub",
      alt: "As a Full Stack developer I use Vue, React and Angular on the front end, Laravel, Spring and .NET on the back end, MySQL, PostgreSQL and SQL Server for data, and I study AWS and Linux.",
      center: { label: "Full Stack" },
      spokes: [
        { label: "Front end", icon: "ui:layout-template", children: [{ label: "Vue", icon: "vue" }, { label: "React", icon: "react" }, { label: "Angular", icon: "angular" }] },
        { label: "Back end", icon: "ui:server", children: [{ label: "Laravel", icon: "laravel" }, { label: "Spring", icon: "spring" }, { label: ".NET", icon: "dotnet" }] },
        { label: "Data", icon: "ui:database", children: [{ label: "MySQL", icon: "mysql" }, { label: "PostgreSQL", icon: "postgres" }, { label: "SQL Server", icon: "sqlserver" }] },
        { label: "Studying", icon: "ui:cloud", children: [{ label: "AWS", icon: "aws" }, { label: "Linux", icon: "linux-tux" }] },
      ],
    },
  },
  trajetoria: {
    titulo: "Career",
    lead: "From the technical course to Full Stack web development.",
    atual: "Current step",
    etapas: [
      { periodo: "2023 to 2024", cargo: "Systems Analysis and Development technician", local: "SENAI Tubarão", detalhe: "Where I started programming." },
      { periodo: "2024 to 2025", cargo: "Development internship", local: "Bruning Sistemas" },
      { periodo: "2025 to 2026", cargo: "Data migration and integration", local: "Bruning Sistemas", detalhe: "Migrating, integrating and importing data between systems." },
      { periodo: "2026 to present", cargo: "Full Stack web developer", local: "Bruning Sistemas", detalhe: "Laravel on the back end and Nuxt.js on the front end.", atual: true },
    ],
    nota: "Alongside: Software Engineering at UNISATC, in progress.",
  },
  habilidades: {
    titulo: "Skills and tools",
    lead: "Technologies I use day to day and have experience with.",
    grupos: habilidades("en", [
      { chave: "front", titulo: "Front end", descricao: "Nuxt.js and Vue at work, Angular in Task Manager, React and Next.js in the Chess project." },
      { chave: "back", titulo: "Back end", descricao: "Laravel at work, C# and .NET in ForjaSys, Java and Spring Boot in Task Manager." },
      { chave: "dados", titulo: "Data and integration", descricao: "SQL, REST APIs and data integration between systems at work." },
      { chave: "cloud", titulo: "Cloud and infra", descricao: "Linux (Fedora) every day and AWS courses." },
      { chave: "ia", titulo: "AI and tools", descricao: "Claude Code with Spec-Driven Development and Docker Compose, used in Task Manager." },
    ]),
  },
  projetos: {
    titulo: "Projects",
    lead: "From a desktop system to a kanban board in Java: the code for each one is on GitHub.",
    lista: [
      { chave: "task", nome: "Task Manager", tipo: "Full Stack", descricao: "Kanban board with a REST API in Java 21 and Spring Boot and an Angular interface, layers checked with ArchUnit and tests with Testcontainers and Playwright.", alt: "Task Manager screen" },
      { chave: "forja", nome: "ForjaSys", tipo: "Desktop · In development", descricao: "Desktop management system for metalworking shops, with work orders and tax data (NCM, CFOP, CST), connecting Windows machines to a central PostgreSQL.", alt: "ForjaSys screen", privado: true },
      { chave: "rh", nome: "HR System", tipo: "Full Stack", descricao: "Human Resources system with Laravel on the back end and Vue.js on the front end, with employee CRUD, protected routes and REST APIs.", alt: "HR System screen" },
      { chave: "cookin", nome: "Cookin-Up", tipo: "Front end", descricao: "Starter template with Vue 3 and Vite, set up for TypeScript and .vue files, to start new front-end projects faster.", alt: "Cookin-Up screen" },
      { chave: "xadrez", nome: "Chess", tipo: "Front end", descricao: "Chess game in React and Next.js with TypeScript: interactive board, piece movement and the basic rules of the game.", alt: "Chess game screen" },
    ],
  },
  contato: {
    titulo: "Contact",
    lead: "Enjoyed my journey? Send me an email and let's talk.",
    rodape: "Wagner Kauan · Full Stack web development",
    redes: ["Email", "LinkedIn", "GitHub", "Instagram"],
  },
};

/* Liga mídia, tags, repositórios e contatos (iguais nos dois idiomas) ao texto de cada idioma */
const completar = (c) => ({
  ...c,
  projetos: {
    ...c.projetos,
    lista: c.projetos.lista.map((p) => ({ ...p, ...midia[p.chave], tags: tags[p.chave], repo: repos[p.chave] })),
  },
  contato: {
    ...c.contato,
    lista: [
      { rede: c.contato.redes[0], texto: EMAIL, href: `mailto:${EMAIL}`, icone: "fas fa-envelope" },
      { rede: c.contato.redes[1], texto: "linkedin.com/in/wagner-kauan", href: LINKEDIN, icone: "fab fa-linkedin-in", externo: true },
      { rede: c.contato.redes[2], texto: "github.com/WagnerK4uan", href: GITHUB, icone: "fab fa-github", externo: true },
      { rede: c.contato.redes[3], texto: "@_wagnerkauan", href: "https://www.instagram.com/_wagnerkauan/", icone: "fab fa-instagram", externo: true },
    ],
  },
});

export const conteudos = { pt: completar(pt), en: completar(en) };
