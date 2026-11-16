// Eftersom e-postprogramet ignorerar CSS filerna och oftast <style>
// så sätts stilarna in direkt på varje element när mejlet byggs. (layout.js)

const COLORS = {
  bg: "#f5f3ee",
  surface: "#ffffff",
  ink: "#161514",
  onInk: "#f5f3ee",
  muted: "#77726a",
  line: "#e3ddd3",
};

const CELL = `padding:10px 0;border-bottom:1px solid ${COLORS.line}`;
const TOTAL = "padding:14px 0;font-weight:bold";

export const STYLES = {
  // Ramen
  body: `margin:0;background:${COLORS.bg};font-family:Arial,sans-serif;color:${COLORS.ink}`,
  outer: "padding:32px 16px",
  card: `max-width:560px;background:${COLORS.surface};border-radius:12px;padding:32px`,
  footer: `margin:24px 0 0;font-size:13px;color:${COLORS.muted}`,

  // Text
  eyebrow: `margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.muted}`,
  heading: "margin:0 0 12px;font-size:24px",
  text: "margin:0 0 24px;line-height:1.5",
  small: `margin:0;font-size:13px;line-height:1.5;color:${COLORS.muted}`,

  // Knappen
  button: `display:inline-block;padding:14px 28px;background:${COLORS.ink};color:${COLORS.onInk};border-radius:999px;text-decoration:none;font-weight:bold`,

  // Tabeller
  table: "font-size:14px",
  headLeft: `${CELL};text-align:left`,
  headCenter: `${CELL};text-align:center`,
  headRight: `${CELL};text-align:right`,
  cell: CELL,
  cellCenter: `${CELL};text-align:center`,
  cellRight: `${CELL};text-align:right`,
  total: TOTAL,
  totalRight: `${TOTAL};text-align:right`,
};
