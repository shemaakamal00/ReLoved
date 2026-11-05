import Reveal from "../ui/Reveal";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: "✦",
    title: "Enkelt att komma igång",
    description:
      "Lägg upp en annons på några minuter med bilder, pris och beskrivning.",
  },
  {
    icon: "→",
    title: "Tjäna på det du inte använder",
    description:
      "Förvandla oanvända favoriter till pengar istället för att de samlar damm.",
  },
  {
    icon: "♻",
    title: "Mer hållbar konsumtion",
    description:
      "Second hand gör det lättare att shoppa smartare och minska onödigt svinn.",
  },
  {
    icon: "♡",
    title: "Plagg blir älskade igen",
    description:
      "Dina kläder får ett nytt liv hos någon som verkligen vill använda dem.",
  },
];

function WhySell() {
  return (
    <section className="why-sell section">
      <div className="container">
        <div className="why-sell__header">
          <h2>Det här får du som säljare</h2>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title}>
              <span className="benefit-card__icon">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhySell;
