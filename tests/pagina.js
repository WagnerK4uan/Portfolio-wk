import { vi } from "vitest";
import { lerIndexDist } from "./dist.js";

/**
 * Monta o dist/index.html no document do jsdom, para os scripts da página rodarem sobre a marcação
 * real do build. Os <script> não são executados: cada teste importa e inicia o módulo que testa.
 */
export function montarPaginaDoDist() {
  const html = lerIndexDist();
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script").forEach((script) => script.remove());
  document.documentElement.className = "js";
  document.head.innerHTML = "";
  document.body.innerHTML = doc.body.innerHTML;
}

/**
 * IntersectionObserver simulado: guarda cada instância com o callback e os alvos observados, e
 * deixa o teste disparar a interseção à mão, sem depender de layout (o jsdom não mede).
 */
export function simularIntersectionObserver() {
  const instancias = [];

  class IntersectionObserverSimulado {
    constructor(callback, opcoes = {}) {
      this.callback = callback;
      this.opcoes = opcoes;
      this.alvos = [];
      instancias.push(this);
    }
    observe(alvo) {
      this.alvos.push(alvo);
    }
    unobserve(alvo) {
      this.alvos = this.alvos.filter((el) => el !== alvo);
    }
    disconnect() {
      this.alvos = [];
    }
    disparar(alvo, isIntersecting) {
      this.callback([{ target: alvo, isIntersecting }], this);
    }
  }

  vi.stubGlobal("IntersectionObserver", IntersectionObserverSimulado);

  return {
    instancias,
    /** A instância que observa este elemento (ou um descendente dele). */
    queObserva(elemento) {
      return instancias.find((io) => io.alvos.some((alvo) => elemento === alvo || elemento.contains(alvo)));
    },
  };
}
