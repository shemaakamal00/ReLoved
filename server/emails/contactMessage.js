// Meddelandet från kontaktformuläret
import { STYLES } from "./styles.js";
import { emailLayout, escapeHtml } from "./layout.js";

export function contactMessageEmail({ name, email, subject, message }) {
  const body = escapeHtml(message).replaceAll("/n", "<br>");

  const html = emailLayout({
    eyebrow: "Kontaktformuläret",
    heading: escapeHtml(subject),
    content: `
          <p style="${STYLES.text}">${body}</p>
          <p style="${STYLES.small}">Från ${escapeHtml(name)} (${escapeHtml(email)}). Svara på mejlet för att svara kunden.</p>`,
  });

  const text = [
    `Från: ${name} <${email}>`,
    `Ämne: ${subject}`,
    "",
    message,
  ].join("\n");

  return { subject: `Kontakt: ${subject}`, html, text };
}
