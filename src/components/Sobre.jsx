import Rico from "./Rico";
import { useIdioma } from "../i18n";

export default function Sobre() {
  const { c } = useIdioma();
  const s = c.sobre;

  return (
    <section className="section" id="sobre" aria-labelledby="sobre-h">
      <div className="wrap grid sobre__grid">
        <div className="sobre__texto">
          <h2 id="sobre-h">{s.titulo}</h2>
          {s.paragrafos.map((texto) => (
            <p key={texto.slice(0, 24)}>
              <Rico texto={texto} />
            </p>
          ))}
        </div>

        <div className="sobre__lado">
          {/* diagrama da taste-skill (assets/diagrams): o que uso como Full Stack e o que estudo */}
          <div className="panel sobre__diagrama">
            <div className="dg" data-diagram={JSON.stringify(s.diagrama)} />
          </div>
          <ul className="sobre__destaques" aria-label={c.ui.destaques}>
            {s.destaques.map((item) => (
              <li key={item.titulo} className="destaque">
                <i className={"fas " + item.icone} aria-hidden="true" />
                <div>
                  <strong>{item.titulo}</strong>
                  <span>{item.apoio}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
