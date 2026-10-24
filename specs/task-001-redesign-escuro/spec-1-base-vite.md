# Spec 1 — Base do projeto com Vite e testes estáticos

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: nenhuma.

Objetivo: hoje o site é `index.html` + `style.css` + `main.js` soltos na raiz, sem build nem teste
(o `package-lock.json` está vazio, sem `package.json`). O redesign vai mexer em tudo, então precisa
de uma base com Vite para organizar CSS e JS em módulos, servir com recarga ao vivo e gerar `dist/`
para a Vercel, mais uma suíte Vitest que proteja as regras do projeto (texto sem travessão, `alt`
em imagem, links seguros, âncoras válidas). Esta spec **não muda o visual**: o site sai do build
igual ao da `master`.

## Critérios de aceite

- **CA-1.1 — O site sobe em desenvolvimento e gera build estático**
  - **Dado** o repositório com dependências instaladas (`npm install`)
  - **Quando** rodar `npm run build`
  - **Então** `dist/index.html` existe, referencia um CSS e um JS com hash em `dist/assets/` e o
    comando termina sem erro (o `npm run dev` serve a mesma página em `localhost`)
- **CA-1.2 — Todas as imagens do build existem**
  - **Dado** o `dist/index.html` gerado
  - **Quando** o teste listar todo `src` de `<img>` e o `href` do favicon
  - **Então** cada caminho aponta para um arquivo existente dentro de `dist/`
- **CA-1.3 — As seções atuais continuam lá**
  - **Dado** o `dist/index.html` gerado
  - **Quando** o teste procurar os ids `home`, `sobre`, `habilidades`, `projects` e `conteudo`
  - **Então** todos existem e cada link `nav a[href^="#"]` aponta para um id existente
- **CA-1.4 — Texto visível sem travessão**
  - **Dado** o `dist/index.html` gerado
  - **Quando** o teste extrair o texto do `<body>` e os atributos `alt`, `aria-label` e `title`
  - **Então** nenhum contém `—` nem `–`
- **CA-1.5 — Imagem sempre com alt e link externo seguro**
  - **Dado** o `dist/index.html` gerado
  - **Quando** o teste percorrer `<img>` e `<a target="_blank">`
  - **Então** toda `<img>` tem atributo `alt` (vazio permitido só para decorativa) e todo link com
    `target="_blank"` tem `rel` contendo `noopener`

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Abrir `index.html` atual no navegador
   (`/browse`) em 1440 px e 375 px e guardar os screenshots em `.gstack/` como referência; o build
   do passo 6 precisa ficar idêntico a eles.
2. **Criar o `package.json`.** `"type": "module"`, `private: true`, scripts `dev` (`vite`), `build`
   (`vite build`), `preview` (`vite preview`) e `test` (`vite build --logLevel warn && vitest run`);
   devDependencies `vite`, `vitest` e `jsdom` em versões estáveis fixadas. Regenerar o
   `package-lock.json` com `npm install`.
3. **Reorganizar os arquivos.** `img/` vai para `public/img/` (os caminhos `img/...` do HTML
   continuam valendo); `style.css` vai para `src/styles/main.css`; `main.js` vai para `src/main.js`,
   que importa o CSS (`import "./styles/main.css"`). O `index.html` fica na raiz e carrega só
   `<script type="module" src="/src/main.js">`. Decisão: renomear os arquivos com espaço
   (`projeto rh.webp` → `projeto-rh.webp`, `projeto rh.gif` → `projeto-rh.gif`,
   `foto Wagner.jpg` → `foto-wagner.jpg`) e ajustar as referências.
4. **Manter o script inline** `document.documentElement.classList.add("js")` no `<head>`, antes do
   CSS, porque o estado inicial das revelações depende dele sem piscar.
5. **Criar `vite.config.js`** mínimo (`build.outDir: "dist"`, `test.environment: "jsdom"`). Nenhum
   plugin além do necessário.
6. **Escrever `tests/html.test.js`** com um helper que carrega `dist/index.html` no jsdom e um teste
   por critério (CA-1.2 a CA-1.5), mais `tests/build.test.js` para CA-1.1 (confere o arquivo e
   os assets com hash).
7. **Não é escopo.** Mudar cor, fonte, layout, texto ou animação (Specs 2 a 7); otimizar ou apagar
   imagens não usadas (Spec 8); configurar a Vercel além do padrão de detecção do Vite.
8. **Validar.** `npm run build` e `npm test` verdes. Testes CA-1.1 a CA-1.5 passando.
   `npm run preview` + `/browse` em 1440 e 375 px batendo com os screenshots do passo 1.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-1.1 | A Vercel detecta o Vite sozinha (build `npm run build`, saída `dist/`) no preview da branch, sem `vercel.json`. | aberta | — |
| S-1.2 | Font Awesome e Google Fonts continuam por CDN nesta spec; trocar por pacote local fica para a Spec 2, se a direção visual pedir. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-1.1 | Qual stack usar no redesign? | respondida | Vite + JS puro, sem framework (Wagner, 2026-10-24). |

Ao final, resuma a nova estrutura de pastas, os scripts do `package.json`, os arquivos renomeados,
como cada critério de aceite ficou provado e qualquer diferença visual encontrada contra a `master`.
