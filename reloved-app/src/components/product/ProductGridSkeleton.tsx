// En platshållarkort som visas medan produkterna laddas
function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid" aria-busy="true">
      <span className="sr-only">Laddar produkter...</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          className="product-card product-card--skeleton"
          aria-hidden="true"
          key={index}
        >
          <div className="skeleton skeleton--image" />
          <div className="product-card-content">
            <div className="skeleton skeleton--line" style={{ width: "35%" }} />
            <div className="skeleton skeleton--line" style={{ width: "75%" }} />
            <div className="skeleton skeleton--line" style={{ width: "25%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
