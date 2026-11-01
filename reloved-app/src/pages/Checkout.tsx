import { useState, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { startCheckout, fetchMyProfile } from "../api/client";
import ProductImage from "../components/ProductImage";

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

  const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);
  const shipping = subtotal > 0 ? 49 : 0;
  const total = subtotal + shipping;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Din varukorg är tom.");
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
                <span>{shipping} kr</span>
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
