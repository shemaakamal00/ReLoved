import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { fetchCategories } from "../api/client";
import type { Category } from "../types";

function Header() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const topLevelCategories = categories.filter((c) => c.parent_id === null);

  function childrenOf(parentId: number) {
    return categories.filter((c) => c.parent_id === parentId);
  }

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
          {topLevelCategories.map((category) => {
            const children = childrenOf(category.id);
            return (
              <li
                className={
                  children.length > 0
                    ? "category-item has-mega-menu"
                    : "category-item"
                }
                key={category.id}
              >
                <Link to={`/products?category=${category.id}`}>
                  {category.name}
                </Link>

                {children.length > 0 && (
                  <div className="mega-menu">
                    <div className="mega-menu-inner">
                      <div className="mega-column">
                        <h3>{category.name}</h3>
                        {children.map((child) => (
                          <Link
                            to={`/products?category=${child.id}`}
                            key={child.id}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
