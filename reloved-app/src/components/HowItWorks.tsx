interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    id: "upload",
    number: "01",
    title: "Lägg upp din annons",
    description: "Ta bilder, skriv en kort beskrivning och sätt ditt pris.",
    icon: "📷",
  },
  {
    id: "buyer",
    number: "02",
    title: "Hitta en köpare",
    description: "Köpare kan söka, filtrera och kontakta dig direkt.",
    icon: "💬",
  },
  {
    id: "home",
    number: "03",
    title: "Ge plagget ett nytt hem",
    description: "Sälj vidare istället för att låta kläder ligga oanvända.",
    icon: "📦",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works section">
      <div className="container">
        <p className="eyebrow">Enkelt • Säkert • Hållbart</p>
        <h2>Så fungerar ReLoved</h2>

        <div className="steps">
          {steps.map((step) => (
            <article className="step-card" data-step={step.id} key={step.id}>
              <div className="step-content">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className="step-visual" aria-hidden="true">
                <span>{step.icon}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
