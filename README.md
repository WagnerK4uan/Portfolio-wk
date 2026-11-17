# Portfólio Pessoal - Wagner Kauan

Este é o repositório do meu portfólio pessoal, onde apresento minhas habilidades, trajetória, experiências profissionais e projetos desenvolvidos. O objetivo é centralizar minhas informações como desenvolvedor e facilitar o contato com recrutadores, empresas e colaboradores.

Acesse: [portfolio-wk.vercel.app](https://portfolio-wk.vercel.app)

## 🔍 Sobre

Sou desenvolvedor web Full Stack, com cerca de 3 anos na área: Vue, React e Angular no front-end e PHP (Laravel), Java (Spring Boot) e C# (.NET) no back-end. No trabalho uso Laravel e Nuxt.js. Trabalho na Bruning Sistemas, onde passei pelo estágio e por migração e integração de dados e hoje atuo como desenvolvedor web Full Stack.

Estou em transição para Cloud Engineering, com objetivo de carreira em DevOps: comecei pelos fundamentos de redes (Google/Coursera), fiz cursos da AWS e uso Linux (Fedora) no dia a dia. Também estudo IA aplicada ao desenvolvimento (engenharia de prompts, Claude Code, Spec-Driven Development) e arquitetura de software (Clean Architecture, design patterns, testes unitários e system design).

Curso Engenharia de Software na UNISATC e sou técnico em Análise e Desenvolvimento de Sistemas pelo SENAI Tubarão.

## 💻 Tecnologias

**Este site:** Vite e React, com componentes do React Bits (DotGrid, BlurText, RotatingText, CountUp), transições do transitions.dev e as regras de layout da taste-skill. O HTML é pré-renderizado no build, em português (`/`) e em inglês (`/en/`), então a página abre completa mesmo antes do JavaScript.

**Minhas habilidades:**

- **Front-end:** HTML, CSS, JavaScript, TypeScript, Vue.js, Nuxt, React, Next.js, Tailwind CSS, Responsive Design
- **Back-end:** PHP, Laravel, C#, .NET, Java, Python, APIs REST
- **Dados:** SQL, MySQL, PostgreSQL, SQL Server
- **Cloud, DevOps e Infra:** Linux, AWS
- **IA:** Claude Code
- **Ferramentas:** Git, GitHub

## 📁 Estrutura do Projeto

- `index.html`: casca da página (header, main e footer)
- `src/components/`: seções da página e componentes do React Bits (`reactbits/`)
- `src/data/conteudo.js`: todos os textos nos dois idiomas, trajetória, habilidades, projetos e contatos
- `src/i18n.jsx`: o idioma da página (`/` ou `/en/`) para os componentes
- `en/index.html`: a página em inglês
- `src/styles/`: tokens, movimento, transições e estilos globais
- `src/entry-server.jsx` e `scripts/prerender.mjs`: pré-renderização do HTML no build
- `public/`: imagens (as telas animadas leves ficam em `img/anim`), ícones e o diagrama do kit da taste-skill

## 🧩 Funcionalidades

- Versões em português e inglês, com seletor PT / EN que mantém a seção
- Hero escuro com grade de pontos que reage ao cursor, foto em círculo e o nome em destaque
- Seção "Sobre mim" com diagrama do que uso como Full Stack
- Trajetória em escada, do curso técnico ao desenvolvimento web Full Stack
- Habilidades agrupadas por área, com ícones reais
- Projetos em lista com nomes grandes e a tela animada de cada um num quadro que acompanha a rolagem, com botão para pausar as animações e rótulo no cursor
- Botão para copiar o e-mail e links para contato (GitHub, LinkedIn, Instagram, E-mail)
- Respeita `prefers-reduced-motion` e funciona sem JavaScript

## 🚀 Como executar localmente

Requer Node.js 22 ou superior.

```bash
git clone https://github.com/WagnerK4uan/Portfolio-wk
cd Portfolio-wk
npm install
npm run dev
```

Para gerar a versão de produção: `npm run build` (saída em `dist/`) e `npm run preview` para conferir. Na Vercel o projeto usa o preset Vite, com build `npm run build` e saída `dist`.
