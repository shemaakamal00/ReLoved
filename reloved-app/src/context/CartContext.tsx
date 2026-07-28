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
  removeCartItem,
  clearCart as clearCartApi,
  fetchProducts,
} from "../api/client";
import type { Product } from "../types";

interface CartLine {
  product_id: number;
  product: Product;
}

interface LocalCartLine {
  id: number;
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  cartCount: number;
  addToCart: (productId: number,) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
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

  async function loadCart(showLoading = true) {
    if (showLoading) setLoading(true);

    if (user && token) {
      const local = loadLocalCart();
      if (local.length > 0) {
        for (const line of local) {
          await addCartItem(token, line.id);
        }
        localStorage.removeItem(LOCAL_CART_KEY);
      }

      const data = await fetchCart(token);
      setItems(
        data.map((row) => ({
          product_id: row.product_id,
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
              ? { product_id: product.id, product }
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

  async function addToCart(productId: number) {
    const alreadyInCart = items.some((item) => item.product_id === productId);
    if (alreadyInCart) {
      return;
    }

    if (user && token) {
      await addCartItem(token, productId);
    } else {
      const local = loadLocalCart();
      local.push({ id: productId});
      saveLocalCart(local);
    }
    await loadCart(false);
  }

  async function removeFromCart(productId: number) {
    if (user && token) {
      await removeCartItem(token, productId);
    } else {
      saveLocalCart(loadLocalCart().filter((l) => l.id !== productId));
    }
    await loadCart(false);
  }

  async function clearCart() {
    if (user && token) {
      await clearCartApi(token);
    } else {
      localStorage.removeItem(LOCAL_CART_KEY);
    }
    await loadCart(false);
  }

  const cartCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        cartCount,
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
