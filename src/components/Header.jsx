import { useEffect, useRef, useState } from "react";
import { SECOES } from "../data/conteudo";
import { useSecaoAtiva } from "../hooks/useSecaoAtiva";
import { useIdioma } from "../i18n";

/* O seletor PT / EN leva para a outra página mantendo a seção em que a pessoa está (os ids são iguais) */
function SeletorDeIdioma({ ativa, onClick }) {
  const { c } = useIdioma();
  const outro = c.ui.outroIdioma;
  const atual = (
    <span key="atual" className="idioma__item is-active" aria-current="true">{c.ui.esteIdioma}</span>
  );
  const link = (
    <a
      key="link"
      className="idioma__item"
      href={outro.href + (ativa ? "#" + ativa : "")}
      hrefLang={outro.lang}
      lang={outro.lang}
      aria-label={outro.nome}
      onClick={onClick}
    >
      {outro.rotulo}
    </a>
  );
  return (
    <div className="idioma" role="group" aria-label={c.ui.idioma}>
      {/* ordem fixa PT, EN nas duas páginas; o idioma atual não é link */}
      {c.codigo === "pt" ? [atual, link] : [link, atual]}
    </div>
  );
}

export default function Header() {
  const { c } = useIdioma();
  const ativa = useSecaoAtiva(SECOES);
  const [aberto, setAberto] = useState(false);
  const botao = useRef(null);

  /* Menu do celular: Esc fecha e devolve o foco ao botão; a página não rola por trás do painel */
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    document.documentElement.classList.add("menu-aberto");
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.documentElement.classList.remove("menu-aberto");
    };
  }, [aberto]);

  const fechar = () => setAberto(false);

  return (
    <>
      <div className="wrap nav__bar">
        <a className="skip-link" href="#conteudo">{c.ui.pular}</a>
        <a className="nav__logo" href="#home">
          Wagner Kauan<span className="nav__logo-ponto" aria-hidden="true" />
        </a>
        <nav className="nav__links" aria-label={c.ui.navPrincipal}>
          <ul>
            {c.navegacao.map((item) => {
              const atual = ativa === item.id;
              return (
                <li key={item.id}>
                  <a className={"nav__link" + (atual ? " is-active" : "")} href={"#" + item.id} aria-current={atual ? "true" : undefined}>
                    {item.rotulo}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <SeletorDeIdioma ativa={ativa} />
        <a className="btn btn--primary nav__cta" href="#contato">{c.ui.falar}</a>
        <button
          ref={botao}
          className="nav__toggle"
          type="button"
          aria-expanded={aberto}
          aria-controls="menu-celular"
          aria-label={aberto ? c.ui.fecharMenu : c.ui.abrirMenu}
          onClick={() => setAberto((valor) => !valor)}
        >
          <span className="nav__toggle-linhas" aria-hidden="true" />
        </button>
      </div>

      {/* transitions.dev 07 · Panel reveal: o painel sobe com fade e cross-blur */}
      <div id="menu-celular" className="nav__painel t-panel-slide" data-open={aberto} inert={!aberto ? true : undefined}>
        <ul>
          {c.navegacao.map((item) => (
            <li key={item.id}>
              <a href={"#" + item.id} onClick={fechar}>{item.rotulo}</a>
            </li>
          ))}
        </ul>
        <SeletorDeIdioma ativa={ativa} onClick={fechar} />
        <a className="btn btn--primary" href="#contato" onClick={fechar}>{c.ui.falar}</a>
      </div>
    </>
  );
}
