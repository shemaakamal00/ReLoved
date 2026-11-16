// Ramen för shoppens mejl, och hjälpfunktioner för innehåller
import { STYLES } from "./styles.js";

// Kundens och säljarens text blir alltid text, aldrig HTML
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function kr(amount) {
  return `${amount.toLocaleString("sv-SE")} kr`;
}

export function emailLayout({ eyebrow, heading, content }) {
  return `<!doctype html>
  <html lang="sv">
  <body style="${STYLES.body}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="${STYLES.outer}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${STYLES.card}">
          <tr><td>
            <p style="${STYLES.eyebrow}">${eyebrow}</p>
            <h1 style="${STYLES.heading}">${heading}</h1>
            ${content}
            <p style="${STYLES.footer}">ReLoved – älskat tidigare, älskat igen.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
