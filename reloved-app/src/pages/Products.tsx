import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api";
import { useApi } from "../hooks/useApi";
import { useCategories } from "../hooks/useCategories";
import type {
  Category,
  FacetValue,
  Product,
  SearchFilters,
  SearchSort,
} from "../types";
import ProductCard from "../components/product/ProductCard";
import ProductGridSkeleton from "../components/product/ProductGridSkeleton";
import SearchFilterBar from "../components/search/SearchFilterBar";
import EmptyState from "../components/ui/EmptyState";

// Utan sökord finns ingen relevans att sortera på
const SORTS: SearchSort[] = ["newest", "price_asc", "price_desc"];
const DEFAULT_SORT: SearchSort = "newest";

// Kategorin och dess underkategorier, t.ex. Dam med Klänningar och Jackor
function categoryWithChildren(categories: Category[], categoryId: number | null) {
  if (categoryId === null) return null;
  return categories
    .filter((c) => c.id === categoryId || c.parent_id === categoryId)
    .map((c) => c.id);
}

function sortProducts(products: Product[], sort: SearchSort) {
  return [...products].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function countBy(products: Product[], valueOf: (p: Product) => string): FacetValue[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const value = valueOf(product);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = Number(searchParams.get("category")) || null;
  const sortParam = searchParams.get("sort") as SearchSort;
  const filters: SearchFilters = {
    sort: SORTS.includes(sortParam) ? sortParam : DEFAULT_SORT,
    category: searchParams.get("sub") ?? "",
    condition: searchParams.get("condition") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
  };

  const { data: products, loading } = useApi((signal) => fetchProducts(signal), []);
  const { categories } = useCategories();

  function updateParams(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [name, value] of Object.entries(changes)) {
      const param = name === "category" ? "sub" : name;
      if (value) next.set(param, value);
      else next.delete(param);
    }
    if (next.get("sort") === DEFAULT_SORT) next.delete("sort");
    setSearchParams(next, { replace: true });
  }

  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "";

  const categoryIds = categoryWithChildren(categories, categoryId);
  const inCategory = (products ?? []).filter(
    (p) => !categoryIds || categoryIds.includes(p.category_id ?? -1),
  );

  const minPrice = Number(filters.minPrice) || 0;
  const maxPrice = Number(filters.maxPrice) || Infinity;
  const visibleProducts = sortProducts(
    inCategory.filter(
      (p) =>
        (!filters.category || categoryName(p.category_id) === filters.category) &&
        (!filters.condition || p.condition === filters.condition) &&
        p.price >= minPrice &&
        p.price <= maxPrice,
    ),
    filters.sort,
  );

  const facets = {
    category: countBy(inCategory, (p) => categoryName(p.category_id)),
    condition: countBy(inCategory, (p) => p.condition),
  };

  const heading = categoryName(categoryId) || "Alla plagg";

  return (
    <main>
      <section className="products-page section">
        <div className="container">
          <div className="products-page__header">
            <p className="eyebrow">Produkter</p>
            <h1>{heading}</h1>
          </div>

          <SearchFilterBar
            filters={filters}
            facets={facets}
            onChange={updateParams}
            onClear={() =>
              updateParams({ category: "", condition: "", minPrice: "", maxPrice: "", sort: "" })
            }
            sortOptions={SORTS}
            defaultSort={DEFAULT_SORT}
          />

          {loading ? (
            <ProductGridSkeleton />
          ) : visibleProducts.length === 0 ? (
            <EmptyState title="Inget här just nu">
              Inga plagg matchar filtren. Prova att ta bort något filter.
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
