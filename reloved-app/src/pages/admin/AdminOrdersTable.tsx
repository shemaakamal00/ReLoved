import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import { useTemporaryFlag } from "../../hooks/useTemporaryFlag";
import type { Order, OrderStatus } from "../../types";
import { formatKr } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../utils/statusLabels";
import PanelSection from "../../components/ui/PanelSection";
import TableSkeleton from "../../components/ui/TableSkeleton";

const AUTOMATIC_STATUSES: OrderStatus[] = ["pending", "paid", "ordered"];
const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as OrderStatus,
    label: label.text,
    disabled: AUTOMATIC_STATUSES.includes(value as OrderStatus),
  }),
);

function AdminOrdersTable() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [savingId, setSavingId] = useState<number | null>(null);
  const { data: orders, loading } = useApi(
    (signal) => fetchAllOrders(token!, signal),
    [token],
    { enabled: Boolean(token) },
  );

  async function handleSave(orderId: number, status: OrderStatus) {
    if (!token) return false;
    setSavingId(orderId);
    try {
      await updateOrderStatus(token, orderId, status);
      showToast(`Order #${orderId} uppdaterad!`);
      return true;
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera status.", "error");
      return false;
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PanelSection variant="admin" eyebrow="Ordrar" title="Senaste ordrar">
      <div className="admin-table">
        <div className="admin-table__row admin-table__row--head">
          <span>Order</span>
          <span>Kund</span>
          <span>Total</span>
          <span>Status</span>
          <span>Åtgärd</span>
        </div>

        {loading ? (
          <TableSkeleton label="Laddar ordrar..." />
        ) : (
          (orders ?? []).map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              saving={savingId === order.id}
              onSave={handleSave}
            />
          ))
        )}
      </div>
    </PanelSection>
  );
}

interface OrderRowProps {
  order: Order;
  saving: boolean;
  onSave: (id: number, status: OrderStatus) => Promise<boolean>;
}

function OrderRow({ order, saving, onSave }: OrderRowProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [justSaved, markSaved] = useTemporaryFlag(1800);

  async function handleSave() {
    if (await onSave(order.id, status)) markSaved();
  }

  return (
    <div
      className={`admin-table__row ${justSaved ? "is-saved" : ""}`}
      data-order-id={order.id}
    >
      <span>#{order.id}</span>
      <span>{order.full_name}</span>
      <span>{formatKr(order.total)}</span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option value={opt.value} key={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="admin-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Sparar..." : justSaved ? "Sparat ✓" : "Spara"}
        </button>
        <Link to={`/orders/${order.id}`}>Visa</Link>
      </div>
    </div>
  );
}

export default AdminOrdersTable;
