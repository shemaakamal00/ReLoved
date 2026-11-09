interface FaqEntry {
  question: string;
  answer: string;
  open?: boolean;
}

const faqEntries: FaqEntry[] = [
  {
    question: "Hur köper jag ett plagg?",
    answer:
      "Lägg plagget i varukorgen och gå till kassan. Du väljer ombud eller hemleverans och betalar med kort hos Stripe. Du behöver inget konto för att handla.",
    open: true,
  },
  {
    question: "Vad kostar frakten?",
    answer:
      "59 kr till ett PostNord-ombud och 99 kr för hemleverans. Handlar du för 500 kr eller mer är frakten gratis.",
  },
  {
    question: "Hur säljer jag?",
    answer:
      "Klicka på Sälj, ladda upp en bild och fyll i märke, storlek, skick och pris. Vi granskar annonsen innan den publiceras, oftast inom ett dygn.",
  },
  {
    question: "Hur skickar jag något jag har sålt?",
    answer:
      "Du skickar plagget till oss, och vi skickar det vidare till köparen med PostNord. Så slipper du hålla koll på köparens adress och fraktsätt.",
  },
  {
    question: "Hur får jag betalt?",
    answer:
      "Det du säljer syns i säljarpanelen. Utbetalningar är inte byggda än, men planen är en plånbok där pengarna samlas. Där väljer du själv om du vill handla för dem eller ta ut dem.",
  },
  {
    question: "Kan jag returnera ett plagg?",
    answer:
      "Nej. Second hand säljs i befintligt skick och kan inte returneras.",
  },
  {
    question: "Kan jag spara plagg till senare?",
    answer:
      "Ja, tryck på hjärtat. Du behöver vara inloggad för att spara favoriter.",
  },
  {
    question: "Är ReLoved en riktig butik?",
    answer:
      "Nej, det är ett skolprojekt. Betalningen körs i Stripes testläge, så inga riktiga pengar dras. Testa med kortnumret 4242 4242 4242 4242, ett framtida datum och valfri CVC.",
  },
];

function Faq() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Hjälp</p>
        <h1>Vanliga frågor</h1>
        <p>Om att köpa, sälja och skicka på ReLoved.</p>
      </section>

      <section className="faq-list">
        {faqEntries.map((entry) => (
          <details className="faq-item" open={entry.open} key={entry.question}>
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

export default Faq;
