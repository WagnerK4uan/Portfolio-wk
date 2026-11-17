import { useEffect } from "react";
import Hero from "./components/Hero";
import Sobre from "./components/Sobre";
import Trajetoria from "./components/Trajetoria";
import Habilidades from "./components/Habilidades";
import Projetos from "./components/Projetos";
import CursorRotulo from "./components/CursorRotulo";
import RolagemSuave from "./components/RolagemSuave";
import { useIdioma } from "./i18n";

/* O desenhista de diagramas da taste-skill (copiado sem edição para public/assets) roda depois que o React
   montou o Sobre, que ele lê */
export default function Main() {
  const { raiz } = useIdioma();

  useEffect(() => {
    import(/* @vite-ignore */ new URL(raiz + "assets/diagrams/diagram.js", document.baseURI).href)
      .then((modulo) => modulo.default.auto(document))
      .catch(() => {});
  }, [raiz]);

  return (
    <>
      <Hero />
      <Sobre />
      <Trajetoria />
      <Habilidades />
      <Projetos />
      <CursorRotulo />
      <RolagemSuave />
    </>
  );
}
