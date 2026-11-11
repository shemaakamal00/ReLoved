import { useRef, useState, type RefObject } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductById } from "../api";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useFavorites } from "../context/FavoritesContext";
import { useApi } from "../hooks/useApi";
import { useTemporaryFlag } from "../hooks/useTemporaryFlag";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Product } from "../types";
import { hasSizes, isStockItem } from "../utils/cart";
import { flyToCart } from "../utils/flyToCart";
import { errorMessage } from "../utils/messages";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Checkmark from "../components/ui/Checkmark";
import Modal from "../components/ui/Modal";
import PageMessage from "../components/ui/PageMessage";
import ConditionBadge from "../components/product/ConditionBadge";
import ProductImage from "../components/product/ProductImage";
import QuantityStepper from "../components/product/QuantityStepper";
import SellerRow from "../components/product/SellerRow";
import SizePicker from "../components/product/SizePicker";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const galleryRef = useRef<HTMLDivElement>(null);
  const {
    data: product,
    loading,
    error,
  } = useApi((signal) => fetchProductById(id!, signal), [id], {
    enabled: Boolean(id),
  });

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product)
    return (
      <PageMessage>
        Plagget finns inte längre. Det kan ha sålts eller tagits bort.
      </PageMessage>
    );

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
          <ProductGallery product={product} galleryRef={galleryRef} />

          <div className="product-info">
            {/* Säljaren visas bara när det är en privatperson, inte ReLoveds eget lager */}
            {product.seller_name && (
              <SellerRow sellerName={product.seller_name} />
            )}
            <ProductSummary
              product={product}
              getImage={() =>
                galleryRef.current?.querySelector(".product-image")
              }
            />

            {product.description && (
              <section className="product-description">
                <h2>Beskrivning</h2>
                <p>{product.description}</p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductGallery({
  product,
  galleryRef,
}: {
  product: Product;
  galleryRef: RefObject<HTMLDivElement | null>;
}) {
  const { items } = useCart();
  const alreadyInCart = items.some((item) => item.product_id === product.id);
  const isUnique = product.stock === null;
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="product-gallery" ref={galleryRef}>
      {product.image_url ? (
        <button
          type="button"
          className="product-gallery__zoom"
          aria-label="Visa större bild"
          onClick={() => setZoomed(true)}
        >
          <ProductImage product={product} className="product-image" />
        </button>
      ) : (
        <ProductImage product={product} className="product-image" />
      )}
      <ConditionBadge condition={product.condition} />
      {product.stock === 0 && (
        <span className="unique-tag sold-out">Slut i lager</span>
      )}
      {isUnique && (
        <span className={`unique-tag ${alreadyInCart ? "reserved" : ""}`}>
          {alreadyInCart ? "I din varukorg" : "1 av 1"}
        </span>
      )}

      {zoomed && product.image_url && (
        <Modal
          label={product.name}
          className="lightbox"
          onClose={() => setZoomed(false)}
        >
          <img src={product.image_url} alt={product.alt_text ?? product.name} />
        </Modal>
      )}
    </div>
  );
}

function ProductSummary({
  product,
  getImage,
}: {
  product: Product;
  getImage: () => Element | null | undefined;
}) {
  const { addToCart, items } = useCart();
  const { showToast } = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { formatPrice } = useCurrency();

  const isAvailable = product.status === "approved";
  const isSoldOut = product.stock === 0;
  const saved = isFavorited(product.id);
  const { user } = useAuth();
  const [justAdded, markAdded] = useTemporaryFlag(1600);
  const [popping, setPopping] = useState(false);

  // Lagervaror (t.ex. från grossisten) kan köpas i flera exemplar och storlekar.
  const stockItem = isStockItem(product);
  const sizes = hasSizes(product) ? product.variants : [];
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [missingSize, setMissingSize] = useState(false);

  const inCart = items
    .filter((item) => item.product_id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const alreadyInCart = !stockItem && inCart > 0;
  // Hur många till som går att lägga i varukorgen
  const maxToAdd = stockItem ? Math.max(0, (product.stock ?? 0) - inCart) : 1;

  function chooseSize(value: string) {
    setSize(value);
    setMissingSize(false);
  }

  async function handleAdd() {
    if (sizes.length > 0 && !size) {
      setMissingSize(true);
      return;
    }
    flyToCart(getImage());
    try {
      await addToCart(product.id, { size, quantity });
      markAdded();
      setQuantity(1);
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte lägga i varukorgen."), "error");
    }
  }

  async function handleSave() {
    if (!saved && user) setPopping(true);
    try {
      await toggleFavorite(product.id);
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte spara favoriten."), "error");
    }
  }

  return (
    <>
      <p className="product-brand">{product.brand}</p>
      <h1>{product.name}</h1>
      <p className="product-price">{formatPrice(product.price)}</p>

      <div className="product-specs">
        {stockItem ? (
          <div>
            <span>I lager</span>
            <strong>{product.stock} st</strong>
          </div>
        ) : (
          <div>
            <span>Storlek</span>
            <strong>{product.size}</strong>
          </div>
        )}
        <div>
          <span>Färg</span>
          <strong>{product.color}</strong>
        </div>
        <div>
          <span>Material</span>
          <strong>{product.material}</strong>
        </div>
      </div>

      {stockItem && isAvailable && !isSoldOut && (
        <div className="product-buy-options">
          {sizes.length > 0 && (
            <SizePicker
              sizes={sizes}
              value={size}
              onChange={chooseSize}
              showError={missingSize}
            />
          )}
          <div className="product-quantity">
            <span className="product-quantity__label">Antal</span>
            <QuantityStepper
              value={Math.min(quantity, Math.max(maxToAdd, 1))}
              max={maxToAdd}
              onChange={setQuantity}
              disabled={maxToAdd === 0}
            />
            {inCart > 0 && (
              <Link to="/cart" className="product-quantity__in-cart">
                {inCart} st i varukorgen
              </Link>
            )}
          </div>
        </div>
      )}

      {!isAvailable ? (
        <p className="form-error">
          Sålt. Det här plagget har redan fått en ny ägare.
        </p>
      ) : isSoldOut ? (
        <button type="button" className="button button-primary" disabled>
          Slut i lager
        </button>
      ) : justAdded ? (
        <span className="button button-primary button--added" role="status">
          <Checkmark small />
          Tillagd!
        </span>
      ) : alreadyInCart ? (
        <Link to="/cart" className="button button-primary fade-in">
          Ligger i varukorgen · Gå dit
        </Link>
      ) : (
        <button
          type="button"
          className="button button-primary"
          onClick={handleAdd}
          disabled={maxToAdd === 0}
        >
          {maxToAdd === 0
            ? "Allt i lager ligger i din varukorg"
            : sizes.length > 0 && !size
              ? "Välj storlek"
              : quantity > 1
                ? `Lägg ${quantity} st i varukorg`
                : "Lägg i varukorg"}
        </button>
      )}

      <button
        type="button"
        className={`button button-secondary product-save ${popping ? "is-popping" : ""}`}
        aria-pressed={saved}
        onClick={handleSave}
        onAnimationEnd={() => setPopping(false)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20s-6.5-4.2-8.5-7.5C1.7 9.6 3 6 6.6 6c2.1 0 3.2 1.2 4 2.3.8-1.1 1.9-2.3 4-2.3C18.2 6 19.5 9.6 17.7 12.5 15.7 15.8 12 20 12 20z" />
        </svg>
        {saved ? "Sparad" : "Spara"}
      </button>
    </>
  );
}

// Platshållare med samma form som sidan, medan produkten laddas
function ProductDetailSkeleton() {
  return (
    <main>
      <div className="container" aria-busy="true">
        <span className="sr-only">Laddar produkt...</span>
        <div className="breadcrumbs" aria-hidden="true">
          <div className="skeleton skeleton--line" style={{ width: "14rem" }} />
        </div>
        <section className="product" aria-hidden="true">
          <div className="product-gallery skeleton product-skeleton__image" />
          <div className="product-info">
            <div className="skeleton skeleton--line" style={{ width: "20%" }} />
            <div className="skeleton product-skeleton__title" />
            <div className="skeleton skeleton--line" style={{ width: "25%" }} />
            <div className="skeleton product-skeleton__specs" />
            <div className="skeleton product-skeleton__button" />
            <div className="skeleton product-skeleton__button" />
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;
