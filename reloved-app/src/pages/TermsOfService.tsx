function TermsOfService() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Villkor</p>
        <h1>Användarvillkor</h1>
        <p>
          ReLoved är ett skolprojekt. Inga riktiga köp eller försäljningar görs
          här, och plaggen och priserna är exempel.
        </p>
      </section>

      <section className="policy-page">
        <article className="policy-card">
          <h2>Ditt konto</h2>
          <p>
            Med ett konto kan du sälja, spara favoriter och se dina ordrar.
            Inloggningen är riktig, men allt annat är testdata.
          </p>

          <h2>Annonser</h2>
          <p>
            Alla annonser granskas innan de publiceras. En annons kan nekas om
            bilden inte visar plagget eller om beskrivningen inte stämmer.
          </p>

          <h2>Returer</h2>
          <p>Second hand säljs i befintligt skick och kan inte returneras.</p>

          <h2>Betalning</h2>
          <p>
            Betalningen går via Stripe i testläge, så inga riktiga pengar dras.
            ReLoved ansvarar inte för riktiga köp, eftersom det inte är en
            riktig butik.
          </p>
        </article>
      </section>
    </main>
  );
}

export default TermsOfService;
