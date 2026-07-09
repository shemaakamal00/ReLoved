import { useState, useEffect } from "react";
import { fetchProducts } from "../api/client";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import WhySell from "../components/WhySell";

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Hero />
      <section className="featured-products section">
        <div className="container">
          <div className="featured-products__header">
            <p className="eyebrow">Utvalt just nu</p>
            <h2>Populärt just nu</h2>
            <p>Handplockade favoriter som förtjänar ett nytt hem.</p>
          </div>

          {loading ? (
            <p>Laddar produkter...</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      <HowItWorks/>
      <WhySell/>
    </main>
  );
}

export default Home;