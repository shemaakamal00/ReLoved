import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/messages";
import FormMessage from "../components/ui/FormMessage";
import PasswordInput from "../components/ui/PasswordInput";
import Spinner from "../components/ui/Spinner";

const MIN_LENGTH = 8;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    setLoading(true);
    try {
      const { message } = await resetPassword(token, password);
      showToast(message);
      navigate("/login");
    } catch (err) {
      setError(errorMessage(err, "Kunde inte byta lösenord. Försök igen."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Lösenord</p>
          <h1>Välj nytt lösenord</h1>

          {!token ? (
            <>
              <p>
                Länken saknar sin kod. Be om en ny länk för att återställa
                lösenordet.
              </p>
              <div className="login-register">
                <Link to="/forgot-password" className="button button-primary">
                  Be om en ny länk
                </Link>
              </div>
            </>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                Nytt lösenord
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Minst ${MIN_LENGTH} tecken`}
                  autoComplete="new-password"
                  minLength={MIN_LENGTH}
                  required
                />
              </label>

              <label>
                Bekräfta lösenord
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={MIN_LENGTH}
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
                  {loading ? "Sparar..." : "Spara nytt lösenord"}
                </button>
              </div>

              {error?.includes("Länken") && (
                <Link to="/forgot-password">Be om en ny länk</Link>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
