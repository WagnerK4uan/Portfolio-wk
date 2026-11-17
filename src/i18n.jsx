import { createContext, useContext } from "react";
import { conteudos } from "./data/conteudo";

/* O idioma da página: "pt" em / e "en" em /en/. raiz leva os caminhos relativos de img/ e assets/ de volta à
   raiz do site quando a página está em /en/. */
const IdiomaContext = createContext(null);

export function idiomaDoDocumento(doc) {
  return doc.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "pt";
}

export function ProvedorDeIdioma({ idioma, children }) {
  const raiz = idioma === "en" ? "../" : "";
  const valor = { c: conteudos[idioma], idioma, raiz, src: (caminho) => raiz + caminho };
  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>;
}

export function useIdioma() {
  return useContext(IdiomaContext);
}
