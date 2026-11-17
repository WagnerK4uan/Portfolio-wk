import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/motion.css";
import "./styles/global.css";
import "./styles/transitions.css";
import Header from "./components/Header";
import Main from "./Main";
import Contato from "./components/Contato";
import { ProvedorDeIdioma, idiomaDoDocumento } from "./i18n";

/* index.html (pt) e en/index.html (en) trazem header.nav, main e footer.closing já preenchidos pelo build
   (scripts/prerender.mjs); cada um é uma raiz do React que só hidrata o HTML pronto, no idioma do <html lang> */
const idioma = idiomaDoDocumento(document);
const montar = (seletor, elemento) =>
  hydrateRoot(
    document.querySelector(seletor),
    <StrictMode>
      <ProvedorDeIdioma idioma={idioma}>{elemento}</ProvedorDeIdioma>
    </StrictMode>
  );

montar("header.nav", <Header />);
montar("main", <Main />);
montar("footer.closing", <Contato />);
