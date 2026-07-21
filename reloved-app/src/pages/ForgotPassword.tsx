import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <main>
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">Återställ konto</p>
          <h1>Glömt lösenord?</h1>
          <p>
            Ange din e-postadress så skickar vi en länk för att återställa ditt
            lösenord.
          </p>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="reset-email">
              E-post
              <input
                id="reset-email"
                name="email"
                type="email"
                placeholder="namn@email.se"
                required
              />
            </label>

            <button type="submit" className="button button-primary">
              Skicka återställningslänk
            </button>
          </form>

          <div className="login-register">
            <p>Kom du ihåg ditt lösenord?</p>
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
