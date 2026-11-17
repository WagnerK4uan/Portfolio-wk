import { useEffect, useRef, useState } from "react";
import { useMidia, useMontado, MOVIMENTO_REDUZIDO } from "../hooks/useMidia";
import { useIdioma } from "../i18n";
import Seta from "./Seta";

const doisDigitos = (n) => String(n).padStart(2, "0");

/* Projetos em lista editorial com o GIF de cada um. No desktop a lista rola normal à esquerda e o quadro à
   direita fica preso (sticky), trocando para a tela do projeto que está no meio da tela; no celular cada
   projeto mostra a própria tela. Só o projeto ativo carrega a versão animada (img/anim, de 0,4 a 1,2 MB); os
   outros ficam no pôster. O botão pausa as animações (WCAG 2.2.2: nada se move por mais de 5 s sem pausa).
   Sem script ou com movimento reduzido: todos em cor cheia e só pôsteres. */
export default function Projetos() {
  const { c, src } = useIdioma();
  const p = c.projetos;
  const montado = useMontado();
  const reduzido = useMidia(MOVIMENTO_REDUZIDO);
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const lista = useRef(null);
  const animar = montado && !reduzido && !pausado;

  useEffect(() => {
    if (!("IntersectionObserver" in window) || !lista.current) return;
    const itens = [...lista.current.querySelectorAll(".projeto")];
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) setAtivo(itens.indexOf(entrada.target));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    itens.forEach((item) => observador.observe(item));
    return () => observador.disconnect();
  }, []);

  const tela = (projeto, i) => src(animar && i === ativo ? projeto.animado : projeto.poster);

  return (
    <section className={"section section--gelo projetos" + (montado ? " js-pronto" : "")} id="projetos" aria-labelledby="projetos-h">
      <div className="wrap">
        <div className="secao__topo">
          <h2 id="projetos-h">{p.titulo}</h2>
          <p className="secao__lead">{p.lead}</p>
          {montado && !reduzido && (
            <button type="button" className="projetos__pausa" aria-pressed={pausado} onClick={() => setPausado((v) => !v)}>
              <i className={"fas " + (pausado ? "fa-play" : "fa-pause")} aria-hidden="true" />
              {pausado ? c.ui.retomar : c.ui.pausar}
            </button>
          )}
        </div>

        <div className="grid projetos__grid">
          <ol className="projetos__lista" ref={lista}>
            {p.lista.map((projeto, i) => (
              <li
                key={projeto.chave}
                className={"projeto" + (i === ativo ? " is-ativo" : "")}
                data-cursor={projeto.privado ? c.ui.cursorPrivado : c.ui.cursorCodigo}
                onFocus={() => setAtivo(i)}
              >
                <span className="projeto__numero" aria-hidden="true">{doisDigitos(i + 1)}</span>
                <h3 className="projeto__nome">{projeto.nome}</h3>
                <span className="projeto__tipo">{projeto.tipo}</span>
                <figure className="projeto__media">
                  <img src={tela(projeto, i)} alt={projeto.alt} width={projeto.largura} height={projeto.altura} loading="lazy" decoding="async" />
                </figure>
                <p className="projeto__descricao">{projeto.descricao}</p>
                <span className="projeto__tags">{projeto.tags.join(" · ")}</span>
                {projeto.privado ? (
                  <span className="projeto__privado">
                    <i className="fas fa-lock" aria-hidden="true" /> {c.ui.privado}
                  </span>
                ) : (
                  <a className="projeto__repo t-learn" href={projeto.repo} target="_blank" rel="noopener">
                    {c.ui.verCodigo} <Seta />
                  </a>
                )}
              </li>
            ))}
          </ol>

          {/* o quadro do desktop: repete as telas da lista (alt vazio, a lista já descreve cada uma) */}
          <div className="projetos__quadro" aria-hidden="true">
            <div className="projetos__janela">
              {p.lista.map((projeto, i) => (
                <img
                  key={projeto.chave}
                  className={i === ativo ? "is-ativo" : undefined}
                  src={tela(projeto, i)}
                  alt=""
                  width={projeto.largura}
                  height={projeto.altura}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <p className="projetos__contador">
              <strong>{doisDigitos(ativo + 1)}</strong> / {doisDigitos(p.lista.length)} · {p.lista[ativo].nome}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
