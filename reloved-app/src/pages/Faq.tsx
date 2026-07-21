interface FaqEntry {
  question: string;
  answer: React.ReactNode;
  open?: boolean;
}

const faqEntries: FaqEntry[] = [
  {
    question: "Hur köper jag en produkt?",
    answer:
      "Lägg produkten i varukorgen och gå vidare till kassan för att slutföra köpet.",
    open: true,
  },
  {
    question: "Hur säljer jag på ReLoved?",
    answer:
      "Skicka in de plagg du inte längre använder, så fotograferar och lägger vi upp dem åt dig. Du slipper fota, skriva beskrivningar och sätta pris själv.",
  },
  {
    question: "Vem ansvarar för frakten?",
    answer:
      "ReLoved sköter fotografering, prissättning och frakt av dina insända plagg — du behöver bara skicka in dem.",
  },
  {
    question: "Kan jag spara produkter?",
    answer:
      "Ja! Klicka på hjärtikonen på en produkt så sparas den bland dina favoriter.",
  },
  {
    question: "Kan jag returnera en vara?",
    answer:
      "Returer hanteras mellan köpare och säljare enligt plattformens regler.",
  },
  {
    question: "Är ReLoved en riktig e-handel?",
    answer:
      "Nej. ReLoved är ett skolprojekt som utvecklats för att visa en modern fullstack-lösning inom e-handel.",
  },
];

function Faq() {
    return (
        <main className="about-page">
            <section className="about-hero">
                <p className="eyebrow"> Hjälpcenter </p>
                <h1> Vanliga frågor </h1>
                <p> Här hittar du svar på de vanligaste frågorna om att köpa och sälja på ReLoved </p>
            </section>

            <section className="faq-list">
                { faqEntries.map((entry) => (
                    <details className="faq-item" open={entry.open} key={entry.question}>
                        <summary> {entry.question} </summary>
                        <p> {entry.answer} </p>
                    </details>
                ))}
            </section>
        </main>
    );
}

export default Faq;