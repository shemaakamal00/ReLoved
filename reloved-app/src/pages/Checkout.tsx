import { useState, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  startCheckout,
  fetchMyProfile,
  fetchShippingQuote,
} from "../api/client";
import ProductImage from "../components/product/ProductImage";
import ShippingPicker from "../components/checkout/ShippingPicker";
import type { ShippingMethod, ShippingQuote } from "../types";

function Checkout() {
  const { items } = useCart();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";

  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState(
    user ? `${user.first_name} ${user.last_name}` : "",
  );
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchMyProfile(token)
      .then((profile) => {
        if (profile.address) setAddress(profile.address);
        if (profile.postal_code) setPostalCode(profile.postal_code);
        if (profile.city) setCity(profile.city);
      })
      .catch(console.error);
  }, [token]);

  const [method, setMethod] = useState<ShippingMethod>("service_point");
  const [servicePointId, setServicePointId] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const cleanPostalCode = postalCode.replace(/\s/g, "");
  const hasPostalCode = /^\d{5}$/.test(cleanPostalCode);
  const cartKey = items.map((item) => item.product_id).join(",");

  useEffect(() => {
    if (items.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const result = await fetchShippingQuote(
          {
            postal_code: hasPostalCode ? cleanPostalCode : undefined,
            items: items.map((item) => ({
              product_id: item.product_id,
              quantity: 1,
            })),
          },
          controller.signal,
        );
        setQuote(result);
        setServicePointId((current) =>
          result.servicePoints?.some((p) => p.id === current) ? current : "",
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Kunde inte hämta frakt:", err);
        setError(
          err instanceof Error ? err.message : "Kunde inte hämta frakten.",
        );
      } finally {
        if (!controller.signal.aborted) setQuoteLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [cleanPostalCode, cartKey]);

  const subtotal =
    quote?.subtotal ?? items.reduce((sum, item) => sum + item.product.price, 0);
  const shipping =
    quote?.options.find((option) => option.method === method)?.price ?? null;
  const total = subtotal + (shipping ?? 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Din varukorg är tom.");
      return;
    }
    if (method === "service_point" && !servicePointId) {
      setError("Välj ett ombud, eller välj hemleverans.");
      return;
    }

    setSubmitting(true);
    try {
      const { url } = await startCheckout({
        email,
        phone,
        full_name: fullName,
        address,
        postal_code: postalCode,
        city,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: 1,
        })),
        shipping_method: method,
        service_point_id:
          method === "service_point" ? servicePointId : undefined,
      });
      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="container">
        <nav className="breadcrumbs" aria-label="Brödsmulor">
          <Link to="/">Hem</Link>
          <span>/</span>
          <Link to="/cart">Varukorg</Link>
          <span>/</span>
          <span>Kassa</span>
        </nav>

        <section className="checkout-page">
          <h1>Kassan</h1>

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
              <div className="checkout-card">
                <h2>Kontaktuppgifter</h2>
                <label>
                  E-post
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Telefon
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="checkout-card">
                <h2>Leveransadress</h2>
                <label>
                  För- och efternamn
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Adress
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    Postnummer
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Stad
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="checkout-card">
                <h2>Leverans</h2>
                <ShippingPicker
                  quote={quote}
                  loading={quoteLoading}
                  hasPostalCode={hasPostalCode}
                  method={method}
                  servicePointId={servicePointId}
                  onMethodChange={setMethod}
                  onServicePointChange={setServicePointId}
                />
              </div>

              <div className="checkout-card">
                <h2>Betalning</h2>
                <p className="checkout-payment-note">
                  Du betalar säkert med kort hos Stripe. Ordern är betald först
                  när Stripe har bekräftat betalningen.
                </p>
              </div>

              {error && <p className="form-error">{error}</p>}
            </form>

            <aside className="checkout-summary">
              <h2>Din order</h2>

              {items.map((item) => (
                <div className="checkout-product" key={item.product_id}>
                  <ProductImage
                    product={item.product}
                    className="checkout-product__image"
                  />
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>{item.product.price} kr</p>
                  </div>
                </div>
              ))}

              <div className="summary-row">
                <span>Produkter</span>
                <span>{subtotal} kr</span>
              </div>
              <div className="summary-row">
                <span>Frakt</span>
                <span>
                  {shipping === null
                    ? "–"
                    : shipping === 0
                      ? "Gratis"
                      : `${shipping} kr`}
                </span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Totalt</span>
                <span>{total} kr</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="button button-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Skickar dig till betalning..."
                  : "Gå till betalning"}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Checkout;
