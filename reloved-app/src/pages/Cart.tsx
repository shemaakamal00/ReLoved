import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchShippingQuote } from "../api/client";
import type { ShippingQuote } from "../types";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import ProductImage from "../components/product/ProductImage";

function Cart() {
  const { items, loading, removeFromCart } = useCart();
  const { currency, formatPrice } = useCurrency();

  const availableItems = items.filter(
    (item) => item.product.status === "approved",
  );
  const unavailableItems = items.filter(
    (item) => item.product.status !== "approved",
  );

  const subtotal = availableItems.reduce(
    (sum, item) => sum + item.product.price,
    0,
  );
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const cartKey = availableItems.map((item) => item.product_id).join(",");

  useEffect(() => {
    if (!cartKey) return;
    const controller = new AbortController();
    fetchShippingQuote(
      {
        items: cartKey
          .split(",")
          .map((id) => ({ product_id: Number(id), quantity: 1 })),
      },
      controller.signal,
    )
      .then(setQuote)
      .catch((err) => {
        if (!controller.signal.aborted)
          console.error("Kunde inte hämta frakt:", err);
      });
    return () => controller.abort();
  }, [cartKey]);

  const currentQuote = cartKey ? quote : null;
  const shipping = currentQuote
    ? Math.min(...currentQuote.options.map((option) => option.price))
    : null;
  const total = subtotal + (shipping ?? 0);
  const leftForFreeShipping = currentQuote
    ? currentQuote.freeShippingFrom - currentQuote.subtotal
    : null;

  if (loading) {
    return (
      <main>
        <p>Laddar varukorg...</p>
      </main>
    );
  }

  return (
    <main>
      <section className="cart-page section">
        <div className="container">
          <h1>Varukorg</h1>

          <div className="cart-layout">
            <div className="cart-items">
              {items.length === 0 ? (
                <p>Din varukorg är tom.</p>
              ) : (
                items.map((item) => {
                  const isAvailable = item.product.status === "approved";
                  return (
                    <article
                      className="cart-item"
                      key={item.product_id}
                      data-product-id={item.product_id}
                    >
                      <ProductImage
                        product={item.product}
                        className="cart-item__image"
                      />

                      <div className="cart-item__info">
                        <h2>{item.product.name}</h2>
                        <p>{item.product.brand}</p>

                        {!isAvailable && (
                          <p className="form-error">
                            Inte längre tillgänglig — har redan sålts.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          Ta bort
                        </button>
                      </div>

                      <p className="cart-item__price">
                        {isAvailable ? formatPrice(item.product.price) : "—"}
                      </p>
                    </article>
                  );
                })
              )}
            </div>

            <aside className="cart-summary">
              <h2>Sammanfattning</h2>

              <div className="summary-row">
                <span>Produkter</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Frakt</span>
                <span>
                  {shipping === null
                    ? "Beräknas i kassan"
                    : shipping === 0
                      ? "Gratis"
                      : `från ${formatPrice(shipping)}`}
                </span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Totalt</span>
                <span>
                  {shipping ? "från " : ""}
                  {formatPrice(total)}
                </span>
              </div>
              {leftForFreeShipping !== null && leftForFreeShipping > 0 && (
                <p className="cart-summary__note">
                  Handla för {formatPrice(leftForFreeShipping)} till så får du
                  fri frakt.
                </p>
              )}

              {currency !== "SEK" && (
                <p className="cart-summary__note">
                  Priserna är omräknade från SEK och kan variera beroende på
                  valutakurs. Du betalar {total} kr i SEK vid kassan.
                </p>
              )}

              {unavailableItems.length > 0 && (
                <p className="form-error">
                  Ta bort otillgängliga varor innan du går vidare till kassan.
                </p>
              )}

              {unavailableItems.length === 0 ? (
                <Link to="/checkout" className="button button-primary">
                  Gå till kassan
                </Link>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  disabled
                >
                  Gå till kassan
                </button>
              )}

              <Link to="/products" className="cart-summary__link">
                Fortsätt handla
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Cart;
