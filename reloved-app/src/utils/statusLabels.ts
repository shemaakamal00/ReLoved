// Text och färg (CSS-klass) för statusbrickor.
import type { OrderStatus, ProductStatus } from "../types";

export interface StatusLabel {
  text: string;
  className: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, StatusLabel> = {
  pending: { text: "Väntar på betalning", className: "status-badge--pending" },
  paid: { text: "Betald", className: "status-badge--paid" },
  ordered: { text: "Beställd", className: "status-badge--pending" },
  processing: { text: "Behandlas", className: "status-badge--pending" },
  shipped: { text: "Skickad", className: "status-badge--shipped" },
  delivered: { text: "Levererad", className: "status-badge--paid" },
  refunded: { text: "Återbetald", className: "status-badge--refunded" },
  cancelled: { text: "Avbruten", className: "status-badge--refunded" },
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, StatusLabel> = {
  pending: { text: "Väntar", className: "status-badge--pending" },
  approved: { text: "Aktiv", className: "status-badge--paid" },
  rejected: { text: "Nekad", className: "status-badge--refunded" },
  sold: { text: "Såld", className: "status-badge--shipped" },
  archived: { text: "Arkiverad", className: "status-badge--pending" },
};
