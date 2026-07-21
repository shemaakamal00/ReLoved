function Contact () {
    return (
        <main className="about-page">
            <section className="about-hero">
                <p className="eyebrow"> Kontakt </p>
                <h1> Kontakta oss </h1>
                <p> Har du frågor om ReLoved? Skicka ett meddelande så återkommer vi så snart vi kan. </p>
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
                        <input type="text" placeholder="Vad gäller ditt meddelande=" />
                    </label>

                    <label className="contact-form__full">
                        Meddelande 
                        <textarea placeholder="Skriv ditt meddelande här..."></textarea>
                    </label>

                    <button className="button button-primary contact-form__full" type="submit">
                        Skicka meddelande
                    </button>
                </form>
            </section>
        </main>
    );
}

export default Contact; 