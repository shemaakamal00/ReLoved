import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllProducts } from "../../api/client";
import type { Product } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Väntar",
  approved: "Aktiv",
  rejected: "Nekad",
  sold: "Såld",
  archived: "Arkiverad",
};

interface AdminProductsListProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

function AdminProductsList({ onEdit, refreshKey }: AdminProductsListProps) {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetchAllProducts(token)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="eyebrow">Produkter</p>
          <h2>Alla produkter</h2>
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-table__row admin-table__row--head">
          <span>Produkt</span>
          <span>Pris</span>
          <span>Status</span>
          <span>Åtgärd</span>
        </div>

        {loading ? (
          <p>Laddar produkter...</p>
        ) : (
          products.map((product) => (
            <div
              className="admin-table__row"
              data-product-id={product.id}
              key={product.id}
            >
              <span>{product.name}</span>
              <span>{product.price} kr</span>
              <span className="status-badge status-badge--pending">
                {STATUS_LABELS[product.status] ?? product.status}
              </span>
              <button type="button" onClick={() => onEdit(product)}>
                Redigera
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminProductsList;
