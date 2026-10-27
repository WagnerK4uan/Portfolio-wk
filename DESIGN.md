---
name: Portfólio Wagner Kauan
description: Portfólio de página única em tema escuro, com a primeira tela montada como uma planilha de migração (origem, conector, destino) e o violeta como marca de ação.
colors:
  fundo-noturno: "#09080e"
  superficie-1: "#111117"
  superficie-2: "#1a1922"
  superficie-3: "#26252f"
  texto-forte: "#eeeef4"
  texto-suave: "#aaa9b7"
  borda-fina: "#32313d"
  violeta-marca: "#7c6afd"
  violeta-acao: "#644ae3"
  violeta-acao-hover: "#5538c9"
  violeta-texto: "#b6a8ff"
  texto-sobre-acao: "#fcfcfc"
  foco-menta: "#6feaae"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.6rem + 5vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "1px"
  title:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.08rem + 0.35vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.25
  title-display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.08rem + 0.35vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "clamp(0.88rem, 0.86rem + 0.1vw, 0.92rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.5px"
  field:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "clamp(0.78rem, 0.76rem + 0.1vw, 0.82rem)"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "12px"
  pill: "100px"
spacing:
  espaco-1: "0.25rem"
  espaco-2: "0.5rem"
  espaco-3: "0.75rem"
  espaco-4: "1rem"
  espaco-5: "1.5rem"
  espaco-6: "2rem"
  espaco-7: "3rem"
  espaco-8: "5rem"
  section: "80px"
  container: "1100px"
components:
  button-primary:
    backgroundColor: "{colors.violeta-acao}"
    textColor: "{colors.texto-sobre-acao}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.violeta-acao-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.texto-forte}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 2rem"
  button-repo:
    backgroundColor: "{colors.violeta-acao}"
    textColor: "{colors.texto-sobre-acao}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
    height: "2.75rem"
  button-repo-private:
    backgroundColor: "{colors.superficie-3}"
    textColor: "{colors.texto-suave}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
  ficha-hero:
    backgroundColor: "{colors.superficie-1}"
    textColor: "{colors.texto-forte}"
    rounded: "{rounded.md}"
  ficha-hero-rodape:
    backgroundColor: "{colors.superficie-2}"
    padding: "0.75rem 1rem"
  card-project:
    backgroundColor: "{colors.superficie-2}"
    textColor: "{colors.texto-forte}"
    rounded: "{rounded.md}"
    padding: "{spacing.espaco-5}"
  card-contact:
    backgroundColor: "{colors.superficie-1}"
    textColor: "{colors.texto-forte}"
    rounded: "{rounded.md}"
    padding: "1rem 1.5rem"
  card-contact-hover:
    backgroundColor: "{colors.superficie-2}"
  skill-chip:
    backgroundColor: "{colors.superficie-2}"
    textColor: "{colors.texto-forte}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.75rem 0.25rem 0.25rem"
  tag:
    backgroundColor: "{colors.superficie-3}"
    textColor: "{colors.violeta-texto}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  experience-stack-tag:
    backgroundColor: "{colors.superficie-2}"
    textColor: "{colors.violeta-texto}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
---

# Design System: Portfólio Wagner Kauan

## Overview

**Creative North Star: "A Planilha de Migração"**

O portfólio é escuro e se organiza como o trabalho de quem migra sistemas: um campo na origem, um conector, um valor no destino. A primeira tela é uma ficha em três colunas (nome do campo em JetBrains Mono, seta violeta, valor) e a mesma lógica volta na linha do tempo da experiência e na tabela de habilidades. O retrato fica dentro da ficha, como mais um campo preenchido, e não como moldura de página.

O fundo é quase preto com matiz violeta discreto (290) e três degraus de superfície que separam as camadas por tom, sem depender de sombra. O violeta tem voz única: marca traço, conector e ícone; vira fundo só em botão de ação; vira cor de texto apenas na versão clara (`violeta-texto`). O brilho que segue o ponteiro e o gradiente do hero são feitos só em CSS e a partir do mesmo violeta.

A densidade é média: seções de 80px de respiro vertical, container de 1100px, cantos de 6px e 12px. O tom é técnico e direto, sem decoração gratuita. Divergência com a intenção original: o build não tem tema claro; tokens.css declara só o escuro.

