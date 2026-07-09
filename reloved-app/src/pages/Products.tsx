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

  const filteredProducts = categoryId
    ? products.filter((p) => p.category_id === Number(categoryId))
    : products;

  const activeCategory = categories.find((c) => c.id === Number(categoryId));

  return (
    <main>
      <section className="products-page section">
        <div className="container">
          <div className="page-header">
            <p className="eyebrow">Produkter</p>
            <h1>{activeCategory ? activeCategory.name : "Alla produkter"}</h1>
          </div>

          {loading ? (
            <p>Laddar produkter...</p>
          ) : filteredProducts.length === 0 ? (
            <p>Inga produkter hittades i den här kategorin.</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
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
