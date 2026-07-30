import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchOrderById } from "../api/client";
import type { OrderWithItems, OrderStatus } from "../types";

const STATUS_LABELS: Record<OrderStatus, { text: string; className: string }> =
  {
    ordered: { text: "Beställd", className: "status-badge--pending" },
    processing: { text: "Behandlas", className: "status-badge--pending" },
    shipped: { text: "Skickad", className: "status-badge--shipped" },
    delivered: { text: "Levererad", className: "status-badge--paid" },
    refunded: { text: "Återbetald", className: "status-badge--refunded" },
    cancelled: { text: "Avbruten", className: "status-badge--refunded" },
  };

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    fetchOrderById(Number(id), token)
      .then(setOrder)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Kunde inte hämta ordern",
        ),
      )
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading)
    return (
      <main>
        <p>Laddar order...</p>
      </main>
    );
  if (error || !order)
    return (
      <main>
        <p>{error ?? "Ordern hittades inte."}</p>
      </main>
    );

  const status = STATUS_LABELS[order.status];

  return (
    <main>
      <section className="orders-page">
        <nav className="breadcrumbs" aria-label="Brödsmulor">
          <Link to="/">Hem</Link>
          <span>/</span>
          <Link to="/orders">Mina ordrar</Link>
          <span>/</span>
          <span>Order #{order.id}</span>
        </nav>

        <div className="orders-header">
          <h1>{new Date(order.created_at).toLocaleDateString("sv-SE")}</h1>
          <span className={`status-badge ${status.className}`}>
            {status.text}
          </span>
        </div>

        <div className="order-card">
          <h2>Leveransadress</h2>
          <p>{order.full_name}</p>
          <p>{order.address}</p>
          <p>
            {order.postal_code} {order.city}
          </p>
          <p>
            {order.email} · {order.phone}
          </p>
        </div>

        <div className="order-card">
          <h2>Produkter</h2>
          {order.items.map((item) => (
            <div className="order-product" key={item.id}>
              <span>{item.product_name}</span>
              <span>{item.product_brand}</span>
              <span>{item.line_total} kr</span>
            </div>
          ))}
        </div>

        <div className="order-card">
          <div className="summary-row">
            <span>Produkter</span>
            <span>{order.subtotal} kr</span>
          </div>
          <div className="summary-row">
            <span>Frakt</span>
            <span>{order.shipping} kr</span>
          </div>
          <div className="summary-row summary-row--total">
            <span>Totalt</span>
            <span>{order.total} kr</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OrderDetail;
