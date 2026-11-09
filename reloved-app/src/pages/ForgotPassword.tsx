import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Lösenord</p>
          <h1>Glömt lösenordet?</h1>
          <p>
            Det går inte att återställa lösenord än, eftersom ReLoved inte
            skickar några mejl ännu. Skapa ett nytt konto så länge, det tar en
            halv minut.
          </p>

          <div className="login-register">
            <Link to="/register" className="button button-primary">
              Skapa nytt konto
            </Link>
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
