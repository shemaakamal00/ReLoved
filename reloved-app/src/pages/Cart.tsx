import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCart, type CartLine } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useToast } from "../context/ToastContext";
import { useExitList } from "../hooks/useExitList";
import { errorMessage } from "../utils/messages";
import { useShippingQuote } from "../hooks/useShippingQuote";
import { isStockItem, lineKey, toCartPayload } from "../utils/cart";
import EmptyState from "../components/ui/EmptyState";
import ProductImage from "../components/product/ProductImage";
import QuantityStepper from "../components/product/QuantityStepper";

function isAvailable(item: CartLine) {
  return item.product.status === "approved";
}

function Cart() {
  const { items, loading } = useCart();

  const availableItems = items.filter(isAvailable);
  const hasUnavailable = availableItems.length < items.length;
  const { quote } = useShippingQuote(toCartPayload(availableItems));
  const shown = useExitList(items, (item: CartLine) => lineKey(item));

  if (loading) return <CartSkeleton />;

  if (shown.length === 0) {
    return (
      <main>
        <section className="cart-page section">
          <div className="container">
            <h1>Varukorg</h1>
            <EmptyState
              icon="bag"
              title="Varukorgen är tom"
              action={
                <Link to="/products" className="button button-primary">
                  Se alla plagg
                </Link>
              }
            >
              Varje plagg finns bara en gång, så hittar du något du gillar är
              det bäst att slå till.
            </EmptyState>
          </div>
        </section>
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
              {shown.map(({ item, leaving }, index) => (
                <CartRow
                  item={item}
                  leaving={leaving}
                  index={index}
                  key={lineKey(item)}
                />
              ))}
            </div>

            <CartSummary
              subtotal={availableItems.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
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

interface CartRowProps {
  item: CartLine;
  leaving: boolean;
  index: number;
}

function CartRow({ item, leaving, index }: CartRowProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const available = isAvailable(item);
  const stockItem = isStockItem(item.product);

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeFromCart(item.product_id, item.size);
    } catch (err) {
      console.error(err);
      setRemoving(false);
    }
  }

  async function handleQuantity(quantity: number) {
    setUpdating(true);
    try {
      await updateQuantity(item.product_id, item.size, quantity);
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte ändra antalet."), "error");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <article
      className={`cart-item ${leaving ? "is-leaving-row" : ""}`}
      data-product-id={item.product_id}
      style={{ "--delay": `${Math.min(index, 5) * 60}ms` } as CSSProperties}
    >
      <ProductImage product={item.product} className="cart-item__image" />

      <div className="cart-item__info">
        <h2>{item.product.name}</h2>
        <p>
          {item.product.brand}
          {item.size && ` · Stl ${item.size}`}
        </p>

        {stockItem && available && (
          <QuantityStepper
            value={item.quantity}
            max={item.product.stock ?? 1}
            onChange={handleQuantity}
            disabled={updating || removing}
          />
        )}

        {!available && (
          <p className="form-error">Någon hann före. Plagget är sålt.</p>
        )}

        <button type="button" onClick={handleRemove} disabled={removing}>
          {removing ? "Tar bort..." : "Ta bort"}
        </button>
      </div>

      <p className="cart-item__price">
        {available ? (
          // key: radens pris blinkar till när antalet ändras
          <span className="value-flash" key={item.quantity}>
            {formatPrice(item.product.price * item.quantity)}
          </span>
        ) : (
          "—"
        )}
        {available && item.quantity > 1 && (
          <small>{formatPrice(item.product.price)} / st</small>
        )}
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
        {/* key: beloppet blinkar till när det ändras */}
        <span className="value-flash" key={subtotal}>
          {formatPrice(subtotal)}
        </span>
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
        <span className="value-flash" key={total}>
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

function CartSkeleton() {
  return (
    <main>
      <section className="cart-page section">
        <div className="container" aria-busy="true">
          <h1>Varukorg</h1>
          <span className="sr-only">Laddar varukorg...</span>
          <div className="cart-layout" aria-hidden="true">
            <div className="cart-items">
              {[0, 1].map((row) => (
                <div className="cart-item" key={row}>
                  <div className="skeleton cart-item__image" />
                  <div className="cart-item__info">
                    <div
                      className="skeleton skeleton--line"
                      style={{ width: "60%" }}
                    />
                    <div
                      className="skeleton skeleton--line"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="skeleton cart-summary cart-skeleton__summary" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Cart;
