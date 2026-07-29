import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchMyListings, deleteMyListing } from "../../api/client";
import type { Product } from "../../types";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  pending: { text: "Väntar", className: "status-badge--pending" },
  approved: { text: "Aktiv", className: "status-badge--paid" },
  rejected: { text: "Nekad", className: "status-badge--refunded" },
  sold: { text: "Såld", className: "status-badge--shipped" },
  archived: { text: "Arkiverad", className: "status-badge--pending" },
};

interface MyListingsProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

function MyListings({ onEdit, refreshKey }: MyListingsProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetchMyListings(token)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleDelete(product: Product) {
    if (!token) return;
    if (!window.confirm(`Ta bort annonsen "${product.name}"?`)) return;

    try {
      await deleteMyListing(product.id, token);
      showToast("Annonsen är borttagen.");
      load();
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : "Kunde inte ta bort annonsen.",
        "error",
      );
    }
  }

  return (
    <section className="seller-section">
      <div className="seller-section__header">
        <div>
          <p className="eyebrow">Mina annonser</p>
          <h2>Upplagda produkter</h2>
        </div>
      </div>

      <div className="seller-table">
        <div className="seller-table__row seller-table__row--head">
          <span>Produkt</span>
          <span>Pris</span>
          <span>Status</span>
          <span>Åtgärd</span>
        </div>

        {loading ? (
          <p>Laddar dina annonser...</p>
        ) : listings.length === 0 ? (
          <p>Du har inga annonser än.</p>
        ) : (
          listings.map((product) => {
            const status = STATUS_LABELS[product.status];
            const isSold = product.status === "sold";

            return (
              <div
                className="seller-table__row"
                data-listing-id={product.id}
                key={product.id}
              >
                <span>{product.name}</span>
                <span>{product.price} kr</span>
                <span className={`status-badge ${status.className}`}>
                  {status.text}
                </span>
                <div className="seller-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    disabled={isSold}
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={isSold}
                  >
                    Ta bort
                  </button>
                </div>
                {product.status === "rejected" && product.rejection_reason && (
                  <span className="rejection-reason">
                    {product.rejection_reason}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default MyListings;
