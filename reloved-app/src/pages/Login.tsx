import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte logga in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Välkommen tillbaka</p>
          <h1>Logga in</h1>
          <p>Logga in för att handla, sälja och följa dina beställningar.</p>

          <form className="login-form" onSubmit={handleSubmit}>
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <Link to="/forgot-password">Glömt lösenord?</Link>

            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? "Loggar in..." : "Logga in"}
            </button>
          </form>

          <div className="login-register">
            <p>Har du inget konto?</p>
            <Link to="/register" className="button button-secondary">Skapa konto</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;