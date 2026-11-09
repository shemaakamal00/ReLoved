import {
  CURRENCIES,
  useCurrency,
  type CurrencyCode,
} from "../../context/CurrencyContext";

function CurrencySelect() {
  const { currency, setCurrency, status, ratesDate } = useCurrency();
  const title =
    status === "error"
      ? "Valutakurser är inte tillgängliga just nu, priser visas i SEK"
      : ratesDate
        ? `Kurser från ${ratesDate}`
        : "Hämtar valutakurser...";

  return (
    <div className="currency-select">
      <label className="sr-only" htmlFor="currency">
        Valuta
      </label>
      <select
        id="currency"
        className="currency-select__input"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        disabled={status !== "ready"}
        title={title}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
export default CurrencySelect;
