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
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

async function loadFavorites(loggedIn: boolean): Promise<Product[]> {
  if (!loggedIn) return [];
  const rows = await fetchFavorites();
  return rows.map((row) => row.products);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setFavorites(await loadFavorites(Boolean(userId)));
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    loadFavorites(Boolean(userId))
      .then((list) => !cancelled && setFavorites(list))
      .catch((err) => console.error("Kunde inte läsa favoriter:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function isFavorited(productId: number) {
    return favorites.some((p) => p.id === productId);
  }

  async function toggleFavorite(productId: number) {
    if (!userId) {
      showToast("Logga in för att spara favoriter", "error");
      return;
    }

    if (isFavorited(productId)) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
      showToast("Sparad i favoriter");
    }
    await reload();
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorited,
        toggleFavorite,
        refreshFavorites: reload,
      }}
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
