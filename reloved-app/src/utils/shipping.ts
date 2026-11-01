import type { OrderShipping } from "../types";

export function formatDeliveryDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
  return `${weekday} ${date.getDate()}/${date.getMonth() + 1}`;
}

export function describeOrderShipping(order: OrderShipping): string | null {
  if (order.shipping_method === "service_point") {
    return `PostNord – ombud: ${order.service_point_name ?? ""}`;
  }
  if (order.shipping_method === "home") return "PostNord – hemleverans";
  return null;
}
