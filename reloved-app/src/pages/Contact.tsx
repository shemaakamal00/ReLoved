function Contact() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Kontakt</p>
        <h1>Kontakta oss</h1>
        <p>
          Formuläret är inte kopplat till någon inkorg än. Det står högt upp på
          listan. Svaret på din fråga kanske redan finns bland{" "}
          <a href="/faq">vanliga frågor</a>.
        </p>
      </section>

      <section className="contact-page">
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Namn
            <input type="text" placeholder="Ditt namn" />
          </label>

          <label>
            E-post
            <input type="email" placeholder="namn@email.se" />
          </label>

          <label className="contact-form__full">
            Ämne
            <input type="text" placeholder="Vad gäller det?" />
          </label>

          <label className="contact-form__full">
            Meddelande
            <textarea placeholder="Skriv här"></textarea>
          </label>

          <button
            className="button button-primary contact-form__full"
            type="submit"
            disabled
          >
            Skicka (kommer snart)
          </button>
        </form>
      </section>
    </main>
  );
}

export default Contact;
