---
name: Portfólio Wagner Kauan
description: Portfólio de página única, claro e organizado, com o violeta como marca de ação e destaque.
colors:
  violeta-eletrico: "#6c63ff"
  violeta-acao: "#625af0"
  violeta-profundo: "#574fd6"
  violeta-noturno: "#4a42c4"
  lavanda-nevoa: "#ede9fe"
  papel-branco: "#ffffff"
  gelo-ardosia: "#f8fafc"
  tinta-noturna: "#1e1e2e"
  ardosia-media: "#64748b"
  linha-neblina: "#e2e8f0"
  noite-funda: "#0f0f1a"
  ardosia-clara: "#94a3b8"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "1px"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "1px"
  title-lg:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.7
  title-md:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.7
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.7
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.7
  label-lg:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.3
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.3
  label-sm:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  xs: "4px"
  sm: "6px"
  md: "12px"
  pill: "100px"
  full: "50%"
spacing:
  gutter: "1.5rem"
  card: "1.5rem"
  grid-gap: "2rem"
  section: "80px"
  container: "1100px"
components:
  button-primary:
    backgroundColor: "{colors.violeta-acao}"
    textColor: "{colors.papel-branco}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 2rem"
  button-primary-hover:
    backgroundColor: "{colors.violeta-profundo}"
  button-repo:
    backgroundColor: "{colors.violeta-acao}"
    textColor: "{colors.papel-branco}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
  button-repo-private:
    backgroundColor: "{colors.ardosia-media}"
    textColor: "{colors.papel-branco}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.2rem"
  chip-tech:
    backgroundColor: "{colors.lavanda-nevoa}"
    textColor: "{colors.violeta-profundo}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.75rem"
  card-project:
    backgroundColor: "{colors.papel-branco}"
    rounded: "{rounded.md}"
    padding: "{spacing.card}"
  card-skill:
    backgroundColor: "{colors.papel-branco}"
    textColor: "{colors.tinta-noturna}"
    rounded: "{rounded.md}"
    padding: "1.25rem 0.5rem"
  card-highlight:
    backgroundColor: "{colors.gelo-ardosia}"
    textColor: "{colors.tinta-noturna}"
    rounded: "{rounded.md}"
    padding: "1.1rem 1.2rem"
  nav-header:
    backgroundColor: "{colors.papel-branco}"
    textColor: "{colors.tinta-noturna}"
    padding: "1rem 1.5rem"
  footer:
    backgroundColor: "{colors.noite-funda}"
    textColor: "{colors.ardosia-clara}"
    padding: "60px 1.5rem"
---

# Design System: Portfólio Wagner Kauan

## Overview

**Creative North Star: "A Bancada Organizada"**

O portfólio é uma bancada de trabalho limpa: superfície clara, cada peça no seu lugar, ferramentas à vista. O fundo alterna entre branco e um gelo levemente azulado, e sobre ele os blocos de conteúdo (destaques, habilidades, projetos) ficam em cards alinhados em grade, com borda fina e sombra quase imperceptível. Nada compete com o trabalho exposto.

O Violeta Elétrico é a única cor com voz. Ele marca o que é ação (botões, links), o que é identidade (o anel em volta da foto, o sublinhado da navegação) e o que reage ao visitante (borda de hover nos cards de habilidade). Todo o resto é neutro: tinta escura para títulos, ardósia para texto corrido.

A densidade é média e arejada: seções de 80px de respiro vertical, container de 1100px, Poppins em uma única família com peso fazendo a hierarquia. Os componentes são acessíveis e responsivos: cantos arredondados, sombra suave que cresce no hover, elementos que sobem alguns pixels quando o cursor passa.

**Key Characteristics:**
- Fundo claro com alternância branco / gelo entre seções; rodapé noturno como fechamento.
- Um único acento cromático, o Violeta Elétrico, com variante profunda para hover.
- Poppins em todos os níveis; títulos de seção em caixa alta com 1px de tracking.
- Cards com borda de 1px e sombra difusa, levantando no hover.
- Hover em 0.3s ease; entradas e revelações em 0.6s a 0.8s com desaceleração `cubic-bezier(0.16, 1, 0.3, 1)`.

## Colors

Paleta neutra fria com um único acento violeta saturado.

