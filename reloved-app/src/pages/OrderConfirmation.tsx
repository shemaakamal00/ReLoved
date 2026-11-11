import { useEffect, useEffectEvent, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchOrderConfirmation } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { OrderConfirmation as Confirmation } from "../types";
import { formatKr, formatShippingPrice } from "../utils/format";
import { describeOrderShipping, formatDeliveryDate } from "../utils/shipping";
import { ORDER_STATUS_LABELS } from "../utils/statusLabels";
import StatusBadge from "../components/ui/StatusBadge";
import Checkmark from "../components/ui/Checkmark";
import Spinner from "../components/ui/Spinner";

const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 30;

const STATUS_MESSAGES: Partial<Record<Confirmation["status"], string>> = {
  pending: "Väntar på Stripe. Det brukar ta några sekunder.",
  paid: "Betalningen är klar. Du hittar ordern under Mina ordrar.",
  cancelled:
    "Betalningen slutfördes aldrig, så ordern är avbruten. Ingenting har dragits.",
};

function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Confirmation | null>(null);
  const [error, setError] = useState<string | null>(
    sessionId ? null : "Det saknas en betalningsreferens i adressen.",
  );
  const [gaveUp, setGaveUp] = useState(false);

  const { loading: authLoading } = useAuth();
  const clearCartOnce = useEffectEvent(() => clearCart().catch(console.error));
  useEffect(() => {
    if (sessionId && !authLoading) clearCartOnce();
  }, [sessionId, authLoading]);

  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();
    let polls = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const result = await fetchOrderConfirmation(
          sessionId,
          controller.signal,
        );
        setOrder(result);
        polls += 1;
        if (result.status === "pending") {
          if (polls < MAX_POLLS) timer = setTimeout(load, POLL_INTERVAL_MS);
          else setGaveUp(true);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Kunde inte hämta ordern:", err);
        setError(
          "Vi kunde inte hämta din order just nu. Ladda om sidan om en stund.",
        );
      }
    }
    load();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [sessionId]);

  return (
    <main>
      <section className="confirmation-page section">
        <div className="container">
          {error && <p className="form-error">{error}</p>}

          {!error && !order && (
            <p className="confirmation-page__loading">
              <Spinner /> Hämtar din order...
            </p>
          )}

          {order && (
            <>
              <div className="confirmation-page__header slide-up">
                {order.status !== "pending" && order.status !== "cancelled" && (
                  <Checkmark key="confirmed" />
                )}
                {order.status === "pending" && (
                  <span className="confirmation-page__pending">
                    <Spinner />
                  </span>
                )}
                <p className="eyebrow">Order #{order.id}</p>
                <h1>
                  {order.status === "cancelled"
                    ? "Ordern är avbruten"
                    : `Tack för din beställning, ${order.first_name}!`}
                </h1>
                <StatusBadge label={ORDER_STATUS_LABELS[order.status]} />
                <p>{STATUS_MESSAGES[order.status]}</p>
                {gaveUp && (
                  <p className="confirmation-page__hint">
                    Bekräftelsen dröjer. Du hittar ordern under Mina ordrar när
                    den är klar.
                  </p>
                )}
              </div>

              <div
                className="confirmation-page__summary slide-up"
                style={{ "--delay": "150ms" } as CSSProperties}
              >
                {order.items.map((item, index) => (
                  <div className="summary-row" key={index}>
                    <span>
                      {item.product_brand} – {item.product_name}
                      {item.size && `, stl ${item.size}`}
                      {item.quantity > 1 && ` × ${item.quantity}`}
                    </span>
                    <span>{formatKr(item.line_total)}</span>
                  </div>
                ))}
                <div className="summary-row">
                  <span>Frakt</span>
                  <span>{formatShippingPrice(order.shipping)}</span>
                </div>
                {describeOrderShipping(order) && (
                  <p className="order-shipping">
                    {describeOrderShipping(order)}
                    {order.service_point_address &&
                      `, ${order.service_point_address}`}
                    {order.estimated_delivery &&
                      ` · Beräknad leverans: ${formatDeliveryDate(order.estimated_delivery)}`}
                  </p>
                )}
                <div className="summary-row summary-row--total">
                  <span>Totalt</span>
                  <span>{formatKr(order.total)}</span>
                </div>
              </div>

              <Link to="/products" className="button button-primary">
                Se fler plagg
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default OrderConfirmation;
