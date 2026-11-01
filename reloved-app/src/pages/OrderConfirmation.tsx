import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchOrderConfirmation } from "../api/client";
import { useCart } from "../context/CartContext";
import { ORDER_STATUS_LABELS } from "../utils/orderStatus";
import type { OrderConfirmation as Confirmation } from "../types";
import { describeOrderShipping, formatDeliveryDate } from "../utils/shipping";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

const STATUS_MESSAGES: Partial<Record<Confirmation["status"], string>> = {
  pending:
    "Vi väntar på bekräftelse från betaltjänsten. Det brukar ta några sekunder.",
  paid: "Betalningen är bekräftad. Vi packar din beställning.",
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

  useEffect(() => {
    if (sessionId) clearCart().catch(console.error);
  }, [sessionId]);

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

  const status = order ? ORDER_STATUS_LABELS[order.status] : null;

  return (
    <main>
      <section className="confirmation-page section">
        <div className="container">
          {error && <p className="form-error">{error}</p>}

          {!error && !order && <p>Hämtar din order...</p>}

          {order && status && (
            <>
              <div className="confirmation-page__header">
                <p className="eyebrow">Order #{order.id}</p>
                <h1>
                  {order.status === "cancelled"
                    ? "Ordern är avbruten"
                    : `Tack för din beställning, ${order.first_name}!`}
                </h1>
                <span className={`status-badge ${status.className}`}>
                  {status.text}
                </span>
                <p>{STATUS_MESSAGES[order.status]}</p>
                {gaveUp && (
                  <p className="confirmation-page__hint">
                    Bekräftelsen dröjer. Du hittar ordern under Mina ordrar när
                    den är klar.
                  </p>
                )}
              </div>

              <div className="confirmation-page__summary">
                {order.items.map((item, index) => (
                  <div className="summary-row" key={index}>
                    <span>
                      {item.product_brand} – {item.product_name}
                      {item.quantity > 1 && ` × ${item.quantity}`}
                    </span>
                    <span>{item.line_total} kr</span>
                  </div>
                ))}
                <div className="summary-row">
                  <span>Frakt</span>
                  <span>
                    {order.shipping === 0 ? "Gratis" : `${order.shipping} kr`}
                  </span>
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
                  <span>{order.total} kr</span>
                </div>
              </div>

              <Link to="/products" className="button button-primary">
                Fortsätt handla
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default OrderConfirmation;
