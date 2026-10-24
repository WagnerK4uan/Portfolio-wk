# Spec 3 — Estrutura das seções e texto objetivo

> Situação: Pendente. Ver [Contexto Geral](../README.md).
> Depende de: Spec 2

Objetivo: o `index.html` atual tem um "Sobre" de seis parágrafos, sete destaques repetindo a stack,
25 habilidades numa grade única sem agrupamento e o contato só no rodapé. Recrutador decide em
poucos minutos (PRODUCT.md › Users), então a página precisa dizer cargo, stack e forma de contato
no primeiro viewport e deixar a profundidade para quem rola. Esta spec define a nova arquitetura de
informação, enxuga o texto **sem fato novo** e tira os dados repetitivos do HTML para arquivos de
dados, que o build transforma em HTML estático (o conteúdo continua legível sem JavaScript).

## Critérios de aceite

- **CA-3.1 — Ordem das seções**
  - **Dado** o `dist/index.html`
  - **Quando** o teste listar as `<section>` de `<main>` em ordem
  - **Então** os ids são `home`, `sobre`, `experiencia`, `habilidades`, `projetos`, `contato`, e a
    navegação tem um link para cada um, exceto `home` (o logo leva ao topo)
- **CA-3.2 — Primeiro viewport responde quem, o quê e como falar**
  - **Dado** a seção `#home`
  - **Quando** o teste ler o texto dela
  - **Então** ela contém "Wagner Kauan", o cargo atual na Bruning Sistemas, um link para `#projetos`
    e um link para `#contato`
- **CA-3.3 — Projetos e habilidades vêm dos arquivos de dados**
  - **Dado** `src/data/projetos.js` (5 projetos) e `src/data/habilidades.js` (grupos front-end,
    back-end, dados, cloud e infra, IA, ferramentas)
  - **Quando** rodar o build
  - **Então** o HTML tem um `<article>` por projeto com o mesmo título, descrição, tags e link do
    arquivo, e um grupo com título por área contendo exatamente os itens do arquivo (o teste importa
    os dados e compara com o DOM)
- **CA-3.4 — Nenhum fato perdido ou inventado**
  - **Dado** a lista de fatos do site atual (empresa, duas frentes na Bruning, formações UNISATC e
    SENAI Tubarão, 5 projetos, 25 habilidades, 4 contatos)
  - **Quando** o teste procurar cada fato no `dist/index.html`
  - **Então** todos aparecem e o texto do ForjaSys diz que está em desenvolvimento (não contém "em
    produção")
- **CA-3.5 — Texto mais curto**
  - **Dado** o texto da seção `#sobre`
  - **Quando** o teste contar as palavras
  - **Então** são no máximo 120 (hoje o "Sobre" tem perto de 350)

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-3.1 e CA-3.3 primeiro;
   ambos falham no HTML atual (não há `#experiencia`, `#contato` nem dados em `src/data/`).
2. **Extrair os dados.** `src/data/projetos.js` (título, descrição, tags, preview com
   largura/altura/alt, repositório ou `privado: true`), `src/data/habilidades.js` (grupo → itens com
   ícone de `public/img/skills/` ou classe Font Awesome), `src/data/contatos.js` (e-mail, LinkedIn,
   GitHub, Instagram, com os mesmos URLs do HTML atual).
3. **Renderizar no build.** Um plugin local em `vite.config.js` com `transformIndexHtml` troca os
   marcadores `<!-- render:projetos -->`, `<!-- render:habilidades -->` e `<!-- render:contatos -->`
   pelo HTML gerado por funções puras em `src/render/*.js` (testáveis sem build). Decisão: sem
   template engine, só template strings com escape de texto.
4. **Reescrever o texto** em pt-BR, primeira pessoa, sem travessão e sem clichê, a partir do texto
   atual: hero com nome, cargo ("Desenvolvedor Web e Migração de Dados na Bruning Sistemas") e uma
   frase de posicionamento; "Sobre" em até 120 palavras (trajetória, as duas frentes juntas,
   transição para Cloud/DevOps, IA aplicada); "Experiência" com Bruning e formações; "Contato" com
   chamada curta e os 4 canais. O texto proposto é mostrado ao Wagner antes de fechar a spec.
5. **Montar o esqueleto semântico** das seções em `index.html` com os ids de CA-3.1, mantendo o
   skip link e `<main id="conteudo" tabindex="-1">`. Estilo mínimo com os tokens da Spec 2; o
   desenho de cada seção é das Specs 4 a 6.
6. **Ajustar `src/main.js`** para os novos ids (link ativo e revelação já existentes continuam
   funcionando) e atualizar os testes da Spec 1 que citavam `#projects`.
7. **Não é escopo.** Desenho visual de hero, experiência, habilidades e projetos (Specs 4 a 6);
   animações (Spec 7); versão em inglês; página por projeto.
8. **Validar.** `npm run build` e `npm test` verdes, testes CA-3.1 a CA-3.5 passando, testes da
   Spec 1 continuam verdes. `/browse` em 375 px para conferir que o primeiro viewport mostra nome,
   cargo e os dois botões.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-3.1 | O id da seção de projetos muda de `projects` para `projetos`; nenhum link externo depende de `#projects`. | aberta | — |
| S-3.2 | A barra lateral fixa de redes sociais (`.social-icons`) sai; os canais passam a viver na seção `#contato` e no rodapé. | aberta | — |
| S-3.3 | "Reconhecido por ser proativo, dedicado e colaborativo" sai do texto por ser autodescrição sem prova (PRODUCT.md › Principles 1). | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-3.1 | O Instagram continua entre os contatos de um portfólio profissional? | aberta | — |
| P-3.2 | O Wagner aprova o texto novo do hero, do "Sobre" e do contato? | aberta | — |

Ao final, resuma a nova ordem das seções, o texto final de cada uma, o formato dos arquivos de
dados, como o plugin de render funciona, como cada critério ficou provado e o que foi retirado do
texto antigo e por quê.
