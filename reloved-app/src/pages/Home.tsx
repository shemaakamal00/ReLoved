import { Link } from "react-router-dom";
import { fetchProducts } from "../api";
import { useApi } from "../hooks/useApi";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";
import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import ValueStrip from "../components/home/ValueStrip";
import WhySell from "../components/home/WhySell";

const FEATURED_COUNT = 4;

function Home() {
  const { data, loading } = useApi((signal) => fetchProducts(signal), []);
  const products = data ?? [];

  const newestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, FEATURED_COUNT);

  return (
    <main>
      <Hero featured={products.filter((p) => p.image_url)} loading={loading} />
      <ValueStrip />

      <section className="featured-products section">
        <div className="container">
          <div className="featured-products__header">
            <div>
              <p className="eyebrow">Nytt</p>
              <h2>Senast upplagt</h2>
              <p>Plaggen som kom in senast. När de är sålda är de borta.</p>
            </div>
            <Link to="/products" className="featured-products__all">
              Visa alla <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={FEATURED_COUNT} />
          ) : (
            <div className="product-grid">
              {newestProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <WhySell />
    </main>
  );
}

export default Home;
