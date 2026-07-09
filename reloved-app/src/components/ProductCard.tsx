import { Link } from "react-router-dom";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card" data-product-id={product.id}>
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image_url ?? ""}
          alt={product.alt_text ?? product.name}
          className="product-card__image"
        />
      </Link>

      <div className="product-card-content">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__meta">
          {product.size} • {product.condition}
        </p>
        <p className="product-card__price">{product.price} kr</p>
        <Link to={`/product/${product.id}`}>Visa produkt</Link>
      </div>
    </article>
  );
}

export default ProductCard;
