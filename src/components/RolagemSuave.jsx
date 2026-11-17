import { useEffect } from "react";

/* Rolagem suave para os links internos (navegação, logo, botões do hero, menu do celular): curva ease-in-out
   com duração pela distância (450 a 1000 ms) e, na chegada, um traço violeta que se desenha sob o título da
   seção (.is-chegada em global.css). O foco vai para a seção, para o leitor de tela e o Tab seguirem dali.
   Com movimento reduzido o navegador faz o pulo normal. O link de pular para o conteúdo fica de fora. */
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function RolagemSuave() {
  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let quadro = 0;
    let marca = 0;

    const chegar = (alvo) => {
      const secao = alvo.closest("section, footer") || alvo;
      secao.classList.remove("is-chegada");
      void secao.offsetWidth; // reinicia a animação se a mesma seção for clicada de novo
      secao.classList.add("is-chegada");
      clearTimeout(marca);
      marca = setTimeout(() => secao.classList.remove("is-chegada"), 1800);
      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      alvo.focus({ preventScroll: true });
    };

    const aoClicar = (evento) => {
      if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const link = evento.target instanceof Element ? evento.target.closest('a[href^="#"]') : null;
      if (!link || link.classList.contains("skip-link")) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      const alvo = id ? document.getElementById(id) : null;
      if (!alvo || reduzido.matches) return;

      evento.preventDefault();
      cancelAnimationFrame(quadro);
      const inicio = window.scrollY;
      const destino = Math.min(
        alvo.getBoundingClientRect().top + inicio,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const distancia = destino - inicio;
      const duracao = Math.min(1000, Math.max(450, Math.abs(distancia) * 0.35));
      let comeco = 0;

      const passo = (agora) => {
        if (!comeco) comeco = agora;
        const t = Math.min(1, (agora - comeco) / duracao);
        window.scrollTo(0, inicio + distancia * suave(t));
        if (t < 1) quadro = requestAnimationFrame(passo);
        else chegar(alvo);
      };
      quadro = requestAnimationFrame(passo);
      history.pushState(null, "", "#" + id);
    };

    /* rodar o mouse ou tocar na tela interrompe a rolagem automática */
    const parar = () => cancelAnimationFrame(quadro);

    document.addEventListener("click", aoClicar);
    window.addEventListener("wheel", parar, { passive: true });
    window.addEventListener("touchstart", parar, { passive: true });
    return () => {
      document.removeEventListener("click", aoClicar);
      window.removeEventListener("wheel", parar);
      window.removeEventListener("touchstart", parar);
      cancelAnimationFrame(quadro);
      clearTimeout(marca);
    };
  }, []);

  return null;
}
