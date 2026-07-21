import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyListings } from "../../api/client";
import type { Product } from "../../types";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  pending: { text: "Väntar", className: "status-badge--pending" },
  approved: { text: "Aktiv", className: "status-badge--paid" },
  rejected: { text: "Nekad", className: "status-badge--refunded" },
  sold: { text: "Såld", className: "status-badge--shipped" },
  archived: { text: "Arkiverad", className: "status-badge--pending" },
};

function MyListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchMyListings(token)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

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
        </div>

        {loading ? (
          <p>Laddar dina annonser...</p>
        ) : listings.length === 0 ? (
          <p>Du har inga annonser än.</p>
        ) : (
          listings.map((product) => {
            const status = STATUS_LABELS[product.status];
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
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default MyListings;