### Primary
- **Violeta Elétrico** (#6c63ff): a cor de identidade, usada em tudo que não é texto: anel da foto do hero, sublinhado animado da navegação, traço dos títulos de seção, ícones dos destaques e das habilidades, borda de hover dos cards de habilidade. Também aparece como sombra colorida translúcida (30% e 45% de opacidade) sob botões e foto.
- **Violeta Ação** (#625af0): fundo de tudo que leva texto branco: botões, link de repositório, link de pular conteúdo, hover dos ícones sociais. Contraste de 4.95:1 com o branco.
- **Violeta Profundo** (#574fd6): hover dos botões, cor de texto violeta sobre fundo claro (links no texto, link ativo da navegação, tags de tecnologia) e contorno de foco.
- **Violeta Noturno** (#4a42c4): hover dos links no texto.
- **Lavanda Névoa** (#ede9fe): fundo das tags de tecnologia nos cards de projeto. Também início do degradê de placeholder dos previews (#ede9fe → #e0e7ff).

### Neutral
- **Papel Branco** (#ffffff): fundo do header, do hero, da seção de habilidades e dos cards.
- **Gelo Ardósia** (#f8fafc): fundo alternado das seções Sobre e Projetos, e dos cards de destaque.
- **Tinta Noturna** (#1e1e2e): títulos, nome no hero, links da navegação, texto de rótulos.
- **Ardósia Média** (#64748b): texto corrido, subtítulos de seção, ícones sociais em repouso, fundo do botão de repositório privado.
- **Linha Neblina** (#e2e8f0): bordas de 1px de cards e divisórias entre seções.
- **Noite Funda** (#0f0f1a): fundo do rodapé.
- **Ardósia Clara** (#94a3b8): texto corrido sobre o rodapé escuro; títulos do rodapé ficam em branco puro.

### Named Rules
**A Regra da Voz Única.** O violeta é o único acento. Ele aparece apenas em ação, identidade ou resposta a interação, nunca como fundo de seção ou decoração solta.

**A Regra do Hover Profundo.** Todo elemento violeta escurece um degrau no hover (Ação para Profundo, Profundo para Noturno); não existe outra cor de estado.

**A Regra do Texto Legível.** O Violeta Elétrico nunca é cor de texto nem fundo de texto. Texto violeta usa o Violeta Profundo; texto branco sobre violeta usa o Violeta Ação ou mais escuro.

## Typography

**Display Font:** Poppins (com sans-serif)
**Body Font:** Poppins (com sans-serif)

**Character:** Uma única família geométrica em pesos 400, 600 e 700. O contraste vem de peso e caixa alta, não de troca de fonte.

### Hierarchy
- **Display** (700, 3rem, caixa alta, 1px de tracking): nome no hero. Cai para 2rem abaixo de 768px e 1.6rem abaixo de 480px.
- **Headline** (700, 2rem, caixa alta, 1px de tracking): títulos de seção, centralizados. 1.6rem no mobile.
- **Title** (700, 1.6rem / 1.4rem / 1.1rem): subtítulo da seção Sobre (`title-lg`), título do rodapé (`title-md`), título do card de projeto e do contato (`title`).
- **Body** (400, 1rem e 0.9rem, line-height 1.7 a 1.8): texto corrido em Ardósia Média; `body-sm` nas descrições de projeto e no rodapé. Subtítulos de seção limitados a 640px; texto do hero a 560px.
- **Label** (600, 0.95rem / 0.85rem / 0.78rem): navegação e botões (`label-lg`), rótulos de habilidade e destaques (`label`), tags e navegação em telas pequenas (`label-sm`).

### Named Rules
**A Regra do Peso, Não da Fonte.** Hierarquia se faz com peso, tamanho e caixa alta dentro da Poppins. Não introduzir uma segunda família.

## Layout

Página única com rolagem suave e header fixo. Container centralizado de 1100px com 1.5rem de margem lateral. Cada seção tem 80px de respiro vertical e alterna fundo branco e gelo, separadas por bordas de 1px em Linha Neblina.

- **Hero:** altura total da viewport, foto circular de 220px ao lado do texto alinhado à esquerda, sobre a textura de facetas brancas (`img/background-white.png`). Abaixo de 768px empilha e centraliza, com foto de 170px.
- **Sobre:** duas colunas flexíveis (texto a partir de 320px, destaques a partir de 280px) com 3rem de gap; empilha no mobile.
- **Habilidades:** grade `auto-fill` de cards com mínimo de 112px, máximo de 920px de largura, gap de 1rem. Abaixo de 480px o mínimo cai para 84px.
- **Projetos:** grade `auto-fit` com mínimo de 300px e gap de 2rem; uma coluna abaixo de 768px.
- **Rodapé:** texto à esquerda (até 560px) e contato à direita; empilha no mobile com botão de largura total.
- **Barra social:** fixa na lateral esquerda, centralizada verticalmente. Abaixo de 768px vira uma barra horizontal flutuante no centro inferior da tela, e o rodapé ganha 100px de padding inferior para não ser coberto.

Breakpoints: 768px e 480px.

### Movimento
- **Momento principal:** na entrada do hero, a foto abre em círculo (`clip-path`, 0.8s), nome, frase e botão entram com leve desfoque em sequência (0.25s, 0.4s, 0.55s) e, aos 1s, um traço violeta de 3px se desenha sob "Cloud e DevOps".
- **Ao rolar:** títulos de seção ganham um traço violeta de 48px × 3px que se desenha; destaques, habilidades e projetos entram como lista (subida de 18px com desfoque de 4px, atraso por item limitado a 400ms).
- **Continuidade:** o link da seção visível fica violeta com sublinhado; o header ganha sombra mais forte ao sair do hero.
- **Toque:** botões afundam (`scale(0.98)`) ao clicar.
- O conteúdo nasce visível; as revelações só existem com JS (`html.js`). Em `prefers-reduced-motion`, tudo vira fade curto, sem deslocamento nem desfoque.

## Elevation & Depth

Sistema híbrido: superfícies claras separadas por borda fina, com sombras difusas e de baixa opacidade dando leve flutuação. A sombra é ambiente em repouso e cresce como resposta ao hover. O violeta também vira sombra colorida sob botões e foto, reforçando o acento.

### Shadow Vocabulary
- **Card em repouso** (`box-shadow: 0 4px 20px rgba(0,0,0,0.06)`): cards de projeto e habilidade.
- **Card em hover** (`box-shadow: 0 12px 32px rgba(0,0,0,0.12)`): projeto levantado 6px.
- **Brilho violeta** (`box-shadow: 0 5px 15px rgba(108,99,255,0.3)`): botão principal em repouso; `0 8px 24px rgba(87,79,214,0.45)` no hover. Card de habilidade em hover usa `0 10px 24px rgba(108,99,255,0.3)`.
- **Halo da foto** (`box-shadow: 0 8px 32px rgba(108,99,255,0.3)`): foto do hero.
- **Header** (`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`): separação do header fixo no topo; ao sair do hero passa para `0 6px 20px rgba(0,0,0,0.08)`.
- **Barra social** (`box-shadow: 0 2px 12px rgba(0,0,0,0.1)`).

### Named Rules
**A Regra do Levantar.** Elementos interativos sobem no hover: botão 2px, link de repositório 1px, habilidade 4px, projeto 6px. Quanto maior a superfície, maior o deslocamento.

## Shapes

Cantos arredondados moderados e consistentes. Botões e barra social usam 6px; cards (projeto, habilidade, destaque) usam 12px; tags de tecnologia são pílulas (100px). Fotos (hero e logo) são círculos perfeitos com anel violeta, de 4px no hero e 2px no logo. Os previews dos projetos são cortados pelo card (`overflow: hidden`) e ficam com cantos superiores arredondados. Bordas são sempre de 1px em Linha Neblina.

## Components

### Buttons
Cheios, arredondados e com brilho violeta.
- **Shape:** cantos suaves (6px).
- **Primary:** fundo Violeta Ação, texto branco em peso 700 a 0.95rem com 0.5px de tracking, padding 0.85rem × 2rem, ícone opcional à esquerda com 0.5rem de gap, sombra violeta.
- **Hover:** escurece para Violeta Profundo, sombra mais intensa, sobe 2px. Transição de 0.3s ease.
- **Repositório:** versão compacta (0.6rem × 1.2rem, 0.9rem, peso 600) no rodapé do card de projeto, sem sombra, sobe 1px no hover.
- **Repositório privado:** mesmo formato em Ardósia Média, sem hover nem cursor de link.
- **Rodapé:** botão principal com texto 0.9rem, sem sombra colorida (brilho violeta sobre fundo escuro vira decoração); largura total no mobile.

### Chips
- **Style:** tags de tecnologia em pílula, fundo Lavanda Névoa, texto Violeta Profundo, peso 600 a 0.78rem, padding 0.3rem × 0.75rem, gap de 0.4rem, quebrando linha.
- **State:** estáticas, sem interação.

### Cards / Containers
- **Projeto:** fundo branco, borda Linha Neblina, cantos de 12px, sombra de repouso. Preview em GIF com 200px de altura (160px abaixo de 480px) e `object-fit: cover`, corpo com padding de 1.5rem e gap de 0.75rem, descrição que estica para alinhar os botões na base. Hover sobe 6px com sombra maior.
- **Habilidade:** coluna centralizada com ícone de 44px (SVG colorido do Devicon ou ícone Font Awesome em violeta) e rótulo em peso 600. Hover sobe 4px, borda vira violeta e a sombra fica violeta.
- **Destaque (Sobre):** linha com ícone violeta à esquerda, título em peso 600 e linha de apoio menor em Ardósia Média, fundo gelo. Hover só adiciona a sombra de repouso.

### Navigation
- **Header fixo** branco com sombra leve. À esquerda, "WK" em caixa alta, visível em todos os tamanhos. Antes dele, um link "Pular para o conteúdo" que só aparece no foco do teclado.
- **Links** em Tinta Noturna, peso 600 a 0.95rem, gap de 2rem, com 0.6rem de padding vertical (área de toque de 41px). No hover e na seção ativa ficam em Violeta Profundo e um sublinhado de 2px cresce da esquerda. No mobile o gap cai para 1rem e o texto para 0.85rem e 0.78rem; com texto ampliado, o menu quebra linha em vez de estourar a largura.
- **Barra social:** ícones Font Awesome em Ardósia Média, separados por linhas de 1px; no hover o fundo vira violeta e o ícone branco.

### Hero
A assinatura do portfólio: foto circular grande com anel e halo violeta ao lado do nome em caixa alta, sobre uma textura de facetas brancas quase imperceptível. Uma linha de apoio em Ardósia Média e o botão principal "Ver Projetos".

## Do's and Don'ts

### Do:
- **Do** usar a família violeta só em ação, identidade e resposta a interação, sempre escurecendo um degrau no hover.
- **Do** manter Poppins como única família, com hierarquia por peso (400, 600, 700) e caixa alta com 1px de tracking nos títulos de seção.
- **Do** alternar fundo branco e Gelo Ardósia entre seções, separadas por bordas de 1px em Linha Neblina.
- **Do** dar a todo card novo borda de 1px, cantos de 12px e a sombra de repouso `0 4px 20px rgba(0,0,0,0.06)`.
- **Do** usar 0.3s ease no hover, `cubic-bezier(0.16, 1, 0.3, 1)` em entradas, e fazer elementos interativos subirem no hover (1px a 6px, proporcional ao tamanho).
- **Do** usar tags em pílula Lavanda Névoa para listar tecnologias.
- **Do** seguir a Regra do Texto Legível: Violeta Ação (#625af0) como fundo de texto branco, Violeta Profundo (#574fd6) como cor de texto. Todo par de texto fica em 4.5:1 ou mais.

### Don't:
- **Don't** introduzir uma segunda cor de acento ou trocar o roxo; o visual roxo com Poppins é compromisso da marca.
- **Don't** usar o violeta como fundo de seção inteira ou em degradês decorativos.
- **Don't** criar sombras escuras e duras; toda sombra neutra fica entre 6% e 12% de opacidade.
- **Don't** usar cantos retos ou raios fora da escala (6px, 12px, pílula, círculo).
- **Don't** depender só do hover para indicar interação: todo componente novo precisa manter o foco visível global (contorno de 2px em Violeta Profundo, 3px de afastamento) para cumprir o WCAG AA.
- **Don't** repetir a coreografia do hero em outras seções; ela é o único momento autoral, o resto é revelação discreta.
