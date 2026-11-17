import { useEffect, useState } from "react";

/* Link da seção visível fica marcado na navegação (IntersectionObserver na faixa central da tela) */
export function useSecaoAtiva(ids) {
  const [ativa, setAtiva] = useState(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) setAtiva(entrada.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observador.observe(el);
    });
    return () => observador.disconnect();
  }, [ids]);
  return ativa;
}
