import { Link } from "react-router-dom";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

const CONDITION_STYLES: Record<string, { className: string; label: string }> = {
  Nyskick: { className: "cond-new", label: "Nyskick" },
  "Mycket bra": { className: "cond-good", label: "Mycket bra" },
  Bra: { className: "cond-good", label: "Bra" },
  Använt: { className: "cond-used", label: "Använt" },
};

function ProductCard({ product }: ProductCardProps) {
  const condition = CONDITION_STYLES[product.condition] ?? {
    className: "cond-good",
    label: product.condition,
  };

  const sellerName = product.seller_name ?? "ReLoved";
  const initials = sellerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="product-card" data-product-id={product.id}>
      <Link to={`/product/${product.id}`}>
        <div className="product-card__img-wrap">
          <img
            src={product.image_url ?? ""}
            alt={product.alt_text ?? product.name}
            className="product-card__image"
          />
          <span className={`condition-badge ${condition.className}`}>
            <span className="ring"></span>
            {condition.label}
          </span>
          <span className="unique-tag">1 av 1</span>
        </div>
      </Link>

      <div className="product-card-content">
        <div className="seller-row">
          <span className="seller-avatar">{initials}</span>
          <span className="seller-name">{sellerName}</span>
        </div>

        <p className="product-card__brand">{product.brand}</p>

        <Link to={`/product/${product.id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        <div className="price-row">
          <span className="product-card__price">{product.price} kr</span>
          <span className="product-card__size">Stl {product.size}</span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
