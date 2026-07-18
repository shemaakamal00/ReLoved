import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

function Favorites() {
  const { favorites, loading, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <main>
        <p>Laddar favoriter...</p>
      </main>
    );
  }

  return (
    <main>
      <section className="favorites-page section">
        <div className="container">
          <div className="favorites-header">
            <h1>Mina favoriter</h1>
          </div>

          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <h2>Inga favoriter ännu</h2>
              <p>När du sparar produkter visas de här.</p>
              <Link to="/products" className="button button-primary">
                Utforska produkter
              </Link>
            </div>
          ) : (
            <div className="product-grid" data-favorites-list>
              {favorites.map((product) => (
                <article
                  className="product-card"
                  data-product-id={product.id}
                  key={product.id}
                >
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image_url ?? ""}
                      alt={product.alt_text ?? product.name}
                      className="product-card__image"
                    />
                  </Link>

                  <div className="product-card-content">
                    <p className="product-card__brand">{product.brand}</p>
                    <h3 className="product-card__name">{product.name}</h3>
                    <p className="product-card__meta">
                      {product.size} • {product.condition}
                    </p>
                    <p className="product-card__price">{product.price} kr</p>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      ♥ Ta bort
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
