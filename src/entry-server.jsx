import { renderToString } from "react-dom/server";
import Header from "./components/Header";
import Main from "./Main";
import Contato from "./components/Contato";
import { ProvedorDeIdioma } from "./i18n";

/* Pré-renderização do build (scripts/prerender.mjs): o HTML de cada raiz, no idioma pedido, vai direto para
   dist/index.html ou dist/en/index.html, e o cliente só hidrata. A página abre inteira, sem JavaScript. */
export function render(idioma) {
  const com = (elemento) => renderToString(<ProvedorDeIdioma idioma={idioma}>{elemento}</ProvedorDeIdioma>);
  return { header: com(<Header />), main: com(<Main />), footer: com(<Contato />) };
}
