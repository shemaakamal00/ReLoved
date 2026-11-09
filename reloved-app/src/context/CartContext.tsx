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
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
  fetchProducts,
} from "../api";
import type { Product } from "../types";

export interface CartLine {
  product_id: number;
  /** Tom text = ingen storlek */
  size: string;
  quantity: number;
  product: Product;
}

interface AddOptions {
  size?: string;
  quantity?: number;
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  cartCount: number;
  addToCart: (productId: number, options?: AddOptions) => Promise<void>;
  updateQuantity: (
    productId: number,
    size: string,
    quantity: number,
  ) => Promise<void>;
  removeFromCart: (productId: number, size?: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LOCAL_CART_KEY = "reloved-cart";
const MAX_QUANTITY = 10;

// Utloggad varukorg i localStorage: [{ id, size, quantity }]
type LocalLine = { id: number; size: string; quantity: number };

function loadLocalLines(): LocalLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    // Äldre varukorgar sparade bara { id }
    return parsed.map((line) => ({
      id: Number(line.id),
      size: typeof line.size === "string" ? line.size : "",
      quantity: Number(line.quantity) || 1,
    }));
  } catch {
    return [];
  }
}

function saveLocalLines(lines: LocalLine[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(lines));
}

async function loadLocalCart(): Promise<CartLine[]> {
  const lines = loadLocalLines();
  if (lines.length === 0) return [];

  const products = await fetchProducts();
  return lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.id);
    return product
      ? [
          {
            product_id: product.id,
            size: line.size,
            quantity: line.quantity,
            product,
          },
        ]
      : [];
  });
}

async function moveLocalCartToServer(token: string) {
  const lines = loadLocalLines();
  for (const line of lines) {
    // En vara som hunnit säljas ska inte stoppa resten av varukorgen
    await addCartItem(token, line.id, line).catch((err) =>
      console.warn(`Kunde inte flytta vara ${line.id} till varukorgen:`, err),
    );
  }
  if (lines.length > 0) localStorage.removeItem(LOCAL_CART_KEY);
}

async function loadServerCart(token: string): Promise<CartLine[]> {
  await moveLocalCartToServer(token);
  const rows = await fetchCart(token);
  return rows.map((row) => ({
    product_id: row.product_id,
    size: row.size ?? "",
    quantity: row.quantity ?? 1,
    product: row.products,
  }));
}

const sameLine = (productId: number, size: string) => (line: LocalLine) =>
  line.id === productId && line.size === size;

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

  async function addToCart(
    productId: number,
    { size = "", quantity = 1 }: AddOptions = {},
  ) {
    const existing = items.find(
      (item) => item.product_id === productId && item.size === size,
    );
    // Second hand-plagg finns bara i ett exemplar
    if (existing && existing.product.stock === null) return;

    if (token) {
      await addCartItem(token, productId, { size, quantity });
    } else {
      const lines = loadLocalLines();
      const line = lines.find(sameLine(productId, size));
      if (line)
        line.quantity = Math.min(line.quantity + quantity, MAX_QUANTITY);
      else lines.push({ id: productId, size, quantity });
      saveLocalLines(lines);
    }
    await reload();
  }

  async function updateQuantity(
    productId: number,
    size: string,
    quantity: number,
  ) {
    if (token) {
      await updateCartItem(token, productId, size, quantity);
    } else {
      saveLocalLines(
        loadLocalLines().map((line) =>
          sameLine(productId, size)(line) ? { ...line, quantity } : line,
        ),
      );
    }
    await reload();
  }

  async function removeFromCart(productId: number, size = "") {
    if (token) await removeCartItem(token, productId, size);
    else
      saveLocalLines(
        loadLocalLines().filter((line) => !sameLine(productId, size)(line)),
      );
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
        // Antalet i headern räknar alla exemplar
        cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
        addToCart,
        updateQuantity,
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
