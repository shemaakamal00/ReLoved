import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../api/client";
import type { Product } from "../types";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetchProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main><p>Laddar produkt...</p></main>;
  if (notFound || !product) return <main><p>Produkten hittades inte.</p></main>;

  return (
    <main>
      <nav className="breadcrumbs" aria-label="Brödsmulor">
        <Link to="/">Hem</Link>
        <span>/</span>
        <Link to="/products">Produkter</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <section className="product">
        <div className="product-gallery">
          <img src={product.image_url ?? ""} alt={product.alt_text ?? product.name} className="product-image" />
        </div>

        <div className="product-info">
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="product-price">{product.price} kr</p>
          <p><strong>Storlek:</strong> {product.size}</p>
          <p><strong>Skick:</strong> {product.condition}</p>
          <p><strong>Färg:</strong> {product.color}</p>
          <p><strong>Material:</strong> {product.material}</p>

          <button type="button" className="button button-primary">Lägg i varukorg</button>
          <button type="button" className="button button-secondary">♡ Spara</button>
        </div>
      </section>

      <section className="product-description">
        <h2>Beskrivning</h2>
        <p>{product.description}</p>
      </section>

      <section className="seller-card">
        <h2>Säljare</h2>
        <div className="seller">
          <div className="seller__info">
            <h3>{product.seller_name ?? "ReLoved"}</h3>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;