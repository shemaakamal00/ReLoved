import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { startCheckout, fetchMyProfile } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart, type CartLine } from "../context/CartContext";
import { useShippingQuote } from "../hooks/useShippingQuote";
import type { ShippingMethod } from "../types";
import { lineKey, toCartPayload } from "../utils/cart";
import { formatKr, formatShippingPrice } from "../utils/format";
import { errorMessage } from "../utils/messages";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import ProductImage from "../components/product/ProductImage";
import ShippingPicker from "../components/checkout/ShippingPicker";
import FormMessage from "../components/ui/FormMessage";
import Spinner from "../components/ui/Spinner";

interface CustomerDetails {
  email: string;
  phone: string;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
}

function useCustomerDetails() {
  const { user, token } = useAuth();
  const [details, setDetails] = useState<CustomerDetails>({
    email: user?.email ?? "",
    phone: "",
    fullName: user ? `${user.first_name} ${user.last_name}` : "",
    address: "",
    postalCode: "",
    city: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchMyProfile(token)
      .then((profile) =>
        setDetails((current) => ({
          ...current,
          address: profile.address || current.address,
          postalCode: profile.postal_code || current.postalCode,
          city: profile.city || current.city,
        })),
      )
      .catch(console.error);
  }, [token]);

  function update(field: keyof CustomerDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  return { details, update };
}

function Checkout() {
  const { items } = useCart();
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";
  const { details, update } = useCustomerDetails();

  const [method, setMethod] = useState<ShippingMethod>("service_point");
  const [chosenServicePoint, setChosenServicePoint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanPostalCode = details.postalCode.replace(/\s/g, "");
  const hasPostalCode = /^\d{5}$/.test(cleanPostalCode);
  const shippingQuote = useShippingQuote(
    toCartPayload(items),
    hasPostalCode ? cleanPostalCode : undefined,
    { debounceMs: 500 },
  );
  const { quote } = shippingQuote;

  const servicePointId = quote?.servicePoints?.some(
    (p) => p.id === chosenServicePoint,
  )
    ? chosenServicePoint
    : "";

  const subtotal =
    quote?.subtotal ??
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping =
    quote?.options.find((o) => o.method === method)?.price ?? null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Varukorgen är tom.");
      return;
    }
    if (method === "service_point" && !servicePointId) {
      setError("Välj ett ombud, eller välj hemleverans.");
      return;
    }

    setSubmitting(true);
    try {
      const { url } = await startCheckout({
        email: details.email,
        phone: details.phone,
        full_name: details.fullName,
        address: details.address,
        postal_code: details.postalCode,
        city: details.city,
        items: toCartPayload(items),
        shipping_method: method,
        service_point_id:
          method === "service_point" ? servicePointId : undefined,
      });
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err, "Något gick fel, försök igen."));
      setSubmitting(false);
    }
  }

  const shownError = error ?? shippingQuote.error;

  return (
    <main>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Hem", to: "/" },
            { label: "Varukorg", to: "/cart" },
            { label: "Kassa" },
          ]}
        />

        <section className="checkout-page">
          <h1>Kassa</h1>

          {cancelled && (
            <p className="form-error">
              Betalningen avbröts. Ingenting har dragits och din varukorg finns
              kvar.
            </p>
          )}

          <div className="checkout-layout">
            <form
              className="checkout-form"
              id="checkout-form"
              onSubmit={handleSubmit}
            >
              <CheckoutCard title="Kontaktuppgifter">
                <TextField
                  label="E-post"
                  type="email"
                  value={details.email}
                  onChange={(v) => update("email", v)}
                />
                <TextField
                  label="Telefon"
                  type="tel"
                  value={details.phone}
                  onChange={(v) => update("phone", v)}
                />
              </CheckoutCard>

              <CheckoutCard title="Leveransadress">
                <TextField
                  label="För- och efternamn"
                  value={details.fullName}
                  onChange={(v) => update("fullName", v)}
                />
                <TextField
                  label="Adress"
                  value={details.address}
                  onChange={(v) => update("address", v)}
                />
                <div className="form-row">
                  <TextField
                    label="Postnummer"
                    value={details.postalCode}
                    onChange={(v) => update("postalCode", v)}
                  />
                  <TextField
                    label="Stad"
                    value={details.city}
                    onChange={(v) => update("city", v)}
                  />
                </div>
              </CheckoutCard>

              <CheckoutCard title="Leverans">
                <ShippingPicker
                  quote={quote}
                  loading={shippingQuote.loading}
                  hasPostalCode={hasPostalCode}
                  method={method}
                  servicePointId={servicePointId}
                  onMethodChange={setMethod}
                  onServicePointChange={setChosenServicePoint}
                />
              </CheckoutCard>

              <CheckoutCard title="Betalning">
                <p className="checkout-payment-note">
                  Du betalar säkert med kort hos Stripe. Ordern är betald först
                  när Stripe har bekräftat betalningen.
                </p>
              </CheckoutCard>

              {/* Växer fram mjukt i stället för att knuffa layouten */}
              <FormMessage message={shownError} />
            </form>

            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              submitting={submitting}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckoutCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="checkout-card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
}

function TextField({ label, value, onChange, type = "text" }: TextFieldProps) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}

interface OrderSummaryProps {
  items: CartLine[];
  subtotal: number;
  shipping: number | null;
  submitting: boolean;
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  submitting,
}: OrderSummaryProps) {
  return (
    <aside className="checkout-summary">
      <h2>Din order</h2>

      {items.map((item) => (
        <div className="checkout-product" key={lineKey(item)}>
          <ProductImage
            product={item.product}
            className="checkout-product__image"
          />
          <div>
            <h3>{item.product.name}</h3>
            <p>
              {[
                item.size && `Stl ${item.size}`,
                item.quantity > 1 && `${item.quantity} st`,
                formatKr(item.product.price * item.quantity),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      ))}

      <div className="summary-row">
        <span>Produkter</span>
        <span className="value-flash" key={subtotal}>
          {formatKr(subtotal)}
        </span>
      </div>
      <div className="summary-row">
        <span>Frakt</span>
        {/* key: frakten och totalen blinkar till när de räknas om */}
        <span className="value-flash" key={String(shipping)}>
          {shipping === null ? "–" : formatShippingPrice(shipping)}
        </span>
      </div>
      <div className="summary-row summary-row--total">
        <span>Totalt</span>
        <span className="value-flash" key={subtotal + (shipping ?? 0)}>
          {formatKr(subtotal + (shipping ?? 0))}
        </span>
      </div>

      <button
        type="submit"
        form="checkout-form"
        className="button button-primary"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting && <Spinner />}
        {submitting ? "Skickar dig till betalning..." : "Gå till betalning"}
      </button>
    </aside>
  );
}

export default Checkout;
