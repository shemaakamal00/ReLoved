function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Om ReLoved</p>
        <h1>En marknadsplats för kläder som bara finns i ett exemplar</h1>
        <p>
          På ReLoved säljer privatpersoner sina kläder till andra. Varje annons
          granskas innan den publiceras, och köparen betalar med kort. Hittar du
          något du gillar är det ditt, om ingen annan hinner före.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h2>Du sätter priset</h2>
          <p>
            Ingen budgivning och ingen prutning i en chatt. Priset i annonsen är
            priset köparen betalar.
          </p>
        </article>

        <article className="about-card">
          <h2>Vi tittar först</h2>
          <p>
            Alla annonser granskas innan de syns, oftast inom ett dygn. Bilden
            ska visa plagget och skicket ska stämma.
          </p>
        </article>

        <article className="about-card">
          <h2>Ingen Swish till främlingar</h2>
          <p>
            Köparen betalar med kort via Stripe. Plagget skickas med PostNord,
            till ett ombud eller hem till dörren.
          </p>
        </article>
      </section>

      <section className="about-project">
        <p className="eyebrow">Skolprojekt</p>
        <h2>Utvecklat som ett fullstackprojekt</h2>
        <p>
          ReLoved är mitt fullstackprojekt på Medieinstitutet. Butiken är byggd
          med React och TypeScript, ett eget API i Node och Express och en
          PostgreSQL-databas. Betalningen går via Stripe och frakten via
          PostNords API.
        </p>
        <p>
          Stripe körs i testläge, så inga riktiga pengar dras. Testa gärna med
          kortnumret 4242 4242 4242 4242.
        </p>
      </section>

      <section className="about-developer about-developer--split">
        <div className="developer-image-wrap">
          <img
            src="/imgs/shemaa.JPG"
            alt="Shemaa, som har byggt ReLoved"
            className="developer-image"
          />
        </div>

        <div className="developer-content">
          <p className="eyebrow">Utvecklare</p>
          <h2>Hej!</h2>
          <p>
            Mitt namn är Shemaa och jag utvecklar ReLoved som mitt
            fullstackprojekt. Syftet är att omsätta teori till praktik genom att
            bygga en komplett e-handelsplattform från grunden.
          </p>
          <p>
            Fokus ligger på användarupplevelse, responsiv design, tillgänglighet
            och modern webbutveckling.
          </p>
        </div>
      </section>
    </main>
  );
}
export default About;
