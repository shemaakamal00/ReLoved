import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Category } from "../../types";
import CurrencySelect from "./CurrencySelect";

const CLOSE_MS = 280;

interface MobileMenuProps {
  categories: Category[];
  onClose: () => void;
}

// Menyn som glider in från vänster på mobil
function MobileMenu({ categories, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  const [closing, setClosing] = useState(false);

  const topLevel = categories
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.id - b.id);

  function close() {
    setClosing(true);
    setTimeout(onClose, CLOSE_MS);
  }

  // Stäng när man klickar på en länk i menyn
  function handleClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) close();
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setClosing(true);
        setTimeout(onClose, CLOSE_MS);
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div className={`mobile-menu ${closing ? "is-closing" : ""}`}>
      <div className="mobile-menu__backdrop" onClick={close} />

      <nav
        className="mobile-menu__panel"
        id="mobile-menu"
        aria-label="Meny"
        onClick={handleClick}
      >
        <div className="mobile-menu__top">
          <Link to="/" className="logo">
            Re<span>Loved</span>
          </Link>
          <button
            type="button"
            className="icon-button"
            aria-label="Stäng menyn"
            onClick={close}
            autoFocus
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <ul className="mobile-menu__categories">
          <li>
            <Link to="/products">Alla plagg</Link>
          </li>
          {topLevel.map((category) => {
            const children = categories.filter(
              (c) => c.parent_id === category.id,
            );
            return (
              <li key={category.id}>
                {children.length === 0 ? (
                  <Link to={`/products?category=${category.id}`}>
                    {category.name}
                  </Link>
                ) : (
                  <details>
                    <summary>{category.name}</summary>
                    <div className="mobile-menu__sub">
                      <Link to={`/products?category=${category.id}`}>
                        Allt inom {category.name.toLowerCase()}
                      </Link>
                      {children.map((child) => (
                        <Link
                          to={`/products?category=${child.id}`}
                          key={child.id}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mobile-menu__links">
          <Link to="/seller" className="button button-primary">
            Sälj ett plagg
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="button button-secondary">
              Admin
            </Link>
          )}
          <Link to="/favorites">Favoriter</Link>
          <Link to={user ? "/orders" : "/login"}>
            {user ? "Mina ordrar" : "Logga in"}
          </Link>
          <Link to="/about">Om ReLoved</Link>
          <Link to="/faq">Vanliga frågor</Link>
          <Link to="/contact">Kontakt</Link>
        </div>

        <div className="mobile-menu__currency">
          <span>Valuta</span>
          <CurrencySelect id="currency-mobile" />
        </div>
      </nav>
    </div>,
    document.body,
  );
}

export default MobileMenu;
