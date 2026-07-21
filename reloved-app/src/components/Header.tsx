import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  return (
    <header className="site-header">
      <div className="header-shell">
        <Link to="/" className="logo">
          Re<span>Loved</span>
        </Link>

        <form className="search-form" id="searchForm">
          <label className="sr-only" htmlFor="search">
            Sök på ReLoved
          </label>

          <input
            className="search-input"
            type="search"
            id="search"
            name="search"
            placeholder="Sök plagg, märken..."
          />

          <button
            className="search-button"
            id="searchButton"
            type="submit"
            aria-label="Sök"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M20 20l-3.5-3.5"></path>
            </svg>
          </button>
        </form>

        <nav className="header-actions" aria-label="Snabbmeny">
          <Link to="/favorites" className="icon-button" aria-label="Favoriter">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill={favorites.length > 0 ? "currentColor" : "none"}
            >
              <path d="M12 20s-6.5-4.2-8.5-7.5C1.7 9.6 3 6 6.6 6c2.1 0 3.2 1.2 4 2.3.8-1.1 1.9-2.3 4-2.3C18.2 6 19.5 9.6 17.7 12.5 15.7 15.8 12 20 12 20z"></path>
            </svg>
          </Link>

          <Link to="/cart" className="icon-button" aria-label="Varukorg">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 7h12l-1 9H7L6 7z"></path>
              <path d="M9 7a3 3 0 0 1 6 0"></path>
            </svg>
            <span className="icon-badge" id="cartCount">
              {cartCount}
            </span>
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            className="icon-button"
            aria-label="Profil"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5"></circle>
              <path d="M5 19c1.6-2.8 4-4.2 7-4.2s5.4 1.4 7 4.2"></path>
            </svg>
          </Link>

          <Link to="/seller" className="sell-button" id="sellButton">
            Sälj nu
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className="sell-button">
              Admin
            </Link>
          )}
        </nav>
      </div>

      <nav className="category-nav" aria-label="Kategorier">
        <ul className="category-list">
          <li className="category-item has-mega-menu">
            <Link to="/products?category=1">Dam</Link>

            <div className="mega-menu">
              <div className="mega-menu-inner">
                <div className="mega-column">
                  <h3>Kläder</h3>
                  <Link to="/products?category=1">Klänningar</Link>
                  <Link to="/products?category=1">Jackor</Link>
                  <Link to="/products?category=1">Jeans</Link>
                  <Link to="/products?category=1">Toppar</Link>
                  <Link to="/products?category=1">Kjolar</Link>
                </div>

                <div className="mega-column">
                  <h3>Skor</h3>
                  <Link to="/products?category=1">Sneakers</Link>
                  <Link to="/products?category=1">Boots</Link>
                  <Link to="/products?category=1">Sandaler</Link>
                  <Link to="/products?category=1">Klackar</Link>
                </div>

                <div className="mega-column">
                  <h3>Accessoarer</h3>
                  <Link to="/products?category=1">Väskor</Link>
                  <Link to="/products?category=1">Smycken</Link>
                  <Link to="/products?category=1">Solglasögon</Link>
                  <Link to="/products?category=1">Halsdukar</Link>
                </div>

                <Link to="/products?category=1" className="mega-feature">
                  <span className="mega-eyebrow">Curated second hand</span>
                  <strong>Veckans damfavoriter</strong>
                  <p>Handplockade plagg med premiumkänsla.</p>
                </Link>
              </div>
            </div>
          </li>

          <li className="category-item has-mega-menu">
            <Link to="/products?category=2">Herr</Link>

            <div className="mega-menu">
              <div className="mega-menu-inner">
                <div className="mega-column">
                  <h3>Kläder</h3>
                  <Link to="/products?category=2">Jackor</Link>
                  <Link to="/products?category=2">Skjortor</Link>
                  <Link to="/products?category=2">Jeans</Link>
                  <Link to="/products?category=2">Hoodies</Link>
                </div>

                <div className="mega-column">
                  <h3>Skor</h3>
                  <Link to="/products?category=2">Sneakers</Link>
                  <Link to="/products?category=2">Loafers</Link>
                  <Link to="/products?category=2">Boots</Link>
                </div>

                <div className="mega-column">
                  <h3>Accessoarer</h3>
                  <Link to="/products?category=2">Klockor</Link>
                  <Link to="/products?category=2">Väskor</Link>
                  <Link to="/products?category=2">Bälten</Link>
                </div>

                <Link to="/products?category=2" className="mega-feature">
                  <span className="mega-eyebrow">ReLoved Picks</span>
                  <strong>Stilrent för honom</strong>
                  <p>Second hand med clean och modern känsla.</p>
                </Link>
              </div>
            </div>
          </li>

          <li className="category-item has-mega-menu">
            <Link to="/products?category=3">Designer</Link>

            <div className="mega-menu">
              <div className="mega-menu-inner">
                <div className="mega-column">
                  <h3>Kategorier</h3>
                  <Link to="/products?category=3">Väskor</Link>
                  <Link to="/products?category=3">Skor</Link>
                  <Link to="/products?category=3">Jackor</Link>
                  <Link to="/products?category=3">Accessoarer</Link>
                </div>

                <div className="mega-column">
                  <h3>Populära märken</h3>
                  <Link to="/products?category=3">Acne Studios</Link>
                  <Link to="/products?category=3">Ganni</Link>
                  <Link to="/products?category=3">Filippa K</Link>
                  <Link to="/products?category=3">Totême</Link>
                </div>

                <div className="mega-column">
                  <h3>Shoppa efter</h3>
                  <Link to="/products?category=3">Nyinkommet</Link>
                  <Link to="/products?category=3">Premium</Link>
                  <Link to="/products?category=3">Vintage</Link>
                </div>

                <Link to="/products?category=3" className="mega-feature">
                  <span className="mega-eyebrow">Premium corner</span>
                  <strong>Designerfynd</strong>
                  <p>Utvalda favoriter med lyxigare känsla.</p>
                </Link>
              </div>
            </div>
          </li>

          <li className="category-item">
            <Link to="/products?category=4">Barn</Link>
          </li>
          <li className="category-item">
            <Link to="/products?category=5">Hem</Link>
          </li>
          <li className="category-item">
            <Link to="/products?category=6">Elektronik</Link>
          </li>
          <li className="category-item">
            <Link to="/products?category=7">Sport</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
