import { useEffect, useState } from "react";

/* Lê uma media query e acompanha a mudança com a página aberta. Começa sempre em false para o HTML
   pré-renderizado e a primeira renderização do cliente serem iguais (hidratação sem divergência). */
export function useMidia(consulta) {
  const [atende, setAtende] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const mudar = () => setAtende(mq.matches);
    mudar();
    mq.addEventListener("change", mudar);
    return () => mq.removeEventListener("change", mudar);
  }, [consulta]);
  return atende;
}

/* Verdadeiro depois que o componente montou no navegador */
export function useMontado() {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  return montado;
}

export const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";
export const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";
