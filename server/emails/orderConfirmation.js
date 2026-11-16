// Orderbekräftelsen med mne, HTML och samma innehåll som ren text
import { STYLES } from "./styles.js";
import { emailLayout, escapeHtml, kr } from "./layout.js";

function itemName(item) {
  const size = item.size ? `, stl ${item.size}` : "";
  return `${item.product_brand} – ${item.product_name}${size}`;
}

export function orderConfirmation(order) {
  const firstName = order.full_name.split(" ")[0];
  const shipping = order.shipping === 0 ? "Gratis" : kr(order.shipping);

  // Produktnamn och märke escapas eftersom de skrivs av säljarna
  const rows = order.order_items
    .map(
      (item) => `
            <tr>
            <td style="${STYLES.cell}">${escapeHtml(itemName(item))}</td>
            <td style="${STYLES.cellCenter}">${item.quantity}</td>
            <td style="${STYLES.cellRight}">${kr(item.line_total)}</td>
          </tr>`,
    )
    .join("");

  const html = emailLayout({
    eyebrow: `Order #${order.id}`,
    heading: `Tack för din beställning, ${escapeHtml(firstName)}!`,
    content: `
            <p style="${STYLES.text}">Nedan följer en sammanfattning av din beställning.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${STYLES.table}">
              <tr>
                <th style="${STYLES.headLeft}">Produkt</th>
                <th style="${STYLES.headCenter}">Antal</th>
                <th style="${STYLES.headRight}">Pris</th>
              </tr>${rows}
              <tr>
                <td colspan="2" style="${STYLES.cell}">Frakt</td>
                <td style="${STYLES.cellRight}">${shipping}</td>
              </tr>
              <tr>
                <td colspan="2" style="${STYLES.total}">Totalt</td>
                <td style="${STYLES.totalRight}">${kr(order.total)}</td>
              </tr>
            </table>`,
  });

  // Till e-postprogram som inte visar HTML och för spamfilter
  const text = [
    `Tack för din beställning, ${firstName}!`,
    `Order #${order.id}`,
    "",
    ...order.order_items.map(
      (item) => `${itemName(item)}  ×${item.quantity}  ${kr(item.line_total)}`,
    ),
    `Frakt  ${shipping}`,
    `Totalt  ${kr(order.total)}`,
    "",
    "Betalningen är klar.",
    "ReLoved",
  ].join("/n");

  return { subject: `Orderbekräftelse #${order.id} från ReLoved`, html, text };
}
