import { useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api";
import { useApi } from "../hooks/useApi";
import { useCategories } from "../hooks/useCategories";
import type { Category, Product } from "../types";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";
import EmptyState from "../components/ui/EmptyState";

type SortBy = "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortBy, string> = {
  newest: "Nyast",
  "price-asc": "Lägsta pris",
  "price-desc": "Högsta pris",
};

function withViewTransition(update: () => void) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}

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
  const [sortChanged, setSortChanged] = useState(false);

  function handleSortChange(value: SortBy) {
    withViewTransition(() => {
      setSortBy(value);
      setSortChanged(true);
    });
  }

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
            {/* Kvitto på sorteringen. key gör att texten tonas in vid varje byte. */}
            <p className="sort-feedback" role="status" key={sortBy}>
              {sortChanged &&
                `Sorterat på ${SORT_LABELS[sortBy].toLowerCase()}`}
            </p>
            <label className="sr-only" htmlFor="products-sort">
              Sortera
            </label>
            <select
              id="products-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortBy)}
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : visibleProducts.length === 0 ? (
            <EmptyState title="Inget här just nu">
              Nya plagg kommer in hela tiden. Titta in igen snart.
            </EmptyState>
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
