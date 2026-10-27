# Portfólio Pessoal · Wagner Kauan

Este é o repositório do meu portfólio pessoal, onde apresento minhas habilidades, trajetória, experiências profissionais e projetos desenvolvidos. O objetivo é centralizar minhas informações como desenvolvedor e facilitar o contato com recrutadores, empresas e colaboradores.

Acesse: [portfolio-wk.vercel.app](https://portfolio-wk.vercel.app)

## 🔍 Sobre

Sou desenvolvedor com cerca de 3 anos na área. Na Bruning Sistemas atuo em duas frentes: desenvolvimento web, com Laravel no back-end e Nuxt.js no front-end, e migração, integração e importação de dados entre sistemas.

Estou em transição para Cloud Engineering, com objetivo de carreira em DevOps: comecei pelos fundamentos de redes (Google/Coursera), fiz cursos da AWS e uso Linux (Fedora) no dia a dia. Também estudo IA aplicada ao desenvolvimento (engenharia de prompts, Claude Code, Spec-Driven Development) e arquitetura de software (Clean Architecture, design patterns, testes unitários e system design).

Curso Engenharia de Software na UNISATC e sou técnico em Análise e Desenvolvimento de Sistemas pelo SENAI Tubarão.

## 💻 Tecnologias

**Este site:**

- HTML5, CSS3 e JavaScript puro, com build pelo [Vite](https://vite.dev)
- Conteúdo das seções em `src/data/`, renderizado no build: a página sai estática e legível sem JavaScript
- Fontes servidas localmente por `@fontsource-variable` (Bricolage Grotesque, Atkinson Hyperlegible Next e JetBrains Mono)
- Ícones locais em SVG (`src/styles/icones.css`), sem CDN
- [Motion](https://motion.dev) para a entrada das seções ao rolar, com versão estática sob `prefers-reduced-motion`
- `sharp` só no desenvolvimento: gera os posters dos projetos (`scripts/posters.mjs`), recomprime a imagem de compartilhamento (`scripts/og.mjs`) e confere os posters e os previews animados no teste `tests/acabamento-correcoes.test.js`
- Testes com Vitest e jsdom sobre o build

**Minhas habilidades:**

- **Front-end:** HTML, CSS, JavaScript, TypeScript, Vue.js, Nuxt, React, Next.js, Tailwind CSS, Responsive Design
- **Back-end:** PHP, Laravel, C#, .NET, Java, Python, APIs REST
- **Dados:** SQL, MySQL, PostgreSQL
- **Cloud, DevOps e Infra:** Linux, AWS
- **IA:** Claude Code
- **Ferramentas:** Git, GitHub

## 📁 Estrutura do Projeto

```
index.html          # Página única, com os marcadores <!-- render:... --> preenchidos no build
src/
  main.js           # Entrada do Vite: importa os estilos e liga os scripts
  data/             # Conteúdo: experiência, habilidades, projetos e contatos
  render/           # Funções que transformam os dados em HTML no build
  scripts/          # Comportamento no navegador: menu, navegação, previews e movimento
  styles/           # tokens.css (cores, tipo, espaço, movimento) e o CSS de cada seção
public/img/         # Foto, favicon, imagem de compartilhamento, previews e posters dos projetos, ícones
scripts/            # Utilitários rodados à mão: posters dos projetos e imagem de compartilhamento
tests/              # Testes do build (Vitest) e roteiros de navegador
specs/              # Especificações do desenvolvimento (Spec-Driven Development)
vite.config.js      # Configuração do Vite e plugin de render do conteúdo
dist/               # Gerado pelo build, não versionado
```

## 🧩 Funcionalidades

- Interface responsiva, com menu recolhido em telas pequenas e navegável por teclado
- Destaque na navegação para a seção visível na tela
- Seção "Sobre" com a trajetória
- Experiência e formação com o período de cada etapa
- Habilidades agrupadas por área, com destaque para a stack do trabalho atual
- Projetos com imagem estática leve, preview animado ao passar o ponteiro ou focar o card, tecnologias e link para o repositório
- Movimento na entrada das seções e brilho que segue o ponteiro, desligados sob `prefers-reduced-motion`
- Links para contato (E-mail, LinkedIn, GitHub, Instagram)
- Metadados de compartilhamento (Open Graph) com imagem de prévia

## 🚀 Como executar localmente

Requer Node.js e npm.

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/WagnerK4uan/Portfolio-wk
cd Portfolio-wk
npm ci
```

2. Rode em modo de desenvolvimento, com recarga automática:

```bash
npm run dev
```

3. Gere o build de produção em `dist/` e sirva-o localmente para conferir:

```bash
npm run build
npm run preview
```

4. Rode os testes (o comando gera o build antes):

```bash
npm test
```

### Utilitários e roteiros de navegador

`scripts/og.mjs` (imagem de compartilhamento) e os roteiros de `tests/roteiros/` rodam num navegador real com o [Playwright](https://playwright.dev), que não está no `package.json` e não roda no `npm test`. Eles carregam o Playwright do caminho na variável `PLAYWRIGHT_MODULE` ou, sem ela, o do gstack em `~/.claude/skills/gstack/node_modules/playwright`. A versão usada até aqui é a 1.58.2, com o Chromium do cache `~/.cache/ms-playwright`. Com o build servido por `npm run preview`, em outro terminal:

```bash
PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright node tests/roteiros/hero-navegador.mjs [url]
node scripts/og.mjs [url]
```
