function PrivacyPolicy() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Integritet</p>
        <h1>Integritetspolicy</h1>
        <p>
          Här beskriver vi hur ReLoved skulle hantera personuppgifter i en
          riktig version av tjänsten.
        </p>
      </section>

      <section className="policy-page">
        <article className="policy-card">
          <h2> Utbildningsprojekt </h2>
          <p>
            {" "}
            ReLoved är ett utbildningsprojekt och använder endast
            demonstrationsdata. Inga riktiga köp, betalningar eller
            användarkonton hanteras i denna version.{" "}
          </p>

          <h2>Vilka uppgifter samlas in?</h2>
          <p>
            ReLoved sparar de uppgifter du själv anger vid registrering och köp:
            namn, e-postadress, lösenord (krypterat), leveransadress och
            orderinformation.
          </p>

          <h2>Varför behövs uppgifterna?</h2>
          <p>
            Uppgifterna används för att skapa och hantera ditt konto, genomföra
            köp och försäljningar, visa din orderhistorik och möjliggöra kontakt
            mellan köpare och säljare.
          </p>

          <h2>Demodata</h2>
          <p>
            Det här är ett utbildningsprojekt. Lägg inte in riktiga
            personuppgifter, lösenord du använder på andra tjänster, eller
            riktiga betalkortsuppgifter — inget köp är på riktigt, även om
            kontosystemet är verkligt.
          </p>
        </article>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
