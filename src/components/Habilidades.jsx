import { useIdioma } from "../i18n";

export default function Habilidades() {
  const { c, src } = useIdioma();
  const hab = c.habilidades;

  return (
    <section className="section" id="habilidades" aria-labelledby="habilidades-h">
      <div className="wrap">
        <div className="secao__topo">
          <h2 id="habilidades-h">{hab.titulo}</h2>
          <p className="secao__lead">{hab.lead}</p>
        </div>
        <div className="grid habilidades__grupos">
          {hab.grupos.map((grupo) => (
            <div key={grupo.chave} className="grupo">
              <h3>{grupo.titulo}</h3>
              <p className="grupo__descricao">{grupo.descricao}</p>
              <ul>
                {grupo.itens.map((item) => (
                  <li key={item.nome} className="habilidade">
                    {item.img ? (
                      <img src={src(item.img)} alt="" width="28" height="28" loading="lazy" />
                    ) : (
                      <i className={"fas " + item.icone} aria-hidden="true" />
                    )}
                    <span>{item.nome}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
