import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, loading, removeFromCart } = useCart();

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
  const shipping = subtotal > 0 ? 49 : 0;
  const total = subtotal + shipping;

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
                      <img
                        src={item.product.image_url ?? ""}
                        alt={item.product.alt_text ?? item.product.name}
                      />

                      <div className="cart-item__info">
                        <h2>{item.product.name}</h2>
                        <p>{item.product.brand}</p>

                        {!isAvailable && (
                          <p className="form-error">
                            Produkten är inte längre tillgänlig, har redan
                            sålts.
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
                        {isAvailable
                          ? `${item.product.price} kr`
                          : "—"}
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
