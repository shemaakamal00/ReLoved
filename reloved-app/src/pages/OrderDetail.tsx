import { useParams } from "react-router-dom";
import { fetchOrderById } from "../api";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import type { OrderWithItems } from "../types";
import { formatDate, formatKr, formatShippingPrice } from "../utils/format";
import { describeOrderShipping, formatDeliveryDate } from "../utils/shipping";
import { ORDER_STATUS_LABELS } from "../utils/statusLabels";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import PageMessage from "../components/ui/PageMessage";
import StatusBadge from "../components/ui/StatusBadge";

function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const {
    data: order,
    loading,
    error,
  } = useApi((signal) => fetchOrderById(token!, id!, signal), [id, token], {
    enabled: Boolean(id && token),
  });

  if (loading) return <PageMessage>Laddar order...</PageMessage>;
  if (error || !order) {
    return <PageMessage>{error ?? "Ordern hittades inte."}</PageMessage>;
  }

  return (
    <main>
      <section className="orders-page">
        <Breadcrumbs
          items={[
            { label: "Hem", to: "/" },
            { label: "Mina ordrar", to: "/orders" },
            { label: `Order #${order.id}` },
          ]}
        />

        <div className="orders-header">
          <h1>{formatDate(order.created_at)}</h1>
          <StatusBadge label={ORDER_STATUS_LABELS[order.status]} />
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

        <ShippingCard order={order} />

        <div className="order-card">
          <h2>Produkter</h2>
          {order.items.map((item) => (
            <div className="order-product" key={item.id}>
              <span>
                {item.product_name}
                {item.size && `, stl ${item.size}`}
                {item.quantity > 1 && ` × ${item.quantity}`}
              </span>
              <span>{item.product_brand}</span>
              <span>{formatKr(item.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="order-card">
          <div className="summary-row">
            <span>Produkter</span>
            <span>{formatKr(order.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Frakt</span>
            <span>{formatKr(order.shipping)}</span>
          </div>
          <div className="summary-row summary-row--total">
            <span>Totalt</span>
            <span>{formatKr(order.total)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShippingCard({ order }: { order: OrderWithItems }) {
  const description = describeOrderShipping(order);
  if (!description) return null;

  return (
    <div className="order-card">
      <h2>Frakt</h2>
      <p>{description}</p>
      {order.service_point_address && <p>{order.service_point_address}</p>}
      <p>Fraktpris: {formatShippingPrice(order.shipping)}</p>
      {order.estimated_delivery && (
        <p>Beräknad leverans: {formatDeliveryDate(order.estimated_delivery)}</p>
      )}
    </div>
  );
}

export default OrderDetail;
