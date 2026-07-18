import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/client";

function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState(
    user ? `${user.first_name} ${user.last_name}` : "",
  );
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [payment, setPayment] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
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
      const order = await createOrder({
        email,
        phone,
        full_name: fullName,
        address,
        postal_code: postalCode,
        city,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      await clearCart();
      navigate("/orders", { state: { justOrderedId: order.id } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="checkout-page">
        <h1>Kassan</h1>

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
              <h2>Betalsätt</h2>

              <label className="radio-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={payment === "card"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                Kort
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="payment"
                  value="swish"
                  checked={payment === "swish"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                Swish
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="payment"
                  value="klarna"
                  checked={payment === "klarna"}
                  onChange={(e) => setPayment(e.target.value)}
                />
                Klarna
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}
          </form>

          <aside className="checkout-summary">
            <h2>Din order</h2>

            {items.map((item) => (
              <div className="checkout-product" key={item.product_id}>
                <img
                  src={item.product.image_url ?? ""}
                  alt={item.product.alt_text ?? item.product.name}
                />
                <div>
                  <h3>{item.product.name}</h3>
                  <p>× {item.quantity}</p>
                  <p>{item.product.price * item.quantity} kr</p>
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
              {submitting ? "Skapar order..." : "Slutför köp"}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Checkout;
