import type { OrderStatus } from "../types";

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { text: string; className: string }
> = {
  pending: { text: "Väntar på betalning", className: "status-badge--pending" },
  paid: { text: "Betald", className: "status-badge--paid" },
  ordered: { text: "Beställd", className: "status-badge--pending" },
  processing: { text: "Behandlas", className: "status-badge--pending" },
  shipped: { text: "Skickad", className: "status-badge--shipped" },
  delivered: { text: "Levererad", className: "status-badge--paid" },
  refunded: { text: "Återbetald", className: "status-badge--refunded" },
  cancelled: { text: "Avbruten", className: "status-badge--refunded" },
};
