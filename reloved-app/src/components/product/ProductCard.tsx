import { useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useToast } from "../../context/ToastContext";
import { useReveal } from "../../hooks/useReveal";
import type { Product } from "../../types";
import { conditionClass } from "../../utils/conditions";
import { flyToCart } from "../../utils/flyToCart";
import { errorMessage } from "../../utils/messages";
import FavoriteButton from "./FavoriteButton";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Pick<
    Product,
    | "id"
    | "name"
    | "brand"
    | "price"
    | "size"
    | "condition"
    | "image_url"
    | "alt_text"
    | "seller_name"
    | "stock"
  > &
    Partial<Pick<Product, "status">>;
  index?: number;
}

function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const revealProps = useReveal<HTMLElement>(index);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const productUrl = `/product/${product.id}`;

  return (
    <article
      className="product-card"
      data-product-id={product.id}
      {...revealProps}
    >
      {/* Knapparna ligger bredvid länken, inte i den: knappar får inte ligga i en <a>. */}
      <div className="product-card__img-wrap" ref={imageWrapRef}>
        <Link to={productUrl} tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} className="product-card__image" />
        </Link>
        {product.stock === 0 ? (
          <span className="unique-tag sold-out">Slut i lager</span>
        ) : (
          product.stock === null && <span className="unique-tag">1 av 1</span>
        )}

        <FavoriteButton
          productId={product.id}
          className="product-card__favorite"
        />
        <QuickActions
          product={product}
          productUrl={productUrl}
          getImage={() =>
            imageWrapRef.current?.querySelector(".product-card__image")
          }
        />
      </div>

      <div className="product-card-content">
        <p className="product-card__brand">{product.brand}</p>

        <Link to={productUrl}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        {(product.condition || product.size) && (
          <p className="product-card__meta">
            {product.condition && (
              <span
                className={`condition-dot ${conditionClass(product.condition)}`}
                aria-hidden="true"
              />
            )}
            {[product.condition, product.size && `Stl ${product.size}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}

interface QuickActionsProps {
  product: ProductCardProps["product"];
  productUrl: string;
  getImage: () => Element | null | undefined;
}

function QuickActions({ product, productUrl, getImage }: QuickActionsProps) {
  const { addToCart, items } = useCart();
  const { showToast } = useToast();

  const inCart = items.some((item) => item.product_id === product.id);
  const canBuy =
    product.stock !== 0 && (product.status ?? "approved") === "approved";

  async function handleAdd() {
    flyToCart(getImage());
    try {
      await addToCart(product.id);
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte lägga i varukorgen."), "error");
    }
  }

  return (
    <div className="product-card__quick">
      {canBuy && (
        <button
          type="button"
          className="quick-add"
          onClick={handleAdd}
          disabled={inCart}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 7h12l-1 9H7L6 7z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          {inCart ? "I varukorgen" : "Lägg i varukorg"}
        </button>
      )}
      <Link
        to={productUrl}
        className="quick-view"
        aria-label={`Visa ${product.name}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Link>
    </div>
  );
}

export default ProductCard;
