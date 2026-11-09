import { useParams } from "react-router-dom";
import { fetchProductById } from "../api";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useFavorites } from "../context/FavoritesContext";
import { useApi } from "../hooks/useApi";
import type { Product } from "../types";
import { initials } from "../utils/format";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageMessage from "../components/ui/PageMessage";
import ConditionBadge from "../components/product/ConditionBadge";
import ProductImage from "../components/product/ProductImage";
import SellerRow from "../components/product/SellerRow";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: product,
    loading,
    error,
  } = useApi((signal) => fetchProductById(id!, signal), [id], {
    enabled: Boolean(id),
  });

  if (loading) return <PageMessage>Laddar produkt...</PageMessage>;
  if (error || !product)
    return (
      <PageMessage>
        Plagget finns inte längre. Det kan ha sålts eller tagits bort.
      </PageMessage>
    );

  const sellerName = product.seller_name ?? "ReLoved";

  return (
    <main>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Hem", to: "/" },
            { label: "Produkter", to: "/products" },
            { label: product.name },
          ]}
        />

        <section className="product">
          <ProductGallery product={product} />

          <div className="product-info">
            <SellerRow sellerName={product.seller_name} />
            <ProductSummary product={product} />
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
              {initials(sellerName)}
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

function ProductGallery({ product }: { product: Product }) {
  const { items } = useCart();
  const alreadyInCart = items.some((item) => item.product_id === product.id);
  const isUnique = product.stock === null;

  return (
    <div className="product-gallery">
      <ProductImage product={product} className="product-image" />
      <ConditionBadge condition={product.condition} />
      {product.stock === 0 && (
        <span className="unique-tag sold-out">Slut i lager</span>
      )}
      {isUnique && (
        <span className={`unique-tag ${alreadyInCart ? "reserved" : ""}`}>
          {alreadyInCart ? "I din varukorg" : "1 av 1"}
        </span>
      )}
    </div>
  );
}

function ProductSummary({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { formatPrice } = useCurrency();

  const isAvailable = product.status === "approved";
  const isSoldOut = product.stock === 0;
  const alreadyInCart = items.some((item) => item.product_id === product.id);

  return (
    <>
      <p className="product-brand">{product.brand}</p>
      <h1>{product.name}</h1>
      <p className="product-price">{formatPrice(product.price)}</p>

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

      {!isAvailable ? (
        <p className="form-error">
          Sålt. Det här plagget har redan fått en ny ägare.
        </p>
      ) : isSoldOut ? (
        <button type="button" className="button button-primary" disabled>
          Slut i lager
        </button>
      ) : (
        <button
          type="button"
          className="button button-primary"
          onClick={() => addToCart(product.id)}
          disabled={alreadyInCart}
        >
          {alreadyInCart ? "Redan i varukorgen" : "Lägg i varukorg"}
        </button>
      )}

      <button
        type="button"
        className="button button-secondary"
        onClick={() => toggleFavorite(product.id)}
      >
        {isFavorited(product.id) ? "♥ Sparad" : "♡ Spara"}
      </button>
    </>
  );
}

export default ProductDetail;
