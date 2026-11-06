import Reveal from "../ui/Reveal";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: "Kr",
    title: "Du sätter priset",
    description:
      "Ingen budgivning och ingen prutning i en chatt. Priset i annonsen är det köparen betalar.",
  },
  {
    icon: "→",
    title: "Vi sköter resten",
    description:
      "Köparen betalar med kort, och du skickar plagget till oss. Du behöver aldrig dela din adress med en främling.",
  },
  {
    icon: "♻",
    title: "Mer hållbar konsumtion",
    description:
      "Second hand gör det lättare att shoppa smartare och minska onödigt svinn.",
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
          {benefits.map((benefit, index) => (
            <Reveal
              as="article"
              className="benefit-card"
              index={index}
              key={benefit.title}
            >
              <span className="benefit-card__icon">{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhySell;
