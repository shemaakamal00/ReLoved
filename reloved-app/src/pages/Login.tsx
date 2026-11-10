import { useState, type FormEvent } from "react";
import {
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FormMessage from "../components/ui/FormMessage";
import PasswordInput from "../components/ui/PasswordInput";
import Spinner from "../components/ui/Spinner";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import { loginErrorMessage } from "../utils/loginErrors";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo =
    (location.state as { from?: string } | null)?.from ?? "/";
  const googleError = loginErrorMessage(searchParams.get("error"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      showToast("Du är inloggad. Välkommen tillbaka!");
      navigate(returnTo);
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

          <FormMessage message={googleError} />
          <GoogleLoginButton returnTo={returnTo} />
          <p className="login-divider">
            <span>eller med e-post</span>
          </p>

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
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </label>

            <Link to="/forgot-password">Glömt lösenord?</Link>

            <div className="form-actions">
              <FormMessage message={error} />
              <button
                className="button button-primary"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading && <Spinner />}
                {loading ? "Loggar in..." : "Logga in"}
              </button>
            </div>
          </form>

          <div className="login-register">
            <p>Har du inget konto?</p>
            <Link to="/register" className="button button-secondary">
              Skapa konto
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
