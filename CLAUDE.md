# CLAUDE.md — Portfólio Wagner Kauan

Guia obrigatório para qualquer agente ou desenvolvedor que trabalhe neste repositório.

## SDD — Spec-Driven Development (sdd-wk)

Este projeto usa o framework **sdd-wk**. O trabalho entra por specs em `specs/` e sai pelas skills;
a configuração do projeto (comandos, camadas, pontos de serialização) mora em `specs/sdd.conf`.

- **Fila:** `specs/README.md` é o índice das tasks na ordem de execução, mais o Contexto Geral. Cada
  `specs/task-<NNN>-<slug>/` tem `README.md` (Pendentes, Concluídas, Notas e dependências) e
  `concluidas/`. A numeração das specs é global e crescente.
- **Skills:** `/criar-spec` (só escreve `.md`), `/executar-spec`, `/executar-task`,
  `/executar-specs-paralelo`, `/orquestrar-maestri`, `/sdd-status`.
  Motor: `~/.claude/sdd-wk/bin/sdd.sh`.

### Regras invioláveis

1. **Commits são do usuário — sempre.** O agente nunca executa `git commit`, `git push`, `git tag`,
   `git add` na árvore real nem nada que altere o histórico, mesmo que peçam "commita aí". Ao fim de
   cada entrega ele oferece o bloco pronto: `git add` com a lista explícita dos arquivos (nunca
   `git add -A` ou `.`) e `git commit -m` no padrão Conventional Commits
   (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `build`, `ci`, `style`),
   sem escopo entre parênteses (`feat: descrição`, nunca `feat(api): ...`) —
   gerado por `sdd.sh sugerir-commit` ou `sdd.sh commits`.
2. **Só o que a spec pede.** Melhoria encontrada fora do escopo vira spec nova por `/criar-spec`,
   nunca implementação "aproveitando a viagem".
3. **Código limpo e reaproveitado.** Nomes descritivos, funções coesas, sem duplicação; procurar o
   que já existe antes de criar.
4. **Segredos nunca versionados.** Credencial (senha, token, chave de API, string de conexão,
   certificado) vem de variável de ambiente ou de arquivo listado no `.gitignore` — `.env`,
   `.env.*`, chaves (`*.pem`, `*.key`), configs locais. Esses arquivos **nunca** entram num
   `git add`; o `.env.example` versionado leva só nomes de variáveis e valores fictícios. Valor real
   de segredo nunca é escrito em código, teste, fixture, exemplo, log ou documentação. Arquivo
   sensível fora do `.gitignore` faz `sdd.sh sugerir-commit`/`commits` recusar o bloco.
5. **Teste não se enfraquece para passar.** Nunca pular, apagar ou afrouxar teste para o build ficar
   verde; falha pré-existente é declarada como tal.
6. **Pronto é veredito da máquina.** Spec só é arquivada com build e testes verdes, cada critério de
   aceite citado por um teste e nenhuma suposição ou pergunta em aberto (`sdd.sh arquivar` confere).
7. **Texto do site.** pt-BR, primeira pessoa, tom profissional, sem clichês ("apaixonado", "ninja",
   "revolucionário"). Nunca usar travessão (— ou –): usar vírgula, dois pontos ou ponto médio (·).
8. **Nada de afirmação não verificável.** Só fatos que constam em `PRODUCT.md` ou no site atual. O
   ForjaSys não está em produção; não há métricas, depoimentos ou certificações para citar.
9. **Movimento com fallback.** Toda animação usa `transform`/`opacity` e tem versão estática sob
   `prefers-reduced-motion: reduce`. O conteúdo fica legível sem JavaScript.
10. **Acessibilidade WCAG 2.1 AA.** Contraste, navegação por teclado, foco visível e `alt` em toda
    imagem são critério de aceite implícito de toda spec de interface.
11. **Mensagem de commit:** tipo Conventional Commits + assunto em pt-BR no particípio
    (`feat: Adicionada a base com Vite`), sem corpo e sem linha de co-autor.

### Painel de agentes

Trabalho de execução não é feito à mão pela sessão: passa pelos agentes abaixo, invocados pelo
Agent tool. O escopo de arquivos de cada implementador é a camada dele em `specs/sdd.conf`.

| Agente | Escopo de arquivos | Papel |
|---|---|---|
| `sdd-frontend` | camada `frontend`: `index.html`, `src/*`, `public/*`, `tests/*`, `scripts/*`, `vite.config.js`, `package.json`, `package-lock.json`, `README.md`, `DESIGN.md`, `.impeccable/design.json` | implementa |
| `sdd-qa` | build, testes, aderência à spec, critérios de aceite | só relata |
| `sdd-seguranca` | segredos, autorização, injeção, integridade de dados, dependências | só relata |

- **Implementador nunca escreve fora da sua camada.** Precisou de algo de outra camada? Para e
  relata a assinatura que falta.
- **Implementadores rodam em série** sobre a mesma árvore; **revisores rodam em paralelo** e nunca
  alteram arquivo.
- Achado dentro do escopo da spec é corrigido pela sessão; achado fora do escopo vira spec nova por
  `/criar-spec`, nunca arquivo criado à mão.
- Agente novo nasce em `.claude/agents/` e entra nesta tabela e em `specs/sdd.conf` — o que não está
  registrado não existe para as skills.
