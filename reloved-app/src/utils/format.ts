// Formateringsfunktioner för priser, datumn och namn

export function formatKr(amount: number): string {
  return `${amount} kr`;
}

export function formatShippingPrice(amount: number): string {
  return amount === 0 ? "Gratis" : formatKr(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
