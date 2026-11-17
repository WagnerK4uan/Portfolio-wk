import { useEffect, useRef, useState } from "react";
import { useMidia, MOVIMENTO_REDUZIDO, PONTEIRO_FINO } from "../hooks/useMidia";

/* Rótulo que acompanha o cursor sobre os projetos ([data-cursor]): "ver código" ou "repositório privado".
   O cursor do sistema continua; a pílula vai ao lado dele. Só com mouse e sem movimento reduzido. */
export default function CursorRotulo() {
  const ponteiroFino = useMidia(PONTEIRO_FINO);
  const reduzido = useMidia(MOVIMENTO_REDUZIDO);
  const pilula = useRef(null);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (!ponteiroFino || reduzido) return;
    let quadro = 0;
    let x = 0;
    let y = 0;
    const desenhar = () => {
      quadro = 0;
      if (pilula.current) pilula.current.style.transform = `translate3d(${x + 18}px, ${y + 18}px, 0)`;
    };
    const mover = (evento) => {
      x = evento.clientX;
      y = evento.clientY;
      const alvo = evento.target instanceof Element ? evento.target.closest("[data-cursor]") : null;
      setTexto(alvo ? alvo.getAttribute("data-cursor") : "");
      if (!quadro) quadro = requestAnimationFrame(desenhar);
    };
    const sair = () => setTexto("");
    /* ao rolar sem mexer o mouse o rótulo some; volta no próximo movimento */
    window.addEventListener("scroll", sair, { passive: true });
    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("scroll", sair);
      document.documentElement.removeEventListener("pointerleave", sair);
      cancelAnimationFrame(quadro);
    };
  }, [ponteiroFino, reduzido]);

  if (!ponteiroFino || reduzido) return null;
  return (
    <span ref={pilula} className={"cursor-rotulo" + (texto ? " is-visivel" : "")} aria-hidden="true">
      {texto}
    </span>
  );
}
