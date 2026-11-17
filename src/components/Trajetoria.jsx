import { useIdioma } from "../i18n";

/* Trajetória em escada: no desktop cada etapa fica um degrau acima da anterior, todas sobre uma linha de base
   com um ponto; a etapa atual leva o ponto violeta com pulso. No celular vira uma lista vertical. */
export default function Trajetoria() {
  const { c } = useIdioma();
  const t = c.trajetoria;

  return (
    <section className="section section--gelo" id="trajetoria" aria-labelledby="trajetoria-h">
      <div className="wrap">
        <div className="secao__topo">
          <h2 id="trajetoria-h">{t.titulo}</h2>
          <p className="secao__lead">{t.lead}</p>
        </div>

        <ol className="escada" style={{ "--etapas": t.etapas.length }}>
          {t.etapas.map((etapa, i) => (
            <li key={etapa.periodo} className={"escada__etapa" + (etapa.atual ? " is-atual" : "")} style={{ "--degrau": i }}>
              <span className="escada__periodo">
                {etapa.periodo}
                {etapa.atual && <span className="escada__selo">{t.atual}</span>}
              </span>
              <h3 className="escada__cargo">{etapa.cargo}</h3>
              <span className="escada__local">{etapa.local}</span>
              {etapa.detalhe && <p className="escada__detalhe">{etapa.detalhe}</p>}
              <span className="escada__ponto" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <p className="escada__nota">
          <i className="fas fa-graduation-cap" aria-hidden="true" /> {t.nota}
        </p>
      </div>
    </section>
  );
}
