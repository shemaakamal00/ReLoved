import { Link } from "react-router-dom";
import { fetchOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { formatDate, formatKr } from "../utils/format";
import { ORDER_STATUS_LABELS } from "../utils/statusLabels";
import StatusBadge from "../components/ui/StatusBadge";
import TableSkeleton from "../components/ui/TableSkeleton";

function Orders() {
  const { user } = useAuth();
  const { data: orders, loading } = useApi(
    (signal) => fetchOrders(signal),
    [user],
    { enabled: Boolean(user) },
  );

  return (
    <main>
      <section className="orders-page section">
        <div className="container">
          <div className="orders-header">
            <p className="eyebrow">Mina sidor</p>
            <h1>Mina ordrar</h1>
          </div>

          <div className="orders-list">
            {loading ? (
              <TableSkeleton label="Laddar ordrar..." />
            ) : !orders || orders.length === 0 ? (
              <p>
                Inga köp än. <Link to="/products">Se alla plagg</Link>
              </p>
            ) : (
              orders.map((order) => (
                <article
                  className="order-card"
                  data-order-id={order.id}
                  key={order.id}
                >
                  <div className="order-card__top">
                    <div>
                      <p className="eyebrow">Order #{order.id}</p>
                      <h2>{formatDate(order.created_at)}</h2>
                    </div>
                    <StatusBadge label={ORDER_STATUS_LABELS[order.status]} />
                  </div>

                  <div className="order-card__bottom">
                    <span>Totalt: {formatKr(order.total)}</span>
                    <Link to={`/orders/${order.id}`}>Visa detaljer</Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Orders;
