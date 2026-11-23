import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { sendContactMessage, type ContactForm } from "../api";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../utils/messages";
import FormMessage from "../components/ui/FormMessage";
import Spinner from "../components/ui/Spinner";

function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    name: user ? `${user.first_name} ${user.last_name}`.trim() : "",
    email: user?.email ?? "",
    subject: "",
    message: "",
    website: "",
  });
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof ContactForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { message } = await sendContactMessage(form);
      setSent(message);
    } catch (err) {
      setError(
        errorMessage(err, "Meddelandet kunde inte skickas. Försök igen."),
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">Kontakt</p>
        <h1>Kontakta oss</h1>
        <p>
          Har du en fråga om en beställning, en annons eller något annat? Skriv
          till oss, så svarar vi via e-post. Svaret kanske redan finns bland{" "}
          <Link to="/faq">vanliga frågor</Link>.
        </p>
      </section>

      <section className="contact-page">
        {sent ? (
          <FormMessage message={sent} type="success" />
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Namn
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ditt namn"
                autoComplete="name"
                required
              />
            </label>

            <label>
              E-post
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="namn@email.se"
                autoComplete="email"
                required
              />
            </label>

            <label className="contact-form__full">
              Ämne
              <input
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                placeholder="Vad gäller det?"
                maxLength={120}
                required
              />
            </label>

            <label className="contact-form__full">
              Meddelande
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Skriv här"
                rows={6}
                minLength={10}
                maxLength={5000}
                required
              />
            </label>

            {/* Honeypot: dolt för människor, botar fyller i det */}
            <input
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              name="website"
            />

            <div className="contact-form__full">
              <FormMessage message={error} />
              <button
                className="button button-primary"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <Spinner />}
                {loading ? "Skickar..." : "Skicka meddelande"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default Contact;
