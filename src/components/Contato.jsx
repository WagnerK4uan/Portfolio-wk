import { useRef } from "react";
import { EMAIL } from "../data/conteudo";
import { useIdioma } from "../i18n";
import { morphText } from "../hooks/useMorphText";
import Seta from "./Seta";

/* Fechamento escuro (footer-dark): contato e a linha final do rodapé */
export default function Contato() {
  const { c } = useIdioma();
  const rotulo = useRef(null);
  const aviso = useRef(null);
  const timer = useRef(0);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    /* transitions.dev 33 · Text morph: "Copiar e-mail" vira "E-mail copiado" e volta depois de 2 s */
    morphText(rotulo.current, c.ui.copiado);
    if (aviso.current) aviso.current.textContent = c.ui.copiadoAviso;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      morphText(rotulo.current, c.ui.copiar);
      if (aviso.current) aviso.current.textContent = "";
    }, 2000);
  };

  return (
    <div className="wrap">
      <div className="closing__chamada">
      <div className="grid closing__grid">
        <div className="closing__texto">
          <h2 id="contato-h">{c.contato.titulo}</h2>
          <p className="secao__lead">{c.contato.lead}</p>
          <button type="button" className="btn btn--primary btn--xl" onClick={copiar}>
            <i className="fas fa-copy" aria-hidden="true" />
            <span className="t-morph" ref={rotulo}>{c.ui.copiar}</span>
          </button>
          <span className="sr-only" role="status" ref={aviso} />
        </div>

        <ul className="closing__lista">
          {c.contato.lista.map((contato) => (
            <li key={contato.rede}>
              <a
                className="contato t-learn"
                href={contato.href}
                {...(contato.externo ? { target: "_blank", rel: "noopener" } : {})}
              >
                <i className={contato.icone} aria-hidden="true" />
                <span className="contato__rede">{contato.rede}</span>
                <span className="contato__texto">{contato.texto}</span>
                <Seta />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="closing__marca" aria-hidden="true">Wagner Kauan</p>
      </div>
      <div className="closing__rodape">
        <p>{c.contato.rodape}</p>
      </div>
    </div>
  );
}
