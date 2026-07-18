import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/client";
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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    if (!user || !token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await fetchFavorites(token);
    setFavorites(data.map((row) => row.products));
    setLoading(false);
  }

  useEffect(() => {
    loadFavorites();
  }, [user]);

  function isFavorited(productId: number) {
    return favorites.some((p) => p.id === productId);
  }

  async function toggleFavorite(productId: number) {
    if (!user || !token) {
      alert("Logga in för att spara favoriter");
      return;
    }

    if (isFavorited(productId)) {
      await removeFavorite(token, productId);
    } else {
      await addFavorite(token, productId);
    }
    await loadFavorites();
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
