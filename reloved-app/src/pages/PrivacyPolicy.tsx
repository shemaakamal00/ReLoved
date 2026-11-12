function PrivacyPolicy() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Integritet</p>
        <h1>Integritetspolicy</h1>
        <p>Vilka uppgifter ReLoved sparar om dig, och varför.</p>
      </section>

      <section className="policy-page">
        <article className="policy-card">
          <h2>Utbildningsprojekt</h2>
          <p>
            Kontona är riktiga och sparas i en databas, men alla köp görs i
            Stripes testläge. Använd därför inte ett lösenord som du har på
            andra sidor, och skriv aldrig in ett riktigt kortnummer.
          </p>

          <h2>Vad vi sparar</h2>
          <p>
            Det du själv skriver in när du skapar konto eller handlar: namn,
            e-post, telefonnummer, adress och dina ordrar. Lösenordet sparas
            hashat med bcrypt, så ingen kan läsa det, inte ens vi.
          </p>

          <h2>Vad uppgifterna används till</h2>
          <p>
            För att du ska kunna logga in, för att plaggen ska kunna skickas
            till dig och för att du ska kunna se dina ordrar. Kortuppgifterna
            hamnar aldrig hos oss, de hanteras av Stripe.
          </p>
        </article>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
