// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { raizDoProjeto } from "./dist.js";

const pastaTask = path.join(raizDoProjeto, "specs", "task-001-redesign-escuro");
const nomeSpec = "spec-2-direcao-visual.md";

function lerSpecDaDirecao() {
  const caminho = [path.join(pastaTask, nomeSpec), path.join(pastaTask, "concluidas", nomeSpec)].find(existsSync);
  expect(caminho, "a Spec 2 existe na task ou em concluidas/").toBeDefined();
  return readFileSync(caminho, "utf8");
}

describe("direção visual", () => {
  it("CA-2.1 · a direção escolhida pelo Wagner e o motivo estão registrados em P-2.1", () => {
    const linha = lerSpecDaDirecao()
      .split("\n")
      .find((texto) => texto.startsWith("| P-2.1 |"));

    expect(linha, "a linha de P-2.1 existe").toBeDefined();
    expect(linha).toMatch(/\| respondida \|/);
    expect(linha).toMatch(/Direção C · De-para/);
    expect(linha).toMatch(/Bricolage Grotesque/);
  });
});
