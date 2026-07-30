import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchProductById } from "../api/client";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const CONDITION_STYLES: Record<string, { className: string; label: string }> = {
  Nyskick: { className: "cond-new", label: "Nyskick" },
  "Mycket bra": { className: "cond-good", label: "Mycket bra" },
  Bra: { className: "cond-good", label: "Bra" },
  Använt: { className: "cond-used", label: "Använt" },
};

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addToCart, items } = useCart();
  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetchProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main>
        <p>Laddar produkt...</p>
      </main>
    );
  if (notFound || !product)
    return (
      <main>
        <p>Produkten hittades inte.</p>
      </main>
    );

  const sellerName = product.seller_name ?? "ReLoved";
  const sellerInitials = sellerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const condition = CONDITION_STYLES[product.condition] ?? {
    className: "cond-good",
    label: product.condition,
  };

  const isAvailable = product.status === "approved";
  const alreadyInCart = items.some((item) => item.product_id === product.id);

  return (
    <main>
      <div className="container">
        <nav className="breadcrumbs" aria-label="Brödsmulor">
          <Link to="/">Hem</Link>
          <span>/</span>
          <Link to="/products">Produkter</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product">
          <div className="product-gallery">
            <img
              src={product.image_url ?? ""}
              alt={product.alt_text ?? product.name}
              className="product-image"
            />
            <span className={`condition-badge ${condition.className}`}>
              <span className="ring"></span>
              {condition.label}
            </span>
            <span className={`unique-tag ${alreadyInCart ? "reserved" : ""}`}>
              {alreadyInCart ? "Reserverad" : "1 av 1"}
            </span>
          </div>

          <div className="product-info">
            <div className="seller-row">
              <span className="seller-avatar">{sellerInitials}</span>
              <span className="seller-name">{sellerName}</span>
            </div>

            <p className="product-brand">{product.brand}</p>
            <h1>{product.name}</h1>
            <p className="product-price">{product.price} kr</p>

            <div className="product-specs">
              <div>
                <span>Storlek</span>
                <strong>{product.size}</strong>
              </div>
              <div>
                <span>Färg</span>
                <strong>{product.color}</strong>
              </div>
              <div>
                <span>Material</span>
                <strong>{product.material}</strong>
              </div>
            </div>

            {isAvailable ? (
              <button
                type="button"
                className="button button-primary"
                onClick={() => addToCart(product.id)}
                disabled={alreadyInCart}
              >
                {alreadyInCart ? "Redan i varukorgen" : "Lägg i varukorg"}
              </button>
            ) : (
              <p className="form-error">
                Den här produkten är inte längre tillgänglig.
              </p>
            )}

            <button
              type="button"
              className="button button-secondary"
              onClick={() => toggleFavorite(product.id)}
            >
              {isFavorited(product.id) ? "♥ Sparad" : "♡ Spara"}
            </button>
          </div>
        </section>

        <section className="product-description">
          <h2>Beskrivning</h2>
          <p>{product.description}</p>
        </section>

        <section className="seller-card">
          <h2>Säljare</h2>
          <div className="seller">
            <div className="seller-avatar seller-avatar--large">
              {sellerInitials}
            </div>
            <div className="seller__info">
              <h3>{sellerName}</h3>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;
