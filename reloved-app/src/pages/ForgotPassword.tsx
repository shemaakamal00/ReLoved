import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api";
import { errorMessage } from "../utils/messages";
import FormMessage from "../components/ui/FormMessage";
import Spinner from "../components/ui/Spinner";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { message } = await requestPasswordReset(email);
      setSent(message);
    } catch (err) {
      setError(errorMessage(err, "Kunde inte skicka länken. Försök igen."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Lösenord</p>
          <h1>Glömt lösenord?</h1>

          {sent ? (
            <FormMessage message={sent} type="success" />
          ) : (
            <>
              <p>
                Skriv e-postadressen du loggar in med, så skickar vi en länk där
                du kan välja ett nytt lösenord.
              </p>

              <form className="login-formm" onSubmit={handleSubmit}>
                <label>
                  E-post
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namn@email.se"
                    autoComplete="email"
                    required
                  />
                </label>

                <div className="form-actions">
                  <FormMessage message={error} />
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading && <Spinner />}
                    {loading ? "Skickar..." : "Skicka länk"}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="login-register">
            <Link to="/login" className="button button-secondary">
              Tillbaka till inloggning
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
