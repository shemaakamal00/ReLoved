// Mejlet med länken för att välja ett nytt lösenord
import { STYLES } from "./styles.js";
import { emailLayout, escapeHtml } from "./layout.js";

export function passwordResetEmail({ firstName, link, minutes }) {
  const html = emailLayout({
    eyebrow: "Lösenord",
    heading: `Hej ${escapeHtml(firstName)}!`,
    content: `
        <p style="${STYLES.text}">Vi har fått en förfrågan om att återställa lösenordet till ditt konto på ReLoved. Länken gäller i ${minutes} minuter och kan bara användas en gång.</p>
        <p style="${STYLES.text}"><a href="${escapeHtml(link)}" style="${STYLES.button}">Välj nytt lösenord</a></p>
        <p style="${STYLES.small}">Har du inte bett om det här kan du strunta i mejlet. Ditt lösenord ändras inte.</p>`,
  });

  const text = [
    `Hej ${firstName}!`,
    "",
    "Vi har fått en förfrågan om att återställa lösenordet till ditt konto på ReLoved.",
    `Öppna länken för att välja ett nytt lösenord. Den gäller i ${minutes} minuter och kan bara användas en gång:`,
    link,
    "",
    "Har du inte bett om det här kan du strunta i mejlet. Ditt lösenord ändras inte.",
  ].join("\n");

  return { subject: "Återställ ditt lösenord på ReLoved", html, text };
}
