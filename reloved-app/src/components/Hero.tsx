import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Älskat tidigare. Älskat igen.</p>
        <h1>
          Ge älskade plagg
          <br />
          ett nytt kapitel
        </h1>
        <p>Köp och sälj second hand på ett enkelt, tryggt och hållbart sätt</p>

        <div className="hero-actions">
          <Link className="button button-primary" to="/seller">
            Sälj nu
          </Link>
          <a className="button button-secondary" href="#how-it-works">
            Så fungerar det
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
