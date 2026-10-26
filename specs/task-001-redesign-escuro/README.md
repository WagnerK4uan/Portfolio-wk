# Task 001 — Redesign escuro do portfólio

Dona do redesign experimental do portfólio na branch `redesign/escuro`: troca a base para Vite + JS
puro, escolhe uma direção visual escura com o violeta como marca, reorganiza o conteúdo para leitura
rápida, redesenha cada seção, adiciona um sistema de movimento "marcante, mas leve" e fecha com
auditoria e documentação. Vazia de pendentes, entrega uma versão completa para o Wagner comparar
com a `master` e decidir o merge.

> Contexto Geral do projeto: [../README.md](../README.md).

## Pendentes

| Spec | Arquivo | Situação |
|---|---|---|
| Spec 3 — Estrutura das seções e texto objetivo | [spec-3-estrutura-conteudo.md](spec-3-estrutura-conteudo.md) | Pendente |
| Spec 4 — Hero e navegação | [spec-4-hero-navegacao.md](spec-4-hero-navegacao.md) | Pendente |
| Spec 5 — Experiência, formação e habilidades | [spec-5-experiencia-habilidades.md](spec-5-experiencia-habilidades.md) | Pendente |
| Spec 6 — Seção de projetos | [spec-6-projetos.md](spec-6-projetos.md) | Pendente |
| Spec 7 — Sistema de movimento | [spec-7-movimento.md](spec-7-movimento.md) | Pendente |
| Spec 8 — Acabamento, auditoria e documentação | [spec-8-acabamento.md](spec-8-acabamento.md) | Pendente |

## Concluídas

| Spec | Arquivo | Situação |
|---|---|---|
| Spec 1 — Base do projeto com Vite e testes estáticos | [concluidas/spec-1-base-vite.md](concluidas/spec-1-base-vite.md) | ✅ Concluída |
| Spec 2 — Direção visual escura e tokens de design | [concluidas/spec-2-direcao-visual.md](concluidas/spec-2-direcao-visual.md) | ✅ Concluída |

## Notas e dependências

- **Spec 1** saiu do plano de 2026-10-24 (stack escolhida: Vite + JS puro). Não depende de nada e é
  dona de `package.json`, `package-lock.json` e da mudança `img/` → `public/img/`.
- **Spec 2** depende da 1. É a única que cria `src/styles/tokens.css` (ponto de serialização); as
  seguintes só consomem tokens. Tem uma decisão do Wagner (P-2.1) no meio da execução.
- **Spec 3** depende da 2. Cria `src/data/`, `src/render/` e o plugin de render em `vite.config.js`;
  as Specs 4, 5 e 6 consomem esses arquivos.
- **Specs 4, 5 e 6** dependem só da 3 e mexem em seções diferentes de `index.html`. Podem rodar em
  paralelo com cuidado: a 5 acrescenta o marcador `render:experiencia` ao plugin em
  `vite.config.js` e a 6 acrescenta `sharp` ao `package.json`; rodar em série é o mais seguro.
- **Spec 7** depende de 4, 5 e 6, porque o movimento se aplica às seções já desenhadas, e extrai a
  revelação de `src/main.js`.
- **Spec 8** depende da 7 e fecha a task com audit, benchmark e documentação.
