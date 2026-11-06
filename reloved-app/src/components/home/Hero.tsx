import { Link } from "react-router-dom";
import type { Product } from "../../types";

interface HeroProps {
  featured?: Product[];
  loading?: boolean;
}

function Hero({ featured = [], loading = false }: HeroProps) {
  const centered = !loading && featured.length === 0;

  return (
    <section className="hero">
      <div
        className={`container hero-grid ${centered ? "hero-grid--centered" : ""}`}
      >
        <div className="hero-copy">
          <p className="eyebrow">Second hand · ett exemplar av varje</p>
          <h1>
            Varje plagg finns <em>bara en gång</em>
          </h1>
          <p className="hero-lede">
            Ser du något du gillar är det ditt, om ingen annan hinner före. Alla
            annonser granskas innan de publiceras.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/products">
              Se alla plagg →
            </Link>
            <Link className="button button-secondary" to="/seller">
              Sälj ett plagg
            </Link>
          </div>
        </div>

        {loading && (
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual__card hero-visual__card--0 skeleton" />
            <div className="hero-visual__card hero-visual__card--1 skeleton" />
          </div>
        )}

        {!loading && featured.length > 0 && (
          <div className="hero-visual">
            {featured.slice(0, 2).map((product, index) => (
              <div
                className={`hero-visual__card hero-visual__card--${index}`}
                key={product.id}
              >
                <img
                  src={product.image_url ?? ""}
                  alt={product.alt_text ?? product.name}
                />
                <span className="hero-visual__tag">1 av 1</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
