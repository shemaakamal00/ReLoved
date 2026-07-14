import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte registrera dig");
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
          <p>Skapa ett konto för att handla, sälja och följa dina ordrar.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Namn
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ditt namn" required />
            </label>

            <label>
              E-post
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="namn@email.se" required />
            </label>

            <label>
              Lösenord
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
            </label>

            <label>
              Bekräfta lösenord
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" required />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="button button-secondary" disabled={loading}>
              {loading ? "Skapar konto..." : "Skapa konto"}
            </button>
          </form>

          <div className="login-register">
            <p>Har du redan konto?</p>
            <Link to="/login" className="button button-secondary">Logga in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;