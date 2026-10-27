/**
 * Linha do tempo de #experiencia: trabalho, estudo e formação, na ordem da página.
 * O primeiro item é a Bruning Sistemas, âncora da experiência (PRODUCT.md, Principles 2).
 * Só fatos de PRODUCT.md, do site atual e dos períodos informados pelo Wagner (P-5.1).
 *
 * Formato de cada item:
 *   organizacao   empresa ou instituição (opcional); quando existe, é o título do item
 *   papel         cargo, curso ou frente de estudo; vira o título quando não há organização
 *   periodo       { inicio?, fim?, situacao? } com anos inteiros; situacao é "atual" ou
 *                 "em andamento". Sem período confirmado, o campo fica de fora
 *   marcos        lista opcional de { rotulo, ano }, para mudanças dentro do mesmo período
 *   frentes       lista opcional de frentes de trabalho, todas no mesmo bloco
 *   descricao     texto curto opcional
 *   tecnologias   lista opcional de tecnologias
 */
export const experiencia = [
  {
    organizacao: "Bruning Sistemas",
    papel: "Desenvolvedor Web e Migração de Dados",
    periodo: { inicio: 2024, situacao: "atual" },
    marcos: [
      { rotulo: "Estagiário desde", ano: 2024 },
      { rotulo: "em tempo integral desde", ano: 2025 },
    ],
    frentes: [
      "Desenvolvimento web com Laravel no back‑end e Nuxt.js no front‑end.",
      "Migração, integração e importação de dados entre sistemas, com dados reais de clientes.",
    ],
    tecnologias: ["Laravel", "Nuxt.js", "SQL"],
  },
  {
    papel: "Transição para Cloud Engineering, com objetivo em DevOps",
    periodo: { situacao: "em andamento" },
    descricao: "Estudo em andamento: uso Linux (Fedora) no dia a dia e estudo AWS e redes.",
    tecnologias: ["Linux", "AWS", "Redes"],
  },
  {
    organizacao: "UNISATC",
    papel: "Engenharia de Software",
    periodo: { inicio: 2026, situacao: "em andamento" },
  },
  {
    organizacao: "SENAI Tubarão",
    papel: "Técnico em Análise e Desenvolvimento de Sistemas",
    periodo: { inicio: 2023, fim: 2024 },
    descricao: "No curso técnico descobri que gosto de programar e de resolver problemas.",
  },
  {
    papel: "Cursos complementares",
    descricao: "Redes (Google, pela Coursera), AWS e Alura.",
  },
];
