import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginErrorMessage } from "../../utils/loginErrors";
import FormMessage from "../ui/FormMessage";
import GitHubLoginButton from "./GitHubLoginButton";

// Visas på /admin när ingen admin är inloggad
function AdminLogin() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const error = loginErrorMessage(searchParams.get("error"));

  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Administratör</p>
          <h1>Logga in som administratör</h1>

          <FormMessage message={error} />
          {user && !error && (
            <p>
              Du är inloggad som kund. Administratörspanelen kräver ett GitHub
              konto med adminbehörighet.
            </p>
          )}

          <GitHubLoginButton />
          <p>GitHub frågar bara om läsrättighet till din profil.</p>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
