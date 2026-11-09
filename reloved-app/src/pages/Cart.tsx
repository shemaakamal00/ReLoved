import { Link } from "react-router-dom";
import { useCart, type CartLine } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useShippingQuote } from "../hooks/useShippingQuote";
import PageMessage from "../components/ui/PageMessage";
import ProductImage from "../components/product/ProductImage";

function isAvailable(item: CartLine) {
  return item.product.status === "approved";
}

function Cart() {
  const { items, loading } = useCart();

  const availableItems = items.filter(isAvailable);
  const hasUnavailable = availableItems.length < items.length;
  const { quote } = useShippingQuote(
    availableItems.map((item) => item.product_id),
  );

  if (loading) return <PageMessage>Laddar varukorg...</PageMessage>;

  return (
    <main>
      <section className="cart-page section">
        <div className="container">
          <h1>Varukorg</h1>

          <div className="cart-layout">
            <div className="cart-items">
              {items.length === 0 ? (
                <p>
                  Varukorgen är tom. <Link to="/products">Se alla plagg</Link>
                </p>
              ) : (
                items.map((item) => (
                  <CartRow item={item} key={item.product_id} />
                ))
              )}
            </div>

            <CartSummary
              subtotal={availableItems.reduce(
                (sum, item) => sum + item.product.price,
                0,
              )}
              shipping={
                quote ? Math.min(...quote.options.map((o) => o.price)) : null
              }
              leftForFreeShipping={
                quote ? quote.freeShippingFrom - quote.subtotal : null
              }
              canCheckout={!hasUnavailable}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function CartRow({ item }: { item: CartLine }) {
  const { removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const available = isAvailable(item);

  return (
    <article className="cart-item" data-product-id={item.product_id}>
      <ProductImage product={item.product} className="cart-item__image" />

      <div className="cart-item__info">
        <h2>{item.product.name}</h2>
        <p>{item.product.brand}</p>

        {!available && (
          <p className="form-error">Någon hann före. Plagget är sålt.</p>
        )}

        <button type="button" onClick={() => removeFromCart(item.product_id)}>
          Ta bort
        </button>
      </div>

      <p className="cart-item__price">
        {available ? formatPrice(item.product.price) : "—"}
      </p>
    </article>
  );
}

interface CartSummaryProps {
  subtotal: number;
  shipping: number | null;
  leftForFreeShipping: number | null;
  canCheckout: boolean;
}

function CartSummary({
  subtotal,
  shipping,
  leftForFreeShipping,
  canCheckout,
}: CartSummaryProps) {
  const { currency, formatPrice } = useCurrency();
  const total = subtotal + (shipping ?? 0);

  return (
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
          Handla för {formatPrice(leftForFreeShipping)} till så får du fri
          frakt.
        </p>
      )}

      {currency !== "SEK" && (
        <p className="cart-summary__note">
          Priserna är omräknade från SEK och kan variera beroende på valutakurs.
          Du betalar {total} kr i SEK vid kassan.
        </p>
      )}

      {canCheckout ? (
        <Link to="/checkout" className="button button-primary">
          Gå till kassan
        </Link>
      ) : (
        <>
          <p className="form-error">
            Ta bort otillgängliga varor innan du går vidare till kassan.
          </p>
          <button type="button" className="button button-primary" disabled>
            Gå till kassan
          </button>
        </>
      )}

      <Link to="/products" className="cart-summary__link">
        Se fler plagg
      </Link>
    </aside>
  );
}

export default Cart;
