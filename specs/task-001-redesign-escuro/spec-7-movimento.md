# Spec 7 — Sistema de movimento

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: Spec 4, Spec 5, Spec 6

Objetivo: o Wagner pediu um portfólio mais animado, num nível "marcante, mas leve". Hoje o
movimento é a revelação ao rolar de `src/main.js` (classes `reveal` e `is-in`, listas com atraso
limitado em `step`/`max`) e a entrada do hero. Com as seções novas prontas, esta spec unifica o
movimento num sistema com tokens de duração e curva (Spec 2), acrescenta microinterações e um brilho
que segue o ponteiro, sem custo perceptível no celular e com fallback completo para movimento
reduzido. Roda pelo comando `animate` do impeccable.

## Critérios de aceite

- **CA-7.1 — Seções e listas entram ao rolar, em sequência**
  - **Dado** a página carregada no topo
  - **Quando** uma seção entra na vista
  - **Então** o título e os itens da seção recebem `is-in` em sequência, com o atraso do último item
    da lista ≤ 400 ms (atraso via `--delay` calculado em `src/scripts/revelar.js`)
- **CA-7.2 — Conteúdo nunca fica escondido**
  - **Dado** o JavaScript desligado, ou o navegador sem `IntersectionObserver`
  - **Quando** abrir a página
  - **Então** todo o conteúdo fica visível (a classe `js` é removida ou nunca adicionada e nenhum
    seletor esconde conteúdo sem ela)
- **CA-7.3 — Brilho que segue o ponteiro só onde faz sentido**
  - **Dado** um dispositivo com `(hover: hover) and (pointer: fine)` e sem movimento reduzido
  - **Quando** o ponteiro se mover sobre o hero ou um card de projeto
  - **Então** as variáveis `--mx` e `--my` do elemento são atualizadas no máximo uma vez por quadro
    (`requestAnimationFrame`), e em toque ou movimento reduzido o listener nem é registrado
- **CA-7.4 — Movimento reduzido desliga deslocamentos**
  - **Dado** `prefers-reduced-motion: reduce`
  - **Quando** a página for usada do topo ao fim
  - **Então** nenhuma animação ou transição usa `transform` além de 0; só `opacity` com até 200 ms
- **CA-7.5 — Só propriedades baratas animadas**
  - **Dado** os arquivos de `src/styles/`
  - **Quando** o teste ler as regras `transition` e `@keyframes`
  - **Então** as propriedades animadas são apenas `opacity`, `transform`, `filter` em elemento
    isolado ou custom properties registradas, nunca `width`, `height`, `top`, `left` ou `margin`

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-7.2 contra o código atual
   (deve passar, é proteção) e CA-7.3 (falha: não existe brilho que segue o ponteiro).
2. **Rodar `impeccable animate`** (`.claude/skills/impeccable/reference/animate.md`) e ler o
   craft-floor antes de editar.
3. **Extrair a revelação** de `src/main.js` para `src/scripts/revelar.js`, mantendo a lógica atual
   (seletores por lista, `step`, `max`, `unobserve` após entrar) e estendendo às seções novas.
4. **Microinterações** em botões, links do menu, tags e cards: estados hover, focus e active com
   duração e curva dos tokens.
5. **Brilho do ponteiro** em `src/scripts/brilho.js` com `matchMedia` para hover fino e movimento
   reduzido, `pointermove` passivo e `requestAnimationFrame`.
6. **Testes** em `tests/movimento.test.js` (CA-7.1 a CA-7.5; CA-7.5 lê os CSS como texto).
7. **Não é escopo.** Parallax, scroll-jacking, texto que se monta letra a letra, bibliotecas de
   animação (GSAP, Lenis); o nível escolhido foi "marcante, mas leve".
8. **Validar.** `npm run build` e `npm test` verdes, testes CA-7.1 a CA-7.5. `/browse` rolando a
   página inteira em 375 e 1440 px, com e sem movimento reduzido, e checagem de que o painel de
   desempenho não mostra tarefa longa (> 50 ms) causada pelos scripts de movimento.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-7.1 | Nenhuma biblioteca de animação é necessária; CSS + `IntersectionObserver` + `requestAnimationFrame` bastam. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-7.1 | Qual intensidade de animação? | respondida | Marcante, mas leve (Wagner, 2026-10-24). |

Ao final, resuma o sistema de movimento (tokens, coreografias, microinterações), o que foi
reaproveitado de `src/main.js`, como cada critério ficou provado e as medições de desempenho.
