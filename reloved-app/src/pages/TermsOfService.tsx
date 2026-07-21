function TermsOfService() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Villkor</p>
        <h1>Användarvillkor</h1>
        <p>
          Här beskrivs de villkor som skulle gälla för ReLoved i en framtida
          version.
        </p>
      </section>

      <section className="policy-page">
        <article className="policy-card">
          <h2>Utbildningsprojekt</h2>
          <p>
            ReLoved är ett skolprojekt och används endast i demonstrationssyfte.
            Inga riktiga köp, betalningar eller försäljningar genomförs på
            sidan.
          </p>

          <h2>Användarkonton</h2>
          <p>
            Du kan skapa ett konto, köpa produkter, sälja egna annonser och
            följa dina ordrar. Kontot skapas med riktig autentisering, men all
            data i denna version är demo- och testdata.
          </p>

          <h2>Köp och försäljning</h2>
          <p>
            Produkter, priser och ordrar som visas på sidan är exempeldata och
            ska inte betraktas som riktiga erbjudanden.
          </p>

          <h2>Ansvar</h2>
          <p>
            ReLoved ansvarar inte för riktiga transaktioner eftersom denna
            version inte är en aktiv marknadsplats.
          </p>

          <h2>Ändringar</h2>
          <p>
            Villkoren kan komma att uppdateras i takt med att projektet
            utvecklas.
          </p>
        </article>
      </section>
    </main>
  );
}

export default TermsOfService;
