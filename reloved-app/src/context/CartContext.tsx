import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  fetchProducts,
} from "../api/client";
import type { Product } from "../types";

interface CartLine {
  product_id: number;
  quantity: number;
  product: Product;
}

interface LocalCartLine {
  id: number;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  cartCount: number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LOCAL_CART_KEY = "reloved-cart";

function loadLocalCart(): LocalCartLine[] {
  const raw = localStorage.getItem(LOCAL_CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartLine[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    setLoading(true);

    if (user && token) {
      const local = loadLocalCart();
      if (local.length > 0) {
        for (const line of local) {
          await addCartItem(token, line.id, line.quantity);
        }
        localStorage.removeItem(LOCAL_CART_KEY);
      }

      const data = await fetchCart(token);
      setItems(
        data.map((row) => ({
          product_id: row.product_id,
          quantity: row.quantity,
          product: row.products,
        })),
      );
    } else {
      const local = loadLocalCart();
      if (local.length === 0) {
        setItems([]);
      } else {
        const products = await fetchProducts();
        const joined = local
          .map((line) => {
            const product = products.find((p) => p.id === line.id);
            return product
              ? { product_id: product.id, quantity: line.quantity, product }
              : null;
          })
          .filter((line): line is CartLine => line !== null);
        setItems(joined);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, [user]);

  async function addToCart(productId: number, quantity = 1) {
    if (user && token) {
      await addCartItem(token, productId, quantity);
    } else {
      const local = loadLocalCart();
      const existing = local.find((l) => l.id === productId);
      if (existing) existing.quantity += quantity;
      else local.push({ id: productId, quantity });
      saveLocalCart(local);
    }
    await loadCart();
  }

  async function removeFromCart(productId: number) {
    if (user && token) {
      await removeCartItem(token, productId);
    } else {
      saveLocalCart(loadLocalCart().filter((l) => l.id !== productId));
    }
    await loadCart();
  }

  async function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return removeFromCart(productId);

    if (user && token) {
      await updateCartItem(token, productId, quantity);
    } else {
      const local = loadLocalCart();
      const line = local.find((l) => l.id === productId);
      if (line) line.quantity = quantity;
      saveLocalCart(local);
    }
    await loadCart();
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
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
