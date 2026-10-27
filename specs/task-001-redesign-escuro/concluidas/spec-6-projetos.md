# Spec 6 — Seção de projetos

> Situação: ✅ Concluída. Ver [Contexto Geral](../../README.md).
> Depende de: Spec 3

Objetivo: os projetos são a prova mais forte do Wagner (PRODUCT.md › Principles 1), mas hoje são
cinco `.project-card` iguais numa grade, com GIFs pesados carregando todos ao mesmo tempo
(`cookin-up.webp` tem 4,7 MB). Tech lead quer ver stack e abrir o repositório; recrutador quer
entender rápido o que cada um é. Esta spec desenha a seção `#projetos` escura com destaque para os
projetos de mais rigor de engenharia, preview que só anima quando o visitante demonstra interesse e
hover rico, a partir de `src/data/projetos.js` (Spec 3).

## Critérios de aceite

- **CA-6.1 — Cada projeto mostra o essencial**
  - **Dado** a seção `#projetos`
  - **Quando** o teste ler cada `<article>`
  - **Então** ele tem título (`<h3>`), descrição, lista de tags e um link "Repositório" com
    `target="_blank" rel="noopener"`, ou o selo "Repositório privado" sem link no ForjaSys
- **CA-6.2 — Destaque para os projetos de engenharia**
  - **Dado** os dados com `destaque: true` em Task Manager e ForjaSys
  - **Quando** renderizar a seção
  - **Então** esses dois aparecem primeiro, com card maior (classe `project--destaque`), e os outros
    três depois
- **CA-6.3 — Preview leve: estático até haver interesse**
  - **Dado** um card fora de hover e foco
  - **Quando** a página carregar
  - **Então** a imagem mostrada é um quadro estático leve (`poster` em webp ≤ 150 KB) com
    `loading="lazy"`, e o preview animado só é carregado no `pointerenter` ou `focusin` do card, em
    telas com `(hover: hover)`
- **CA-6.4 — Card inteiro acessível pelo teclado**
  - **Dado** a navegação só por teclado
  - **Quando** o foco chegar no link do card
  - **Então** o card mostra o mesmo estado visual do hover e o foco é visível (contorno com o token
    de foco, contraste ≥ 3:1)
- **CA-6.5 — Sem preview animado com movimento reduzido**
  - **Dado** `prefers-reduced-motion: reduce`
  - **Quando** o visitante passar o mouse no card
  - **Então** o preview animado não é carregado e o quadro estático permanece

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-6.3; falha porque hoje todos os
   webp/gif animados entram no HTML.
2. **Ler o craft-floor** do impeccable e a direção de P-2.1.
3. **Gerar os quadros estáticos.** Um script `scripts/posters.mjs` (fora do build, roda à mão) tira
   o primeiro quadro de cada preview animado para `public/img/posters/<projeto>.webp` com `sharp`
   como devDependency. Os arquivos gerados são versionados.
4. **Dados.** Acrescentar a `src/data/projetos.js` os campos `destaque`, `poster` e `animado`.
5. **Render e estilo.** `src/render/projetos.js` com a ordem de CA-6.2; `src/styles/projetos.css`
   com grade de destaque, tags e hover (elevação e brilho de borda só com `transform`, `opacity` e
   `box-shadow` por token).
6. **Troca de preview** em `src/scripts/projetos.js`: no `pointerenter`/`focusin` troca `src` para o
   animado, no `pointerleave`/`focusout` volta ao poster; não roda sem `(hover: hover)` ou com
   movimento reduzido.
7. **Não é escopo.** Página de estudo de caso por projeto; link de demo ao vivo (nenhum projeto tem
   um registrado); revelação ao rolar (Spec 7); apagar os GIFs antigos (Spec 8).
8. **Validar.** `npm run build` e `npm test` verdes, `tests/projetos.test.js` com CA-6.1 a CA-6.5.
   `/browse` em 375 e 1440 px, teclado e movimento reduzido.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-6.1 | Task Manager e ForjaSys são os projetos de destaque, por serem os de mais rigor de engenharia (ArchUnit, Testcontainers, Clean Architecture, cliente real). | confirmada | Confirmada pelo Wagner (2026-10-25). |
| S-6.2 | Os textos dos projetos ficam como estão no site atual, só revisados quanto às regras de texto. | confirmada | Confirmada pelo Wagner (2026-10-25). |

## Perguntas em aberto

Nenhuma.

Ao final, resuma o desenho da seção, a ordem dos projetos, o peso das imagens antes e depois no
carregamento inicial, como cada critério ficou provado e os screenshots.

## Decisões da execução

- O ForjaSys não tem link (CA-6.1), então o foco de teclado não chega ao card dele. O painel julgou
  que a CA-6.4 se cumpre pela redação e que o WCAG 2.1 AA não é violado: o conteúdo fica acessível
  sem foco e o card não é interativo. Ficou sem `tabindex`, para não criar parada de Tab inerte
  (2026-10-26).
- Com JS ativo, a regra `.js .project-card.reveal.is-in` de `src/styles/main.css` vence a transição
  de `src/styles/projetos.css`. Fica para a Spec 7, dona da revelação.
