import { fetchAllProducts, deleteProduct } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import type { Product } from "../../types";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  pending: { text: "Väntar", className: "status-badge--pending" },
  approved: { text: "Aktiv", className: "status-badge--paid" },
  rejected: { text: "Nekad", className: "status-badge--refunded" },
  sold: { text: "Såld", className: "status-badge--shipped" },
  archived: { text: "Arkiverad", className: "status-badge--pending" },
};

interface AdminProductsListProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

function AdminProductsList({ onEdit, refreshKey }: AdminProductsListProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(product: Product) {
    if (!token) return;
    const confirmed = window.confirm(
      `Ta bort "${product.name}"? Detta går inte att ångra.`,
    );
    if (!confirmed) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, token);
      showToast("Produkten togs bort.");
      load();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte ta bort produkten.", "error");
    } finally {
      setDeletingId(null);
    }
  }

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
    <details className="admin-section">
      <summary className="admin-section__header">
        <div>
          <p className="eyebrow">Produkter</p>
          <h2>Alla produkter</h2>
        </div>
      </summary>

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
          products.map((product) => {
            const status = STATUS_LABELS[product.status] ?? {
              text: product.status,
              className: "status-badge--pending",
            };

            return (
              <div
                className="admin-table__row"
                data-product-id={product.id}
                key={product.id}
              >
                <span>{product.name}</span>
                <span>{product.price} kr</span>
                <span className={`status-badge ${status.className}`}>
                  {status.text}
                </span>
                <div className="admin-actions">
                  <button type="button" onClick={() => onEdit(product)}>
                    Redigera
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? "Tar bort..." : "Ta bort"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </details>
  );
}

export default AdminProductsList;