**Key Characteristics:**
- Tema único escuro, três superfícies em matiz 290 e borda de 1px em todo contêiner.
- Violeta como único acento cromático, em quatro papéis (marca, ação, ação em hover, texto).
- Três famílias com função fixa: Bricolage Grotesque (display), Atkinson Hyperlegible Next (texto), JetBrains Mono (campos), todas locais via `@fontsource-variable`.
- Motivo recorrente do conector: linha de 2px em violeta com ponta de seta, na ficha do hero e nas frentes da experiência.
- Movimento só com `opacity`, `transform` e `filter`, com versão estática sob `prefers-reduced-motion: reduce`.

## Colors

Escuro frio com matiz 290 e um único acento violeta; todas as cores moram em `src/styles/tokens.css` como `--cor-*` em oklch, e o resto do CSS só consome `var()`.

### Primary
- **Violeta Marca** (#7c6afd, `oklch(0.62 0.21 284)`): traço sob títulos de seção, conectores, marcador do item atual da experiência, ícones dos cartões de contato, borda de hover e de foco dentro de cartões, ponto do logo. Base do brilho do ponteiro (10% a 12% de mistura). Não leva texto.
- **Violeta Ação** (#644ae3, `oklch(0.53 0.22 284)`): fundo de botão e de link de repositório, sempre com texto `texto-sobre-acao`. Também colore ícones de fonte nas habilidades e dá a sombra violeta.
- **Violeta Ação Hover** (#5538c9, `oklch(0.47 0.21 284)`): fundo do botão em hover e foco.
- **Violeta Texto** (#b6a8ff, `oklch(0.78 0.13 290)`): cargo na experiência, etiqueta de situação atual, tags de tecnologia.
- **Texto Sobre Ação** (#fcfcfc): texto de botões.

### Neutral
- **Fundo Noturno** (#09080e): fundo da página, das seções de experiência, habilidades e contato, e miolo do marcador da linha do tempo.
- **Superfície 1** (#111117): seções Intro, Sobre e Projetos, ficha do hero, painel de habilidades, cartões de contato.
- **Superfície 2** (#1a1922): cartão de projeto, cabeçalho e rodapé da ficha, chips de habilidade, cartão de contato em hover.
- **Superfície 3** (#26252f): tags de projeto, código inline, selo de repositório privado, ponta escura do gradiente de preview.
- **Texto Forte** (#eeeef4): títulos, nome, rótulos e a placa clara atrás dos ícones de habilidade.
- **Texto Suave** (#aaa9b7): texto corrido, nomes de campo, períodos, legendas.
- **Borda Fina** (#32313d): toda borda de 1px, trilho da linha do tempo, divisórias.

### Accessibility
- **Foco Menta** (#6feaae): anel de foco, exclusivo para esse uso. É a única cor fora da família violeta e neutra, escolhida para destacar no escuro sem competir com a marca.

### Named Rules
**A Regra da Voz Única.** O violeta é o único acento. Entra como traço, conector, ícone, borda de resposta ou fundo de botão de ação; nunca como fundo de seção.

**A Regra dos Quatro Violetas.** Marca para o que é traço e ícone, ação para fundo com texto claro, ação em hover para o degrau abaixo, texto para letra sobre o escuro. Não trocar os papéis: o violeta marca não leva texto.

**A Regra do Token Único.** Cor literal só em `tokens.css`. Estados e misturas usam `color-mix(in oklch, ...)` sobre os tokens.

## Typography

**Display Font:** Bricolage Grotesque Variable (com system-ui, sans-serif)
**Body Font:** Atkinson Hyperlegible Next Variable (com system-ui, sans-serif)
**Field Font:** JetBrains Mono Variable (com ui-monospace, monospace)

**Character:** Display expressivo e apertado no nome e nos títulos de cartão do hero e da experiência, texto de leitura muito legível no corpo, monoespaçada para tudo que soa como campo ou dado (nomes de campo da ficha, períodos, tags, código).

### Hierarchy
- **Display** (800, `clamp(2.6rem, 1.6rem + 5vw, 5.25rem)`, line-height 0.95, tracking -0.035em): nome no hero.
- **Headline** (700, 2rem, caixa alta, 1px de tracking, centralizado): títulos de seção, com traço violeta de 48px por 3px abaixo. Reduz no mobile (main.css, abaixo de 768px).
- **Title** (700, `--tipo-lg`, line-height 1.25): título de cartão de projeto (Atkinson), cargo do hero e título da experiência (Bricolage, tracking -0.01em). Destaques de projeto sobem para `--tipo-xl`.
- **Body** (400, `--tipo-base`, 1.7): texto corrido em Texto Suave; `--tipo-sm` nas descrições de card e legendas. Medida de 62 a 68 caracteres por linha (no Sobre, `max-width: 31.5em`, porque o `ch` mede o zero, mais largo que a letra média).
- **Label** (700, 0.95rem, tracking 0.5px): botões. Links de repositório e rótulos de habilidade usam 600 em `--tipo-sm`.
- **Field** (JetBrains Mono, 500 nas tags, `--tipo-xs`): nomes de campo, períodos, tags, código inline.

Escala fluida declarada em tokens: xs, sm, base, lg, xl, 2xl, 3xl e display, todas com `clamp()`.

### Named Rules
**A Regra das Três Funções.** Cada família tem uma função: Bricolage para nome e títulos autorais, Atkinson para leitura e interface, JetBrains Mono para campo e dado. Não usar uma quarta família nem mono em texto corrido.

## Layout

Página única com rolagem suave, header fixo de 3.75rem e `scroll-padding-top` correspondente. Container de 1100px com 1.5rem de margem lateral; seções de 80px de respiro vertical, separadas por borda de 1px. Fundos alternam Superfície 1 (Intro, Sobre, Projetos) e Fundo Noturno (Experiência, Habilidades, Contato).

- **Hero:** altura mínima da viewport (`100svh`). Ficha em grade: abaixo de 768px campo e conector na mesma linha com o valor embaixo e miniatura do retrato de 4.5rem ao lado do nome; de 768px, três colunas (campo de 8.5 a 11rem, conector de 4rem, valor) e cabeçalho de planilha; de 1024px, o retrato vira a coluna direita de 16 a 21rem na altura da ficha.
- **Experiência:** linha do tempo de até 52rem. Mobile com trilho à esquerda; de 768px, período à direita na coluna de 10rem e trilho entre as colunas.
- **Habilidades:** painel de até 920px, uma linha por área (título e chips de tecnologia que quebram linha), legenda em texto para a stack atual.
- **Projetos:** uma coluna no celular; de 768px duas colunas com destaque ocupando a linha inteira; de 1024px grade de 6 colunas, destaques com 3 e demais com 2.
- **Contato:** quatro canais em uma coluna, 2 por 2 a partir de 36rem e 4 lado a lado a partir de 72rem (lista de até 1040px).

Breakpoints: 30rem, 36rem, 48rem (768px), 64rem, 72rem. Escala de espaço de 0.25rem a 5rem (`--espaco-1` a `--espaco-8`).

### Movimento
- **Entrada do hero:** em sequência de 70ms, retrato (escala de 0.97 e fade), nomes de campo (fade), conectores (`scaleX` de 0 a 1) e valores e botões (deslocamento de 0.75rem com fade). Última animação termina em cerca de 880ms. Fill `backwards` para não prender o `transform` do hover.
- **Revelação ao rolar:** com JS (`html.js`), blocos com `.reveal` entram subindo 18px, saindo de um desfoque de 4px e do `opacity: 0`; o traço do título se estende por `scaleX`. Sem JS o conteúdo nasce visível.
- **Brilho do ponteiro:** gradiente radial violeta (hero 10%, cartão de projeto 12%) em pseudoelemento atrás do conteúdo, posicionado por `--mx` e `--my`, que entra por `opacity`. Só em dispositivos com hover fino (`.tem-brilho`), nunca por cima do texto.
- **Cores de estado:** `--fundo-animavel`, `--borda-animavel` e `--texto-animavel` registradas com `@property`; hover e foco trocam a variável, não `background` nem `border-color`.
- **Preview de projeto:** poster estático por padrão; no hover ou foco do cartão, `src/scripts/projetos.js` troca para o GIF animado.
- **Reduzido:** sob `prefers-reduced-motion: reduce`, nenhuma animação CSS, nenhum deslocamento nem desfoque; só fade de `opacity` de até 140ms. Hover de cartões e botões não se move.

Durações: rápida 140ms, média 300ms, lenta 600ms. Curvas: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` e `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)`.

## Elevation & Depth

Camadas por tom, não por sombra: a profundidade vem dos três degraus de superfície e da borda de 1px. A sombra é escura, de baixa leitura sobre o fundo escuro, e o brilho violeta aparece somente em ação e resposta.

### Shadow Vocabulary
- **Card** (`0 4px 20px oklch(0.08 0.01 290 / 0.5)`): ficha do hero, painel de habilidades, cartão de projeto em repouso.
- **Card em hover** (`0 12px 32px oklch(0.08 0.01 290 / 0.7)`): cartão de projeto levantado, somado a um anel de 1px em Violeta Marca e à sombra violeta.
- **Header** (`0 1px 0 var(--cor-borda), 0 6px 20px oklch(0.08 0.01 290 / 0.6)`): header rolado.
- **Violeta** (`0 5px 15px oklch(0.53 0.22 284 / 0.3)`) e **violeta em hover** (`0 8px 24px ... / 0.45`): botão principal; o hover aparece por `opacity` de um pseudoelemento, não por transição de sombra.

### Named Rules
**A Regra do Levantar.** Elementos interativos sobem no hover e no foco: botão e cartão de contato 2px, link de repositório 1px, cartão de projeto 6px. O clique afunda (`scale(0.98)`).

## Shapes

Três valores de raio: 6px (botões, chips de habilidade, miniatura do retrato), 12px (ficha, cartões, painel) e pílula de 100px (tags, situação atual, marcador da linha do tempo, traço do título de seção). Exceções, todas em peças pequenas: 4px no anel de foco (`:focus-visible`, `main.css`), no código inline dos cartões de projeto (`projetos.css`) e na placa clara do ícone de habilidade (`habilidades.css`); 2px no ponto violeta do logo e no sublinhado dos links da navegação (`navegacao.css`). A partir de 1024px o retrato vira coluna da ficha com raio 0 e recebe o canto de 12px pelo corte da ficha (`overflow: hidden`). Todo contêiner tem borda de 1px em Borda Fina; o cartão de projeto corta o preview com `overflow: hidden`. O conector da ficha é uma linha de 2px com ponta de seta desenhada por bordas.

## Components

### Buttons
- **Primário:** fundo Violeta Ação, texto Texto Sobre Ação, 700 a 0.95rem, 0.5px de tracking, 0.85rem por 2rem, sombra violeta. Hover e foco: Violeta Ação Hover, sombra maior, sobe 2px.
- **Secundário:** transparente, borda Borda Fina e texto forte; hover vai a Superfície 2 e borda Violeta Marca.
- **Repositório:** compacto (0.6rem por 1.2rem, mínimo 2.75rem de altura), sem sombra, sobe 1px no hover. **Privado:** selo em Superfície 3 e Texto Suave, sem hover e sem cursor de link.

### Ficha do hero
Painel Superfície 1 com borda e raio de 12px. Cada linha tem nome do campo em JetBrains Mono (Texto Suave), conector violeta e valor (nome em display, cargo, frase de posicionamento). Cabeçalho de planilha em Superfície 2 a partir de 768px e rodapé de ações em Superfície 2 com botões de 2.75rem de altura. Retrato com `object-fit: cover`.

### Cartões de experiência
Itens de uma lista com trilho vertical de 2px e marcador circular de 12px. O item atual tem marcador preenchido em Violeta Marca com halo e etiqueta de situação em pílula. Cargo em Violeta Texto, frentes de trabalho com o conector violeta como marcador, stack em tags de pílula em Superfície 2.

### Grade de habilidades
Painel de áreas (linhas separadas por borda de 1px). Cada tecnologia é um chip de 6px com ícone de 1.75rem sobre placa clara (para logotipos escuros continuarem visíveis) e nome em 600. Stack do trabalho atual: borda Violeta Marca e fundo misturado a 14%. Sem barra de nível.

### Cards de projeto
Superfície 2, borda, 12px, preview 16:9 com poster estático, corpo com título, descrição que estica para alinhar o link na base, tags em pílula (JetBrains Mono, Violeta Texto sobre Superfície 3) e link de repositório. Hover e foco interno: sobe 6px, anel de Violeta Marca, preview com `scale(1.03)`, troca para o preview animado e borda das tags puxada ao violeta. Destaques maiores (título em `--tipo-xl`).

### Cartões de contato
Quatro links em Superfície 1 com borda: ícone Violeta Marca de `--tipo-xl` em coluna fixa de 1.75rem, rede em 700 e endereço em Texto Suave. Hover e foco: Superfície 2, borda Violeta Marca, sobe 2px. Em 72rem ou mais, ícone acima do texto.

### Navigation
Header fixo com logo "WK" em display e ponto violeta; fundo transparente no hero e sólido (com sombra) depois que a sentinela sai da vista. Menu de seções com alvos de 2.75rem, sublinhado violeta que cresce no hover, foco e seção ativa; menu mobile acessível com abertura por botão. Link "Pular para o conteúdo" visível só no foco.

### Icons
Locais, sem CDN: `src/styles/icones.css` mantém a marcação `<i class="fas|fab fa-...">` e pinta cada SVG (Font Awesome Free 6.4.0, CC BY 4.0) como máscara em `currentColor`. Ícones de tecnologia das habilidades são imagens locais.

### Accessibility
- Foco visível global: `:focus-visible` com 2px em Foco Menta e 3px de afastamento; botão de repositório repete a regra.
- Alvos de toque de 2.75rem (44px) em menu, logo, botões da ficha e link de repositório.
- Pares de texto com meta de 4.5:1; a mistura máxima do brilho sobre os cartões foi limitada para manter essa meta (`tests/movimento.test.js`).
- Conteúdo legível sem JS; movimento com fallback estático.

## Do's and Don'ts

### Do:
- **Do** consumir cor, tipo, espaço, raio e movimento só por `var()` de `tokens.css`; cor nova entra primeiro lá.
- **Do** separar camadas por degrau de superfície e borda de 1px antes de pensar em sombra.
- **Do** usar Violeta Ação como fundo de texto claro, Violeta Texto como cor de texto sobre o escuro e Violeta Marca para traço, conector e ícone.
- **Do** usar o conector violeta e JetBrains Mono para nome de campo e dado quando a informação tem forma origem e destino.
- **Do** manter 44px de alvo, foco em Foco Menta e hover e foco com o mesmo estado.
- **Do** animar só `opacity`, `transform` e `filter` e escrever a versão estática sob `prefers-reduced-motion: reduce`.
- **Do** escrever texto do site em pt-BR, primeira pessoa, sem travessão, sem métrica nem depoimento.

### Don't:
- **Don't** usar Violeta Marca como cor de texto nem como fundo de seção ou degradê decorativo. Exceção autorizada pela Spec 4: o brilho do hero (`.hero::before` em `hero.css`), dois gradientes radiais atrás da ficha, um de Violeta Marca a 26% no canto superior direito e um de Violeta Ação a 14% no canto inferior esquerdo, ambos sumindo para transparente aos 70%. Segunda exceção, autorizada pela Spec 7: o brilho do ponteiro (`.hero::after` e `.project-card::before` em `movimento.css`), um gradiente radial de Violeta Marca (10% no hero, 12% no cartão de projeto) que segue o ponteiro, fica atrás do conteúdo e só aparece com hover fino e fora de `prefers-reduced-motion: reduce`.
- **Don't** introduzir um segundo acento cromático; Foco Menta é só do anel de foco.
- **Don't** usar raios fora de 6px, 12px e pílula, salvo as exceções de Shapes: 4px (anel de foco, código inline, placa do ícone de habilidade) e 2px (ponto do logo, sublinhado da navegação).
- **Don't** mostrar nível de habilidade em barra ou porcentagem: seria afirmação não verificável.
- **Don't** trocar `background` ou `border-color` por transição direta; usar as cores registradas com `@property`.
- **Don't** deixar o brilho do ponteiro passar por cima do texto ou valer sem hover fino.

## Not canonized

Pendência registrada sem virar regra: `main.css` mantém valores literais (`80px`, `1.5rem`, `2rem` do título de seção, `0.95rem` do botão, `4px` do foco) fora da escala de tokens; seguem como estão no build, e novos componentes devem preferir os tokens.
