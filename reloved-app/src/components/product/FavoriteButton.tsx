import { useState, type AnimationEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../.../utils/messages";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

// Hjärtat som poppar upp när man sparar en produkt
function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [popping, setPopping] = useState(false);

  const saved = isFavorited(productId);
  const shownAsSaved = saved || popping;

  async function handleClick() {
    if (!saved && user) setPopping(true);
    try {
      await toggleFavorite(productId);
    } catch (err) {
      showToast(errorMessage(err, "Kunde inte spara favoriten."), "error");
    }
  }

  function handleAnimationEnd(event: AnimationEvent) {
    if (event.animationName === "reloved-heart-burst") setPopping(false);
  }

  return (
    <button
      type="button"
      className={`favorite-button ${popping ? "is-popping" : ""} ${className}`}
      aria-pressed={shownAsSaved}
      aria-label={shownAsSaved ? "Ta bort från favoriter" : "Spara som favorit"}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-6.5-4.2-8.5-7.5C1.7 9.6 3 6 6.6 6c2.1 0 3.2 1.2 4 2.3.8-1.1 1.9-2.3 4-2.3C18.2 6 19.5 9.6 17.7 12.5 15.7 15.8 12 20 12 20z" />
      </svg>
    </button>
  );
}

export default FavoriteButton;
