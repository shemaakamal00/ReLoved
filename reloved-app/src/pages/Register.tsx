import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FormMessage from "../components/ui/FormMessage";
import PasswordInput from "../components/ui/PasswordInput";
import Spinner from "../components/ui/Spinner";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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
      await register(firstName, lastName, email, password);
      showToast(`Välkommen till ReLoved, ${firstName}!`);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte registrera dig",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Ny på ReLoved?</p>
          <h1>Skapa konto</h1>
          <p>
            Med ett konto kan du sälja, spara favoriter och se dina ordrar. Att
            handla går även utan.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Förnamn
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ditt förnamn"
                required
              />
            </label>

            <label>
              Efternamn
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ditt efternamn"
                required
              />
            </label>

            <label>
              E-post
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@email.se"
                required
              />
            </label>

            <label>
              Lösenord
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </label>

            <label>
              Bekräfta lösenord
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
              />
            </label>

            <div className="form-actions">
              <FormMessage message={error} />
              <button
                type="submit"
                className="button button-primary"
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <Spinner />}
                {loading ? "Skapar konto..." : "Skapa konto"}
              </button>
            </div>
          </form>

          <div className="login-register">
            <p>Har du redan konto?</p>
            <Link to="/login" className="button button-secondary">
              Logga in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
