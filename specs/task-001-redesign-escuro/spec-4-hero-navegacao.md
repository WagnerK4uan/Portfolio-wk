# Spec 4 — Hero e navegação

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: Spec 3

Objetivo: o hero é a primeira impressão e hoje é uma foto ao lado de "Olá, eu sou Wagner Kauan" e
um botão. No celular, a navegação atual só encolhe a fonte dos links (`nav ul li a` vai a
`0.78rem` em `@media (max-width: 480px)` no antigo `style.css`), o que fica apertado com seis
seções. Esta spec desenha o hero escuro na direção escolhida na Spec 2, com a foto, um fundo de
brilho violeta sutil e uma entrada coreografada, e uma navegação que funciona bem de 320 px a
1440 px.

## Critérios de aceite

- **CA-4.1 — Header fixo que ganha fundo ao rolar**
  - **Dado** a página carregada no topo
  - **Quando** a seção `#home` sai da vista
  - **Então** o `<header>` recebe `is-scrolled` (fundo translúcido com desfoque) e continua visível
    (lógica de `IntersectionObserver` reaproveitada de `src/main.js`)
- **CA-4.2 — Menu mobile acessível**
  - **Dado** a largura de 375 px
  - **Quando** o visitante ativar o botão de menu por clique ou teclado
  - **Então** o botão alterna `aria-expanded` entre `false` e `true`, a lista de links aparece, o
    foco vai para o primeiro link, `Esc` fecha e devolve o foco ao botão, e clicar num link fecha o
    menu
- **CA-4.3 — Link da seção atual marcado**
  - **Dado** a página rolada até `#projetos`
  - **Quando** o teste ler a navegação
  - **Então** só o link de projetos tem `aria-current="true"` e a classe `is-active`
- **CA-4.4 — Hero completo e legível em qualquer largura**
  - **Dado** larguras de 320, 375, 768 e 1440 px
  - **Quando** abrir a página
  - **Então** nome, cargo, frase e os dois botões aparecem no primeiro viewport sem rolagem
    horizontal (`document.documentElement.scrollWidth <= innerWidth`) e a foto tem `alt` e
    `fetchpriority="high"`
- **CA-4.5 — Entrada do hero sem animação quando o sistema pede**
  - **Dado** `prefers-reduced-motion: reduce`
  - **Quando** a página carregar
  - **Então** os elementos do hero aparecem sem deslocamento (nenhuma `animation` com `transform`
    ativa nos elementos do hero)

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-4.2 primeiro: falha porque não
   existe botão de menu no `index.html`.
2. **Carregar o craft-floor.** Ler `.claude/skills/impeccable/reference/craft-floor.md` antes de
   editar a interface, e seguir a direção registrada em P-2.1.
3. **Header e navegação.** Logo "WK" como link para o topo, links das seções, botão de menu com
   `aria-controls` abaixo de 768 px. Lógica do menu em `src/scripts/menu.js`; link ativo e header
   rolado movidos de `src/main.js` para `src/scripts/navegacao.js` sem mudar o comportamento.
4. **Hero.** Layout com a foto `public/img/foto-wagner.webp`, nome em destaque, cargo, frase e
   botões "Ver projetos" (`#projetos`) e "Falar comigo" (`#contato`). Fundo com brilho violeta em
   gradiente CSS (sem imagem pesada nem canvas).
5. **Entrada coreografada** em CSS: foto, nome, cargo, frase e botões entram em sequência curta
   (total abaixo de 900 ms), só com `opacity` e `transform`, com a versão estática sob
   `prefers-reduced-motion`.
6. **Testes.** `tests/navegacao.test.js` para CA-4.1 a CA-4.3 (jsdom com `IntersectionObserver`
   simulado) e roteiro `/browse` registrado para CA-4.4 e CA-4.5 (Vitest com a página servida
   por `vite preview`, ou screenshots anexados ao resumo quando o jsdom não medir layout).
7. **Não é escopo.** Seções abaixo do hero (Specs 5 e 6); revelação ao rolar e brilho que segue o
   ponteiro (Spec 7).
8. **Validar.** `npm run build` e `npm test` verdes, testes CA-4.1 a CA-4.5. `/browse` em 320,
   375, 768 e 1440 px, navegação só por teclado e emulação de movimento reduzido.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-4.1 | A foto atual `foto-wagner.webp` (440×487) é boa o bastante para o hero novo; outra foto não será produzida. | aberta | — |
| S-4.2 | CA-4.4 e CA-4.5 dependem de layout real; se o jsdom não bastar, a prova é o roteiro `/browse` com screenshots. | aberta | — |

## Perguntas em aberto

Nenhuma.

Ao final, resuma o desenho do hero e da navegação, a coreografia de entrada com tempos, como o menu
mobile se comporta no teclado, como cada critério ficou provado e os screenshots por largura.
