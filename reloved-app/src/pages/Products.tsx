import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api";
import { useApi } from "../hooks/useApi";
import { useCategories } from "../hooks/useCategories";
import type { Category, Product } from "../types";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";

type SortBy = "newest" | "price-asc" | "price-desc";

function categoryWithChildren(
  categories: Category[],
  categoryId: number | null,
) {
  if (categoryId === null) return null;
  return categories
    .filter((c) => c.id === categoryId || c.parent_id === categoryId)
    .map((c) => c.id);
}

function sortProducts(products: Product[], sortBy: SortBy) {
  return [...products].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function Products() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categoryId = categoryParam ? Number(categoryParam) : null;
  const searchQuery = searchParams.get("search")?.toLowerCase() ?? "";

  const { data: products, loading } = useApi(
    (signal) => fetchProducts(signal),
    [],
  );
  const { categories } = useCategories();
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const categoryIds = categoryWithChildren(categories, categoryId);
  const visibleProducts = sortProducts(
    (products ?? [])
      .filter((p) => !categoryIds || categoryIds.includes(p.category_id ?? -1))
      .filter(
        (p) =>
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery) ||
          p.brand.toLowerCase().includes(searchQuery),
      ),
    sortBy,
  );

  const activeCategory = categories.find((c) => c.id === categoryId);
  const heading = searchQuery
    ? `Sökresultat för "${searchQuery}"`
    : (activeCategory?.name ?? "Alla plagg");

  return (
    <main>
      <section className="products-page section">
        <div className="container">
          <div className="products-page__header">
            <p className="eyebrow">Produkter</p>
            <h1>{heading}</h1>
          </div>

          <div className="products-toolbar">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="newest">Nyast</option>
              <option value="price-asc">Lägst pris</option>
              <option value="price-desc">Högst pris</option>
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : visibleProducts.length === 0 ? (
            <p>Inget här just nu. Nya plagg kommer in hela tiden.</p>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Products;
