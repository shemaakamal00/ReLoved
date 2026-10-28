import type { Product } from "../types";

interface ProductImageProps {
  product: Pick<Product, "name" | "image_url" | "alt_text">;
  className: string;
}

function ProductImage({ product, className }: ProductImageProps) {
  if (!product.image_url) {
    return (
      <div
        className={`${className} image-placeholder`}
        role="img"
        aria-label={product.name}
      >
        <span className="image-placeholder__logo">
          Re<em>Loved</em>
        </span>
        <span className="image-placeholder__text"> Bild kommer snart</span>
      </div>
    );
  }

  return (
    <img
      src={product.image_url}
      alt={product.alt_text ?? product.name}
      className={className}
    />
  );
}

export default ProductImage;
