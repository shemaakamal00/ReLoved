import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { items, loading, removeFromCart, updateQuantity } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
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
                items.map((item) => (
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

                      <div className="cart-item__quantity">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          aria-label="Minska antal"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          aria-label="Öka antal"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        Ta bort
                      </button>
                    </div>

                    <p className="cart-item__price">
                      {item.product.price * item.quantity} kr
                    </p>
                  </article>
                ))
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

              <Link to="/checkout" className="button button-primary">
                Gå till kassan
              </Link>
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
