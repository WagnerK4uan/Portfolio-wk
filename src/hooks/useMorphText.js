/* transitions.dev 33 · Text morph: as letras em comum ficam, só a parte que muda faz o cross-blur
   enquanto a largura dela acompanha o texto novo. Orquestração copiada do snippet da skill. */
const ms = (nome) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(nome)) || 0;

export function morphText(el, next) {
  const prev = el.dataset.text ?? el.textContent;
  if (prev === next) return;
  el.dataset.text = next;
  clearTimeout(el._morphTimer);

  let a = 0;
  while (a < prev.length && a < next.length && prev[a] === next[a]) a++;
  let b = 0;
  while (b < prev.length - a && b < next.length - a && prev[prev.length - 1 - b] === next[next.length - 1 - b]) b++;

  const swap = document.createElement("span");
  swap.className = "t-morph-swap";
  const out = document.createElement("span");
  out.className = "t-morph-old";
  out.setAttribute("aria-hidden", "true");
  out.textContent = prev.slice(a, prev.length - b);
  const inn = document.createElement("span");
  inn.className = "t-morph-new";
  inn.textContent = next.slice(a, next.length - b);
  swap.append(out, inn);

  el.textContent = "";
  el.append(next.slice(0, a), swap, next.slice(next.length - b));

  swap.style.width = out.getBoundingClientRect().width + "px";
  void swap.offsetWidth;
  swap.classList.add("is-morphing");
  swap.style.width = inn.getBoundingClientRect().width + "px";

  el._morphTimer = setTimeout(() => {
    el.textContent = next;
  }, Math.max(ms("--text-morph-dur"), ms("--text-morph-resize-dur")) + 40);
}
