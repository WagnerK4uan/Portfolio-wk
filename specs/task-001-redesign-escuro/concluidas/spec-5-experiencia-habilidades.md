# Spec 5 — Experiência, formação e habilidades

> Situação: ✅ Concluída. Ver [Contexto Geral](../../README.md).
> Depende de: Spec 3

Objetivo: no site atual a experiência aparece misturada aos destaques (`.about-highlights`, sete
`.highlight-item`) e as habilidades são 25 ícones numa grade única (`.skills-grid`), o que obriga o
recrutador a garimpar. PRODUCT.md › Principles 2 pede as duas frentes da Bruning como âncora. Esta
spec desenha a seção `#experiencia` (Bruning com web e dados juntos, formação, direção Cloud/DevOps
em andamento) e a `#habilidades` agrupada por área, ambas na direção escura da Spec 2.

## Critérios de aceite

- **CA-5.1 — Bruning com as duas frentes juntas**
  - **Dado** a seção `#experiencia`
  - **Quando** o teste ler o primeiro item
  - **Então** ele cita Bruning Sistemas, "desenvolvimento web" com Laravel e Nuxt.js e "migração,
    integração e importação de dados" no mesmo bloco, marcado como atual
- **CA-5.2 — Formação e direção em andamento**
  - **Dado** a seção `#experiencia`
  - **Quando** o teste ler os itens
  - **Então** aparecem Engenharia de Software na UNISATC (em andamento), técnico em ADS no SENAI
    Tubarão e a transição para Cloud/DevOps descrita como estudo em andamento, sem cargo de DevOps
- **CA-5.3 — Habilidades agrupadas e lidas por leitor de tela**
  - **Dado** a seção `#habilidades`
  - **Quando** o teste percorrer os grupos
  - **Então** cada grupo é uma lista (`<ul>`) com título (`<h3>`), cada item tem o nome em texto e o
    ícone com `alt=""` ou `aria-hidden="true"`, e a soma dos itens é 25
- **CA-5.4 — Layout sem quebra de 320 a 1440 px**
  - **Dado** larguras de 320, 768 e 1440 px
  - **Quando** abrir as duas seções
  - **Então** não há rolagem horizontal e nenhum nome de habilidade é cortado (`scrollWidth <=
    clientWidth` em cada item)

## Passos

1. **Confirmar o comportamento atual antes de mudar.** Escrever CA-5.1 e CA-5.3; falham enquanto
   a Spec 3 deixou só o esqueleto sem o desenho de lista e grupos.
2. **Ler o craft-floor** do impeccable e a direção de P-2.1 antes de editar.
3. **Experiência** em `src/data/experiencia.js` (empresa ou instituição, papel, período quando
   conhecido, descrição curta, tecnologias) renderizada por `src/render/experiencia.js` no mesmo
   plugin da Spec 3. Desenho em linha do tempo vertical ou blocos, conforme a direção.
4. **Habilidades** com o desenho por grupo: título do grupo, itens com ícone de `public/img/skills/`
   (ou Font Awesome onde não há SVG: APIs REST, SQL, Responsive Design), destaque discreto para a
   stack do trabalho atual (Laravel, Nuxt.js, SQL). Decisão: sem barra de nível ou porcentagem, que
   seriam afirmação não verificável.
5. **Estilos** em `src/styles/experiencia.css` e `src/styles/habilidades.css`, só com tokens.
6. **Testes** em `tests/experiencia.test.js` e `tests/habilidades.test.js` (CA-5.1 a CA-5.3) e
   roteiro `/browse` para CA-5.4.
7. **Não é escopo.** Projetos (Spec 6); revelação escalonada ao rolar (Spec 7); datas que o Wagner
   não confirmou.
8. **Validar.** `npm run build` e `npm test` verdes, testes CA-5.1 a CA-5.4. `/browse` em 320,
   768 e 1440 px.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| S-5.1 | Períodos exatos (mês/ano de entrada na Bruning, conclusão do SENAI) não estão no repositório; sem eles a experiência mostra só "atual" e "em andamento". | invalidada | O Wagner informou os períodos (P-5.1, 2026-10-25); a experiência mostra as datas. |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| P-5.1 | O Wagner quer informar os períodos (ano de início na Bruning, ano de conclusão do técnico) para a linha do tempo? | respondida | Sim (Wagner, 2026-10-25): Bruning Sistemas como estagiário desde 2024 e em tempo integral desde 2025, atual; técnico em ADS no SENAI Tubarão de 2023 a 2024; Engenharia de Software na UNISATC desde 2026, em andamento. |

Ao final, resuma o desenho das duas seções, o formato de `experiencia.js`, os grupos de
habilidades, como cada critério ficou provado e os screenshots por largura.
