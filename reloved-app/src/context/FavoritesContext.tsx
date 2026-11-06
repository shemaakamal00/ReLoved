import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { fetchFavorites, addFavorite, removeFavorite } from "../api";
import type { Product } from "../types";

interface FavoritesContextValue {
  favorites: Product[];
  loading: boolean;
  isFavorited: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

async function loadFavorites(token: string | null): Promise<Product[]> {
  if (!token) return [];
  const rows = await fetchFavorites(token);
  return rows.map((row) => row.products);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setFavorites(await loadFavorites(token));
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    loadFavorites(token)
      .then((list) => !cancelled && setFavorites(list))
      .catch((err) => console.error("Kunde inte läsa favoriter:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  function isFavorited(productId: number) {
    return favorites.some((p) => p.id === productId);
  }

  async function toggleFavorite(productId: number) {
    if (!token) {
      showToast("Logga in för att spara favoriter", "error");
      return;
    }

    if (isFavorited(productId)) await removeFavorite(token, productId);
    else await addFavorite(token, productId);
    await reload();
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, isFavorited, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites måste användas inuti en FavoritesProvider");
  return context;
}
