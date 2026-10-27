# Spec 8 — Acabamento, auditoria e documentação

> Situação: ✅ Concluída. Ver [Contexto Geral](../../README.md).
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
| S-8.1 | A URL pública usada no `og:url` continua `https://portfolio-wk.vercel.app`. | confirmada | Confirmada pelo Wagner (2026-10-25). |
| S-8.2 | O "perfil mobile do `/benchmark`" do CA-8.2 e a nota do CA-8.3 são medidos pelo Lighthouse direto (mobile 375 com 4G lento simulado e CPU 4x; desktop 1440), mais rigoroso que o `/benchmark`, que mede sem limitar a rede. | confirmada | Confirmada pelo Wagner (2026-10-26). |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-8.1 | Depois de ver o comparativo, o Wagner quer mesclar o redesign na `master`? (a resposta não bloqueia o arquivamento desta spec, só registra a decisão) | respondida | Decisão adiada: o Wagner decide depois de ver o comparativo (2026-10-25). |
| P-8.2 | O revisor final julgou a Direção C cumprida só em parte e pediu 5 correções materiais (títulos de seção, card de projeto, Sobre com frase-tese, "3 de 3 campos mapeados" na ficha do hero, Contato como ficha). Elas entram nesta spec? | respondida | Não: viram specs novas na task 001, por `/criar-spec`, com os textos novos aprovados pelo Wagner antes (2026-10-26). |

Ao final, resuma os achados do audit e do revisor e o que foi corrigido, a tabela de métricas
`master` × redesign, os arquivos removidos, como cada critério ficou provado e a recomendação de
merge.

## Resultados da execução

Lighthouse 13.5.0 sobre `vite preview`, conferido pelo validador na árvore principal (2026-10-26). A
`master` foi extraída por `git archive` e servida como site estático.

| Medida | `master` | `redesign/escuro` |
|---|---|---|
| Mobile 375 · desempenho | 92 | 98 (3 rodadas) |
| Mobile 375 · acessibilidade | 100 | 100 |
| Mobile 375 · LCP | 2,65 s | 2,26 a 2,34 s |
| Mobile 375 · CLS | 0,0009 | 0 |
| Mobile 375 · peso transferido | 427 KB | 207 KiB |
| Desktop 1440 · desempenho | 96 | 100 |
| Desktop 1440 · acessibilidade | 100 | 100 |
| Desktop 1440 · LCP | 1,34 s | 0,57 s |
| Desktop 1440 · peso transferido | 8,15 MB | 318 KiB |

- O Font Awesome do CDN saiu: os ícones viraram máscaras locais em `src/styles/icones.css`. Com o CDN,
  o LCP mobile ficava em 4,1 s e reprovava o CA-8.2.
- Removidos de `public/img/`: `background-white.png`, `wk.jpg`, `foto-wagner.jpg`, `cookin-up.gif`,
  `forjasys.gif`, `projeto-rh.gif`, `task-manager.gif`. O `xadrez.gif` fica, porque é a única
  origem do preview animado do Xadrez.
- Recomendação técnica: o merge é viável. A decisão é do Wagner (P-8.1).

### Audit e revisor final

Refeitos pelo validador na árvore principal, só leitura, depois das correções do painel (2026-10-26).

- **`impeccable audit`:** 17/20 (a11y 3, desempenho 3, theming 4, responsivo 4, integridade 3), 0 P0,
  0 P1, 3 P2, 5 P3, nenhuma falha de WCAG 2.1 AA. Corrigidos nesta spec: rolagem sob o menu mobile
  aberto, medida das linhas do Sobre e link "Sobre" com menos de 44 px. Ficam sem ação: o piso de
  `--tipo-xs` (aprovado na Spec 2) e a órfã "clientes.", que não se reproduz. O LCP segurado pela
  entrada do hero e o `1.6rem` literal de `main.css` vão para as specs novas da P-8.2.
- **`impeccable-finish-reviewer`** contra a Direção C · De-para: cumprida em parte. A ficha do hero, a
  experiência e o fundo seguem o comp. As 5 correções materiais seguem para specs novas (P-8.2). A
  sombra violeta em repouso no botão primário fica, porque o `DESIGN.md` a canoniza. Seed e comp-diff
  da Spec 2 ficam sem ação.
- **Rodada anterior, pelo executor:** audit sem crítico nem alto, com `.project-link` de 43 px,
  `.skill-nome` em 12,5 px e falta de preload de fonte, todos corrigidos. O revisor apontou o
  "Sobre" ativo ao voltar ao hero (alta), os posters pequenos ou claros e a grade de contato 3+1
  (médias), também corrigidos.

