import Reveal from "../ui/Reveal";

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: "upload",
    number: "01",
    title: "Lägg upp annonsen",
    description: "En bild, märke, storlek, skick och ditt pris",
  },
  {
    id: "buyer",
    number: "02",
    title: "Vi granskar den",
    description: "Ser allt bra ut publiceras annonsen, oftast inom ett dygn.",
  },
  {
    id: "sold",
    number: "03",
    title: "Någon köper den",
    description:
      "Du skickar plagget till oss, och vi skickar det vidare till köparen med PostNord.",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <p className="eyebrow">För dig som säljer</p>
        <h2>Så säljer du ett plagg</h2>

        <div className="steps">
          {steps.map((step, index) => (
            <Reveal
              as="article"
              className="step-card"
              data-step={step.id}
              index={index}
              key={step.id}
            >
              <div className="step-content">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export default HowItWorks;
