import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";

function Favorites() {
  const { favorites, loading } = useFavorites();

  return (
    <main>
      <section className="favorites-page section">
        <div className="container">
          <div className="favorites-header">
            <h1>Mina favoriter</h1>
          </div>

          {loading ? (
            <ProductGridSkeleton count={3} />
          ) : favorites.length === 0 ? (
            <div className="favorites-empty">
              <h2>Inga favoriter än</h2>
              <p>Tryck på hjärtat på ett plagg så hamnar det här.</p>
              <Link to="/products" className="button button-primary">
                Se alla plagg
              </Link>
            </div>
          ) : (
            <div className="product-grid">
              {favorites.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
