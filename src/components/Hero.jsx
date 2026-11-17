import { useEffect, useState } from "react";
import BlurText from "./reactbits/BlurText";
import RotatingText from "./reactbits/RotatingText";
import DotGrid from "./reactbits/DotGrid";
import { useMidia, useMontado, MOVIMENTO_REDUZIDO, PONTEIRO_FINO } from "../hooks/useMidia";
import { useIdioma } from "../i18n";

/* Hero escuro: a grade de pontos do DotGrid reage ao cursor, a foto pequena em círculo (como no portfólio
   original) fica à esquerda do texto, e o nome grande entra palavra por palavra */
export default function Hero() {
  const { c, src } = useIdioma();
  const h = c.hero;
  const reduzido = useMidia(MOVIMENTO_REDUZIDO);
  const ponteiroFino = useMidia(PONTEIRO_FINO);
  const montado = useMontado();
  const [mostrar, setMostrar] = useState(false);
  const [tituloPronto, setTituloPronto] = useState(false);

  /* transitions.dev 18 · Texts reveal: o que vem depois do h1 sobe em sequência quando a última
     palavra do nome já está a caminho */
  useEffect(() => {
    const id = setTimeout(() => setMostrar(true), reduzido ? 0 : 450);
    return () => clearTimeout(id);
  }, [reduzido]);

  return (
    <section className="hero" id="home" data-enter aria-labelledby="hero-h">
      <DotGrid
        className="hero__camada"
        dotSize={4}
        gap={22}
        baseColor="#2a2a44"
        activeColor="#8b84ff"
        proximity={140}
        swell={0.6}
        glow={0.35}
        fade={0.55}
        intro={!reduzido}
        mouseInteraction={ponteiroFino && !reduzido}
        clickShock={false}
      />

      <div className="wrap">
        <div className="hero-text hero__conteudo">
          <div className="hero__media" data-enter-media>
            <img
              src={src("img/foto-wagner.webp")}
              alt={h.fotoAlt}
              className="hero__foto"
              width="440"
              height="487"
              fetchPriority="high"
            />
          </div>

          <div className={"hero__texto t-stagger" + (mostrar ? " is-shown" : "")}>
            <p className="hero__kicker t-stagger-line t-stagger-line--1">
              <span className="sr-only">{h.frentesLeitor}</span>
              <span aria-hidden="true">
                {!montado || reduzido ? (
                  <span className="hero__rotativo">{h.frentes[0]}</span>
                ) : (
                  <RotatingText
                    texts={h.frentes}
                    mainClassName="hero__rotativo"
                    rotationInterval={1800}
                    loop={false}
                    splitBy="words"
                    staggerDuration={0.04}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                )}
              </span>
            </p>

            {/* BlurText só enquanto o nome entra; no HTML pré-renderizado, sem movimento e depois da
                entrada o h1 é texto simples (lido inteiro, sem uma caixa por palavra) */}
            {montado && !reduzido && !tituloPronto ? (
              <BlurText
                as="h1"
                id="hero-h"
                className="hero__titulo"
                text={h.titulo}
                animateBy="words"
                direction="bottom"
                trigger="load"
                delay={70}
                stepDuration={0.32}
                blur={8}
                distance={18}
                onAnimationComplete={() => setTituloPronto(true)}
              />
            ) : (
              <h1 id="hero-h" className="hero__titulo">{h.titulo}</h1>
            )}

            <p className="hero__lead t-stagger-line t-stagger-line--2">{h.lead}</p>

            <div className="hero__acoes t-stagger-line t-stagger-line--3">
              <a className="btn btn--primary btn--xl" href="#contato">{c.ui.falar}</a>
              <a className="btn btn--secondary btn--xl" href="#projetos">{c.ui.verProjetos}</a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
