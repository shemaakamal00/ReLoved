import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchCart,
  addCartItem,
  removeCartItem,
  clearCart as clearCartApi,
  fetchProducts,
} from "../api";
import type { Product } from "../types";

export interface CartLine {
  product_id: number;
  product: Product;
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  cartCount: number;
  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LOCAL_CART_KEY = "reloved-cart";

function loadLocalIds(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.map((line) => line.id) : [];
  } catch {
    return [];
  }
}

function saveLocalIds(ids: number[]) {
  localStorage.setItem(
    LOCAL_CART_KEY,
    JSON.stringify(ids.map((id) => ({ id }))),
  );
}

async function loadLocalCart(): Promise<CartLine[]> {
  const ids = loadLocalIds();
  if (ids.length === 0) return [];

  const products = await fetchProducts();
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((product): product is Product => Boolean(product))
    .map((product) => ({ product_id: product.id, product }));
}

async function moveLocalCartToServer(token: string) {
  const ids = loadLocalIds();
  for (const id of ids) await addCartItem(token, id);
  if (ids.length > 0) localStorage.removeItem(LOCAL_CART_KEY);
}

async function loadServerCart(token: string): Promise<CartLine[]> {
  await moveLocalCartToServer(token);
  const rows = await fetchCart(token);
  return rows.map((row) => ({
    product_id: row.product_id,
    product: row.products,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setItems(token ? await loadServerCart(token) : await loadLocalCart());
    } catch (err) {
      console.error("Kunde inte läsa varukorgen:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    let cancelled = false;
    const load = token ? loadServerCart(token) : loadLocalCart();
    load
      .then((lines) => !cancelled && setItems(lines))
      .catch((err) => console.error("Kunde inte läsa varukorgen:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function addToCart(productId: number) {
    if (items.some((item) => item.product_id === productId)) return;

    if (token) await addCartItem(token, productId);
    else saveLocalIds([...loadLocalIds(), productId]);
    await reload();
  }

  async function removeFromCart(productId: number) {
    if (token) await removeCartItem(token, productId);
    else saveLocalIds(loadLocalIds().filter((id) => id !== productId));
    await reload();
  }

  async function clearCart() {
    if (token) await clearCartApi(token);
    else localStorage.removeItem(LOCAL_CART_KEY);
    await reload();
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount: items.length,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart måste användas inuti en CartProvider");
  return context;
}
