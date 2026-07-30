import { Link } from "react-router-dom";
import type { Product } from "../types";

interface HeroProps {
  featured?: Product[];
}

function Hero({ featured = [] }: HeroProps) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Älskat tidigare · älskat igen</p>
          <h1>
            Varje plagg finns <em>bara en gång</em> — precis som du
          </h1>
          <p className="hero-lede">
            Ingen lagerhylla, inga dubbletter. Det du ser är det enda exemplaret
            som finns. Hittar du något du gillar, är det bäst att inte vänta.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/products">
              Utforska garderoben →
            </Link>
            <a className="button button-secondary" href="#how-it-works">
              Så fungerar det
            </a>
          </div>
        </div>

        {featured.length > 0 && (
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
