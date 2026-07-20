import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllOrders, updateOrderStatus } from "../../api/client";
import type { Order, OrderStatus } from "../../types";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "ordered", label: "Beställd" },
  { value: "processing", label: "Behandlas" },
  { value: "shipped", label: "Skickad" },
  { value: "delivered", label: "Levererad" },
  { value: "refunded", label: "Återbetald" },
  { value: "cancelled", label: "Avbruten" },
];

interface OrderRowProps {
  order: Order;
  saving: boolean;
  onSave: (id: number, status: OrderStatus) => void;
}

function OrderRow({ order, saving, onSave }: OrderRowProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);

  return (
    <div className="admin-table__row" data-order-id={order.id}>
      <span>#{order.id}</span>
      <span>{order.full_name}</span>
      <span>{order.total} kr</span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option value={opt.value} key={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onSave(order.id, status)}
        disabled={saving}
      >
        {saving ? "Sparar..." : "Spara"}
      </button>
    </div>
  );
}

function AdminOrdersTable() {
    const { token } = useAuth();
    const [ orders, setOrders ] = useState<Order[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [savingId, setSavingId ] = useState<number | null>(null);
    const { showToast } = useToast();

    async function load() {
        setLoading(true);
        try {
            setOrders (await fetchAllOrders());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading (false);
        }
    }

    useEffect(() => {
        load();
    }, []);


    async function handleSave(orderId: number, status: OrderStatus) {
        if (!token) return;
        setSavingId(orderId);
        try {
          await updateOrderStatus(orderId, status, token);
          showToast(`Order #${orderId} uppdaterad!`);
        } catch (err) {
          console.error(err);
          showToast("Kunde inte uppdatera status.", "error");
        } finally {
          setSavingId(null);
        }
      }

      return (
        <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <p className="eyebrow">Ordrar</p>
            <h2>Senaste ordrar</h2>
          </div>
        </div>
  
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head">
            <span>Order</span>
            <span>Kund</span>
            <span>Total</span>
            <span>Status</span>
            <span>Åtgärd</span>
          </div>
  
          {loading ? (
            <p>Laddar ordrar...</p>
          ) : (
            orders.map((order) => (
              <OrderRow key={order.id} order={order} saving={savingId === order.id} onSave={handleSave} />
            ))
          )}
        </div>
      </section>
      );
}

export default AdminOrdersTable;
