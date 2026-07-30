import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";

function Favorites() {
  const { favorites, loading } = useFavorites();

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
            <p className="eyebrow">Mina sparade plagg</p>
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
            <div className="product-grid">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
