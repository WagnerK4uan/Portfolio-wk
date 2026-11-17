import { LINKEDIN } from "../data/conteudo";

/* Texto do conteúdo com **negrito** e [LinkedIn] (o link do perfil) */
export default function Rico({ texto }) {
  return texto.split(/(\*\*[^*]+\*\*|\[LinkedIn\])/).map((parte, i) => {
    if (parte.startsWith("**")) return <strong key={i}>{parte.slice(2, -2)}</strong>;
    if (parte === "[LinkedIn]")
      return (
        <a key={i} className="link" href={LINKEDIN} target="_blank" rel="noopener">
          LinkedIn
        </a>
      );
    return parte;
  });
}
