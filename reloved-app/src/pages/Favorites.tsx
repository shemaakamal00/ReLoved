import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useExitList } from "../hooks/useExitList";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";
import EmptyState from "../components/ui/EmptyState";

function Favorites() {
  const { favorites, loading } = useFavorites();

  const shown = useExitList(favorites, (product) => product.id);

  return (
    <main>
      <section className="favorites-page section">
        <div className="container">
          <div className="favorites-header">
            <h1>Mina favoriter</h1>
          </div>

          {loading ? (
            <ProductGridSkeleton count={3} />
          ) : shown.length === 0 ? (
            <EmptyState
              icon="heart"
              title="Inga favoriter än"
              action={
                <Link to="/products" className="button button-primary">
                  Se alla plagg
                </Link>
              }
            >
              Tryck på hjärtat på ett plagg så hamnar det här.
            </EmptyState>
          ) : (
            <div className="product-grid">
              {shown.map(({ item: product, leaving }, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  className={leaving ? "is-leaving" : ""}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
