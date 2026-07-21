import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main id="main-content">
      <section className="login-page">
        <div className="login-card">
          <p className="eyebrow"> 404 </p>
          <h1> Sidan kunde inte hittas</h1>
          <p>
            {" "}
            Sidan du försöker besöka finns inte, har flyttats eller är
            tillfälligt otillgänglig.
          </p>

          <div className="hero-actions">
            <Link to="/" className="button button-primary">
              {" "}
              Till startsidan{" "}
            </Link>
            <Link to="/products" className="button button-secondary">
              {" "}
              Utforska produkter{" "}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
