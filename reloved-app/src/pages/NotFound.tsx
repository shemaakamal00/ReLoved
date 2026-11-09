import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main id="main-content">
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow">404</p>
          <h1>Den här sidan finns inte</h1>
          <p>Plagget kan ha sålts, eller så är länken fel.</p>

          <div className="hero-actions">
            <Link to="/products" className="button button-primary">
              Se alla plagg
            </Link>
            <Link to="/" className="button button-secondary">
              Till startsidan
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
