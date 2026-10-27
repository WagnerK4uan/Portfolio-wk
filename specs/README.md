# Portfólio Wagner Kauan — Especificação de Desenvolvimento

Portfólio pessoal de página única do Wagner Kauan, feito para recrutadores e tech leads que avaliam uma vaga Full Stack com viés Cloud/DevOps. O trabalho é organizado em **tasks** — uma pasta por
tema, dona daquele assunto do começo ao fim — e cada task contém as **Specs** que o realizam. As
Specs são executadas **uma por vez**, aguardando a confirmação de conclusão de cada uma antes de
seguir para a próxima.

## Como a fila funciona

A **próxima Spec** é a primeira linha `Pendente` encontrada lendo o índice de tasks abaixo de cima
para baixo e, dentro da task, a tabela **Pendentes** do `README.md` dela. Não é a Spec de menor
número: a ordem da fila é a ordem das tabelas. Antes de executar, leia as **Notas e dependências**
do README da task e a linha `> Depende de:` da Spec — uma Spec pode depender de outra ainda
pendente, inclusive de outra task, e isso vence a ordem das linhas.

## Como uma task funciona

- A pasta se chama `task-<NNN>-<slug-kebab>` — número de três dígitos e slug curto, sem espaços.
- Cada task tem um `README.md` (introdução, tabela **Pendentes**, tabela **Concluídas** e notas de
  dependência) e uma subpasta `concluidas/`.
- A Spec pendente fica na raiz da task; ao ser concluída, muda a linha de situação e é movida para
  a `concluidas/` **da própria task** — o histórico do tema nunca sai de perto dele.
- **Uma Spec pertence a exatamente uma task.** Quando um tema transversal e um módulo disputam a
  mesma Spec, vence o transversal se ela muda a regra para o sistema inteiro, e vence o módulo se
  ela só mexe nele.
- A numeração das Specs é **global, única e crescente** — a task organiza, não renumera. O próximo
  número livre é o maior encontrado em `task-*/` e `task-*/concluidas/`, mais um.
- Task nova nasce com `README.md` e `concluidas/`, e entra no índice abaixo na posição em que deve
  ser executada.

As contagens abaixo são mantidas por `sdd.sh` (`recontar` as corrige a partir dos arquivos).

## Tasks

| Task | Pasta | Pendentes | Concluídas |
|---|---|---|---|
| Task 001 — Redesign escuro do portfólio | [task-001-redesign-escuro/](task-001-redesign-escuro/README.md) | 2 | 6 |
| **Total** | | **2** | **6** |

---

## Contexto Geral (aplica-se a todas as Specs)

### Ambiente de desenvolvimento
- Fedora Linux, VS Code com Claude Code, Node 24 e npm 11.
- Skills de design do projeto: impeccable (`.claude/skills/impeccable`, hook detector em `.claude/settings.local.json`) e gstack (`/browse`, `/benchmark`).

### Stack técnica
- Hoje, na `master`: HTML, CSS e JS puros (`index.html`, `style.css`, `main.js`), Font Awesome e Google Fonts por CDN, deploy estático na Vercel.
- Na branch `redesign/escuro`: Vite + JS puro, sem framework; build em `dist/`, testes com Vitest.
- Contexto de produto em `PRODUCT.md`; sistema de design em `DESIGN.md` (substituído ao fim da task 001).

### Regras obrigatórias
- As regras invioláveis do repositório estão no `CLAUDE.md`, seção **SDD**, e valem para toda Spec.

### Restrições gerais
- O redesign vive só na branch `redesign/escuro`; nada é mesclado na `master` sem decisão do Wagner.
- Sem backend, formulário de contato com servidor, CMS ou analytics.
- Conteúdo factual vem do site atual e de `PRODUCT.md`; nenhum fato novo sem confirmação.

---

## Fases futuras (fora do escopo desta especificação)

- Versão em inglês: não decidida.
- Páginas de estudo de caso por projeto: só se o redesign for aprovado.
