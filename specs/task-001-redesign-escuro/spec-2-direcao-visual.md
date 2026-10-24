# Spec 2 — Direção visual escura e tokens de design

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: Spec 1

Objetivo: o visual atual é claro (`--bg-white: #ffffff`, `--bg-alt: #f8fafc` em
`src/styles/main.css`, vindo do antigo `style.css`) e o Wagner enjoou dele. O redesign pede fundo
escuro com o violeta como marca, mais movimento e leitura mais rápida. Antes de redesenhar seções,
é preciso escolher um mundo visual e fixá-lo em tokens, para que as Specs 4 a 7 tenham uma única
fonte de cor, tipo, espaço e movimento. A escolha é do Wagner, a partir de propostas renderizadas.

## Critérios de aceite

- **CA-2.1 — O Wagner escolhe a direção entre propostas reais**
  - **Dado** 2 ou 3 direções escuras com violeta geradas pelo fluxo new-work do impeccable
  - **Quando** ele abrir as amostras renderizadas (uma página de prova por direção, com hero, um
    card de projeto, botão e bloco de texto)
  - **Então** a direção escolhida e o motivo ficam registrados na resposta de P-2.1
- **CA-2.2 — Uma fonte única de tokens**
  - **Dado** o arquivo `src/styles/tokens.css`
  - **Quando** o teste ler as custom properties de `:root`
  - **Então** existem os grupos cor (fundo, superfícies em 3 níveis, texto forte, texto suave,
    borda, violeta de marca, violeta de ação, foco), tipografia (famílias e escala), espaço, raio e
    movimento (durações e curvas), e nenhuma cor hexadecimal ou `oklch(` aparece fora de
    `tokens.css` nos outros arquivos de `src/styles/`
- **CA-2.3 — Contraste AA garantido**
  - **Dado** os pares de token texto/fundo usados (texto forte e suave sobre fundo e sobre cada
    superfície, texto do botão sobre violeta de ação)
  - **Quando** o teste calcular a razão de contraste de cada par
  - **Então** texto normal fica ≥ 4,5:1 e texto grande/ícone ≥ 3:1
- **CA-2.4 — O site atual já veste o tema escuro**
  - **Dado** o build com os tokens aplicados em `src/styles/main.css`
  - **Quando** abrir a página
  - **Então** o `<body>` usa o fundo escuro do token (`getComputedStyle` no teste) e o `<meta
    name="color-scheme" content="dark">` está no `<head>`

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Teste CA-2.2 escrito primeiro: hoje ele
   falha porque `tokens.css` não existe e há hex espalhado em `src/styles/main.css`.
2. **Rodar o impeccable.** `impeccable context` uma vez; ler `reference/new-work.md` no modo
   **Experience** (portfólio) e tratar o visual atual como evidência e anti-referência, mantendo o
   violeta. Gerar as 2 ou 3 direções como páginas de prova em `.gstack/direcoes/` (fora do build) e
   mostrar ao Wagner com `/browse`.
3. **Registrar a escolha** em P-2.1 e decidir a tipografia (Poppins pode sair; se sair, a fonte
   nova vem por `@fontsource/*` no `package.json` ou Google Fonts com `display=swap`, decisão
   registrada aqui).
4. **Criar `src/styles/tokens.css`** com cores em `oklch()`, escala tipográfica fluida
   (`clamp()`), espaço em escala, raios, durações e curvas (reaproveitar `--ease-out:
   cubic-bezier(0.16, 1, 0.3, 1)` se a direção não pedir outra). Importar antes de `main.css`.
5. **Trocar as cores literais de `main.css`** pelos tokens, só o suficiente para o site atual ficar
   escuro e legível, sem refazer layout (as seções são refeitas nas Specs 4 a 6). Adicionar
   `<meta name="color-scheme" content="dark">`.
6. **Escrever `tests/tokens.test.js`** (CA-2.2, CA-2.3 com cálculo de contraste a partir de
   oklch convertido para sRGB) e acrescentar CA-2.4 aos testes de HTML.
7. **Não é escopo.** Nova estrutura de seções e texto (Spec 3); componentes redesenhados (Specs 4 a
   6); animações novas (Spec 7); `DESIGN.md` novo (Spec 8, gerado do que foi entregue). Tema claro
   alternativo não será feito.
8. **Validar.** `npm run build` e `npm test` verdes, testes CA-2.1 (checagem de que P-2.1 está
   respondida não é automatizável: provar com o registro na spec), CA-2.2, CA-2.3 e CA-2.4.
   `/browse` em 1440 e 375 px mostrando o site atual no tema escuro.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-2.1 | Só tema escuro: não haverá alternância para claro nem leitura de `prefers-color-scheme`. | aberta | — |
| S-2.2 | O violeta atual (`#6c63ff`) é o ponto de partida do violeta de marca, podendo ser ajustado em luminosidade para dar contraste no escuro. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-2.1 | Qual das direções propostas o Wagner escolhe, e com qual fonte? | aberta | — |
| P-2.2 | Qual base de cor para o redesign? | respondida | Escuro com violeta como marca (Wagner, 2026-10-24). |

Ao final, resuma as direções propostas, a escolhida e por quê, a lista de tokens criada, os pares de
contraste medidos, como cada critério ficou provado e o que ficou para as próximas specs.
