import type { ShippingMethod, ShippingQuote } from "../../types";
import { formatDeliveryDate } from "../../utils/shipping";

interface ShippingPickerProps {
  quote: ShippingQuote | null;
  loading: boolean;
  hasPostalCode: boolean;
  method: ShippingMethod;
  servicePointId: string;
  onMethodChange: (method: ShippingMethod) => void;
  onServicePointChange: (id: string) => void;
}

function ShippingPicker({
  quote,
  loading,
  hasPostalCode,
  method,
  servicePointId,
  onMethodChange,
  onServicePointChange,
}: ShippingPickerProps) {
  if (!quote) {
    return (
      <p className="shipping-hint">
        {loading ? "Hämtar fraktalternativ..." : "Fraktalternativen visas här."}
      </p>
    );
  }

  const left = quote.freeShippingFrom - quote.subtotal;

  return (
    <div className="shipping-picker">
      {left > 0 ? (
        <p className="shipping-hint">
          Fri frakt när du handlar för {quote.freeShippingFrom} kr. Du har{" "}
          {left} kr kvar.
        </p>
      ) : (
        <p className="shipping-hint shipping-hint--free">
          Du har fri frakt! 🎉
        </p>
      )}

      {quote.options.map((option) => (
        <label
          className={`shipping-option ${method === option.method ? "is-selected" : ""}`}
          key={option.method}
        >
          <input
            type="radio"
            name="shipping_method"
            value={option.method}
            checked={method === option.method}
            onChange={() => onMethodChange(option.method)}
          />
          <span className="shipping-option__text">
            <strong>{option.label}</strong>
            <small>
              {option.estimatedDelivery
                ? `Beräknad leverans: ${formatDeliveryDate(option.estimatedDelivery)}`
                : hasPostalCode
                  ? "Leveranstiden kunde inte hämtas från PostNord just nu"
                  : "Ange postnummer för att se beräknad leverans"}
            </small>
          </span>
          <span className="shipping-option__price">
            {option.price === 0 ? "Gratis" : `${option.price} kr`}
          </span>
        </label>
      ))}

      {method === "service_point" && (
        <fieldset className="service-points">
          <legend>Välj ombud</legend>
          {!hasPostalCode && (
            <p className="shipping-hint">
              Ange ditt postnummer ovan, så visas ombuden närmast dig.
            </p>
          )}
          {hasPostalCode && loading && (
            <p className="shipping-hint">Hämtar ombud från PostNord...</p>
          )}
          {quote.servicePointsError && (
            <p className="form-error">{quote.servicePointsError}</p>
          )}
          {quote.servicePoints?.map((point) => (
            <label className="service-point" key={point.id}>
              <input
                type="radio"
                name="service_point_id"
                value={point.id}
                checked={servicePointId === point.id}
                onChange={() => onServicePointChange(point.id)}
              />
              <span>
                <strong>{point.name}</strong>
                <small>
                  {point.address}
                  {point.distanceMeters !== null &&
                    ` · ${(point.distanceMeters / 1000).toFixed(1).replace(".", ",")} km`}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}

export default ShippingPicker;
