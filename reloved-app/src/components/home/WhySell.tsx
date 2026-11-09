import type { ReactNode } from "react";
import Reveal from "../../components/ui/Reveal";

interface Benefit {
  icon: ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    // Prislapp
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
    title: "Du sätter priset",
    description:
      "Ingen budgivning och ingen prutning i en chatt. Priset i annonsen är det köparen betalar.",
  },
  {
    // Paket
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
        <path d="m3 7.5 9 4.5 9-4.5M12 12v9" />
      </svg>
    ),
    title: "Vi sköter resten",
    description:
      "Köparen betalar med kort, och du skickar plagget till oss. Du behöver aldrig dela din adress med en främling.",
  },
  {
    // Löv
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" />
        <path d="M5 19 13 11" />
      </svg>
    ),
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
              <span className="benefit-card__icon" aria-hidden="true">
                {benefit.icon}
              </span>
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
