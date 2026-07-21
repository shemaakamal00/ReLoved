import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchMySales } from "../../api/client";
import type { SellerOrderItem } from "../../types";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  ordered: { text: "Beställd", className: "status-badge--pending" },
  processing: { text: "Behandlas", className: "status-badge--pending" },
  shipped: { text: "Skickad", className: "status-badge--shipped" },
  delivered: { text: "Levererad", className: "status-badge--paid" },
  refunded: { text: "Återbetald", className: "status-badge--refunded" },
  cancelled: { text: "Avbruten", className: "status-badge--refunded" },
};

function MySales() {
  const { token } = useAuth();
  const [sales, setSales] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!token) return;
    fetchMySales(token)
      .then(setSales)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="seller-section">
      <div className="seller-section__header">
        <div>
          <p className="eyebrow">Försäljningar</p>
          <h2>Senaste försäljningar</h2>
        </div>
      </div>

      <div className="seller-table">
        <div className="seller-table__row seller-table__row--head">
          <span>Order</span>
          <span>Produkt</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {loading ? (
          <p>Laddar försäljningar...</p>
        ) : sales.length === 0 ? (
          <p>Inga försäljningar än.</p>
        ) : (
          sales.map((item) => {
            const status = STATUS_LABELS[item.orders.status];
            return (
              <div
                className="seller-table__row"
                data-order-id={item.orders.id}
                key={item.id}
              >
                <span>#{item.orders.id}</span>
                <span>{item.product_name}</span>
                <span>{item.line_total} kr</span>
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

export default MySales;
