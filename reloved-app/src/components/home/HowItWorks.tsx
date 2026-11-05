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
    title: "Lägg upp annonsen",
    description: "En bild, märke, storlek, skick och ditt pris",
    icon: "📷",
  },
  {
    id: "buyer",
    number: "02",
    title: "Vi granskar den",
    description: "Ser allt bra ut publiceras annonsen, oftast inom ett dygn.",
    icon: "💬",
  },
  {
    id: "home",
    number: "03",
    title: "Någon köper den",
    description: "Köperen betalar med kort och du ser försäljningen i säljarpanelen.",
    icon: "📦",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <p className="eyebrow">För dig som säljer</p>
        <h2>Så säljer du ett plagg</h2>

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
