import { useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useToast } from "../../context/ToastContext";
import { useReveal } from "../../hooks/useReveal";
import { useTemporaryFlag } from "../../hooks/useTemporaryFlag";
import type { Product } from "../../types";
import { conditionClass } from "../../utils/conditions";
import { hasSizes, isStockItem } from "../../utils/cart";
import { flyToCart } from "../../utils/flyToCart";
import { errorMessage } from "../../utils/messages";
import Checkmark from "../ui/Checkmark";
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
    Partial<Pick<Product, "status" | "variants">>;
  index?: number;
  className?: string;
}

function ProductCard({ product, index = 0, className = "" }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const revealProps = useReveal<HTMLElement>(index);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const productUrl = `/product/${product.id}`;

  return (
    <article
      className={`product-card ${className}`}
      data-product-id={product.id}
      {...revealProps}
      style={{
        ...revealProps.style,
        viewTransitionName: `product-${product.id}`,
      }}
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
  const [justAdded, markAdded] = useTemporaryFlag(1400);

  // Lagervaror kan läggas i flera gånger, second hand bara en gång
  const inCart =
    !isStockItem(product) &&
    items.some((item) => item.product_id === product.id);
  const canBuy =
    product.stock !== 0 && (product.status ?? "approved") === "approved";
  // Med storlekar måste man välja på produktsidan
  const needsSize = hasSizes(product);

  async function handleAdd() {
    flyToCart(getImage());
    try {
      await addToCart(product.id);
      markAdded();
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte lägga i varukorgen."), "error");
    }
  }

  return (
    <div className="product-card__quick">
      {canBuy && needsSize && (
        <Link to={productUrl} className="quick-add">
          <span className="quick-add__label">Välj storlek</span>
        </Link>
      )}
      {canBuy && !needsSize && (
        <button
          type="button"
          className={`quick-add ${justAdded ? "is-added" : ""}`}
          onClick={handleAdd}
          disabled={inCart}
        >
          {/* key: texten tonas in på nytt när den byts */}
          <span
            className="quick-add__label"
            key={justAdded ? "added" : String(inCart)}
          >
            {justAdded ? (
              <Checkmark small />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 7h12l-1 9H7L6 7z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
            )}
            {justAdded
              ? "Tillagd!"
              : inCart
                ? "I varukorgen"
                : "Lägg i varukorg"}
          </span>
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
