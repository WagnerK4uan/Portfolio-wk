# Spec 8 — Acabamento, auditoria e documentação

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: Spec 7

Objetivo: com todas as seções e o movimento prontos, falta garantir que a versão nova é melhor que a
`master` em tudo o que importa para o visitante (velocidade no celular, acessibilidade,
compartilhamento no LinkedIn) e deixar o novo sistema documentado. Hoje o `index.html` não tem
`<meta name="description">` nem Open Graph, `public/img/` guarda arquivos que o site não usa
(`background-white.png`, `wk.jpg`, GIFs com versão webp) e o `DESIGN.md` descreve o visual claro.
Esta spec roda `impeccable audit` e `polish`, o revisor final do impeccable e o benchmark, corrige o
que eles apontarem dentro do escopo e documenta o resultado para o Wagner decidir o merge.

## Critérios de aceite

- **CA-8.1 — Link bonito ao compartilhar**
  - **Dado** o `dist/index.html`
  - **Quando** o teste ler o `<head>`
  - **Então** existem `meta description`, `og:title`, `og:description`, `og:image` (imagem
    1200×630 em `public/img/og.png`), `og:url` e `twitter:card`, todos sem travessão
- **CA-8.2 — Carregamento leve**
  - **Dado** o build servido por `vite preview`
  - **Quando** o `/benchmark` medir a página em perfil mobile
  - **Então** o peso transferido até o primeiro carregamento completo é ≤ 1 MB, o LCP ≤ 2,5 s e o
    CLS ≤ 0,1, e os números da `master` ficam registrados ao lado para comparação
- **CA-8.3 — Acessibilidade comprovada**
  - **Dado** a página nas larguras 375 e 1440 px
  - **Quando** rodar Lighthouse (acessibilidade) e `impeccable audit`
  - **Então** a nota de acessibilidade é ≥ 95 e não sobra achado crítico ou alto do audit
- **CA-8.4 — Sem arquivo morto no build**
  - **Dado** a pasta `dist/img/`
  - **Quando** o teste comparar os arquivos com as referências do HTML e dos dados
  - **Então** todo arquivo é referenciado (os não usados saíram de `public/img/`)
- **CA-8.5 — Sistema documentado**
  - **Dado** o `DESIGN.md` e `.impeccable/design.json`
  - **Quando** o teste ler o frontmatter do `DESIGN.md`
  - **Então** as cores listadas são as de `src/styles/tokens.css` e o `README.md` descreve Vite,
    `npm run dev`, `npm run build` e `npm test`

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-8.1 e CA-8.4; ambos falham no
   estado atual. Medir a `master` com `/benchmark` e guardar os números.
2. **`impeccable audit` e `polish`** sobre o site inteiro; corrigir os achados dentro do escopo das
   Specs 2 a 7. Achado fora disso vira spec nova por `/criar-spec`.
3. **Revisor final.** Rodar o agente `impeccable-finish-reviewer` contra a direção de P-2.1 e
   aplicar as correções materiais.
4. **Meta tags e imagem OG.** Gerar `public/img/og.png` a partir do hero (screenshot 1200×630 via
   `/browse`), revisar `favicon.png`.
5. **Limpeza de imagens** em `public/img/`: remover o que nenhuma página ou dado referencia.
6. **Documentação.** `DESIGN.md` e `.impeccable/design.json` gerados pelo agente
   `impeccable-documenter` a partir do que foi entregue; `README.md` atualizado (tecnologias deste
   site, estrutura de pastas, como rodar). Os textos seguem as regras do `CLAUDE.md`.
7. **Não é escopo.** Merge na `master`, mudar domínio ou configuração da Vercel, versão em inglês.
8. **Validar.** `npm run build` e `npm test` verdes, `tests/acabamento.test.js` com CA-8.1,
   CA-8.4 e CA-8.5; CA-8.2 e CA-8.3 provados pelos relatórios do `/benchmark`, Lighthouse e
   audit anexados ao resumo. Comparativo lado a lado `master` × `redesign/escuro` em screenshots de
   375 e 1440 px.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-8.1 | A URL pública usada no `og:url` continua `https://portfolio-wk.vercel.app`. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-8.1 | Depois de ver o comparativo, o Wagner quer mesclar o redesign na `master`? (a resposta não bloqueia o arquivamento desta spec, só registra a decisão) | aberta | — |

Ao final, resuma os achados do audit e do revisor e o que foi corrigido, a tabela de métricas
`master` × redesign, os arquivos removidos, como cada critério ficou provado e a recomendação de
merge.
