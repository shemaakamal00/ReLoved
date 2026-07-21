function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow"> Om ReLoved </p>
        <h1> Second hand som får saker att leva vidare </h1>
        <p>
          ReLoved är en modern marknadsplats där människor enkelt kan köpa och
          sälja begagnade produkter. Vårt mål är att göra hållbar konsumtion
          enklare, tryggare och mer inspirerande.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h2>🌿 Vår vision</h2>
          <p>
            Vi vill att fler produkter ska få ett nytt hem istället för att
            hamna längst in i garderoben eller slängas i onödan.
          </p>
        </article>

        <article className="about-card">
          <h2>♻️ Hållbarhet</h2>
          <p>
            Genom att köpa och sälja second hand minskar vi tillsammans
            överkonsumtion och ger produkter ett längre liv.
          </p>
        </article>

        <article className="about-card">
          <h2>🤝 Trygg handel</h2>
          <p>
            ReLoved är byggt för att skapa en säker och smidig upplevelse mellan
            köpare och säljare.
          </p>
        </article>
      </section>

      <section className="about-project">
        <p className="eyebrow">Skolprojekt</p>
        <h2>Utvecklat som ett fullstackprojekt</h2>
        <p>
          ReLoved utvecklas som ett projekt inom utbildningen
          Fullstackutvecklare på Medieinstitutet.
        </p>
        <p>
          Projektet byggs stegvis med HTML, CSS, JavaScript, React, TypeScript,
          Node.js och databas för att efterlikna en modern marketplace.
        </p>
        <p>
          Den här versionen innehåller demonstrationsdata och används endast i
          utbildningssyfte.
        </p>
      </section>
      <section className="about-developer about-developer--split">
        <div className="developer-image-wrap">
          <img
            src="/imgs/shemaa.JPG"
            alt="Bild på Shemaa"
            className="developer-image"
          />
        </div>

        <div className="developer-content">
          <p className="eyebrow">Utvecklare</p>
          <h2>Hej! 👋</h2>
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
