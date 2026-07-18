import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchOrders } from "../api/client";
import type { Order, OrderStatus } from "../types";

const STATUS_LABELS: Record<OrderStatus, { text: string; className: string }> =
  {
    ordered: { text: "Beställd", className: "status-badge--pending" },
    processing: { text: "Behandlas", className: "status-badge--pending" },
    shipped: { text: "Skickad", className: "status-badge--shipped" },
    delivered: { text: "Levererad", className: "status-badge--paid" },
    refunded: { text: "Återbetald", className: "status-badge--refunded" },
    cancelled: { text: "Avbruten", className: "status-badge--refunded" },
  };

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchOrders(user.email)
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <main>
        <section className="orders-page section">
          <div className="container">
            <h1>Mina ordrar</h1>
            <p>
              <Link to="/login">Logga in</Link> för att se dina tidigare
              beställningar.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="orders-page section">
        <div className="container">
          <div className="orders-header">
            <p className="eyebrow">Mitt konto</p>
            <h1>Mina ordrar</h1>
            <p>Här ser du dina köp, leveranser och tidigare beställningar.</p>
          </div>

          <div className="orders-list">
            {loading ? (
              <p>Laddar ordrar...</p>
            ) : orders.length === 0 ? (
              <p>Du har inga ordrar än.</p>
            ) : (
              orders.map((order) => {
                const status = STATUS_LABELS[order.status];
                return (
                  <article
                    className="order-card"
                    data-order-id={order.id}
                    key={order.id}
                  >
                    <div className="order-card__top">
                      <div>
                        <p className="eyebrow">Order #{order.id}</p>
                        <h2>
                          {new Date(order.created_at).toLocaleDateString(
                            "sv-SE",
                          )}
                        </h2>
                      </div>
                      <span className={`status-badge ${status.className}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="order-card__bottom">
                      <span>Totalt: {order.total} kr</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Orders;
