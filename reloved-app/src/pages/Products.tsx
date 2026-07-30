import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../api/client";
import type { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";

function Products() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(
    "newest",
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const searchQuery = searchParams.get("search")?.toLowerCase() ?? "";

  const matchingCategoryIds = categoryId
    ? categories
        .filter(
          (c) =>
            c.id === Number(categoryId) || c.parent_id === Number(categoryId),
        )
        .map((c) => c.id)
    : null;

  const filteredProducts = products
    .filter((p) =>
      matchingCategoryIds
        ? matchingCategoryIds.includes(p.category_id ?? -1)
        : true,
    )
    .filter((p) =>
      searchQuery
        ? p.name.toLowerCase().includes(searchQuery) ||
          p.brand.toLowerCase().includes(searchQuery)
        : true,
    );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeCategory = categories.find((c) => c.id === Number(categoryId));

  return (
    <main>
      <section className="products-page section">
        <div className="container">
          <div className="products-page__header">
            <p className="eyebrow">Produkter</p>
            <h1>
              {searchQuery
                ? `Sökresultat för "${searchQuery}"`
                : activeCategory
                  ? activeCategory.name
                  : "Alla produkter"}
            </h1>
          </div>

          <div className="products-toolbar">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="newest">Nyast först</option>
              <option value="price-asc">Lägst pris</option>
              <option value="price-desc">Högst pris</option>
            </select>
          </div>

          {loading ? (
            <p>Laddar produkter...</p>
          ) : sortedProducts.length === 0 ? (
            <p>Inga produkter hittades i den här kategorin.</p>
          ) : (
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Products;
