import { fetchPendingProducts, updateProductStatus } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useExitList } from "../../hooks/useExitList";
import type { Product } from "../../types";
import { formatKr } from "../../utils/format";
import { SEARCH_INDEX_WARNING } from "../../utils/messages";
import PanelSection from "../../components/ui/PanelSection";
import ProductImage from "../../components/product/ProductImage";
import TableSkeleton from "../../components/ui/TableSkeleton";

type Decision = "approved" | "rejected";

const NO_LISTINGS: Product[] = [];

function askForRejectionReason(): string | undefined {
  return (
    window.prompt("Anledning till nekande (visas för säljaren):") ?? undefined
  );
}

function PendingListings() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const {
    data: listings,
    loading,
    reload,
  } = useApi((signal) => fetchPendingProducts(token!, signal), [token], {
    enabled: Boolean(token),
  });

  const shown = useExitList(listings ?? NO_LISTINGS, (product) => product.id);
  const [deciding, setDeciding] = useState<number | null>(null);

  async function handleDecision(id: number, status: Decision) {
    if (!token) return;
    const reason = status === "rejected" ? askForRejectionReason() : undefined;

    setDeciding(id);
    try {
      const updated = await updateProductStatus(token, id, status, reason);
      reload();
      if (updated.searchIndexed === false) {
        showToast(SEARCH_INDEX_WARNING, "error");
      } else {
        showToast(
          status === "approved" ? "Annonsen godkändes!" : "Annonsen nekades.",
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera annonsen.", "error");
    } finally {
      setDeciding(null);
    }
  }

  return (
    <PanelSection
      variant="admin"
      eyebrow="Granskning"
      title="Annonser att godkänna"
    >
      <div className="admin-table">
        <div className="admin-table__row admin-table__row--head">
          <span>Produkt</span>
          <span>Säljare</span>
          <span>Pris</span>
          <span>Status</span>
          <span>Detaljer</span>
        </div>

        {loading ? (
          <TableSkeleton label="Laddar annonser..." />
        ) : shown.length === 0 ? (
          <p className="fade-in">Inga annonser väntar på granskning just nu.</p>
        ) : (
          shown.map(({ item: product, leaving }) => (
            <PendingRow
              key={product.id}
              product={product}
              leaving={leaving}
              busy={deciding === product.id}
              onDecision={handleDecision}
            />
          ))
        )}
      </div>
    </PanelSection>
  );
}

interface PendingRowProps {
  product: Product;
  leaving: boolean;
  busy: boolean;
  onDecision: (id: number, status: Decision) => void;
}

function PendingRow({ product, leaving, busy, onDecision }: PendingRowProps) {
  return (
    <details
      className={`pending-row ${leaving ? "is-leaving-row" : ""}`}
      data-listing-id={product.id}
    >
      <summary className="admin-table__row">
        <span>{product.name}</span>
        <span>{product.seller_name ?? "Okänd säljare"}</span>
        <span>{formatKr(product.price)}</span>
        <span className="status-badge status-badge--pending">Väntar</span>
        <span className="pending-row__hint">Visa detaljer ▾</span>
      </summary>

      <div className="pending-row__detail">
        <ProductImage product={product} className="pending-row__image" />

        <div className="pending-row__info">
          <p>
            <strong>Skick:</strong> {product.condition}
          </p>
          <p>
            <strong>Storlek:</strong> {product.size}
          </p>
          <p>
            <strong>Färg:</strong> {product.color}
          </p>
          <p>
            <strong>Material:</strong> {product.material}
          </p>
          <p>{product.description}</p>

          <div className="admin-actions">
            <button
              type="button"
              className="admin-actions__approve"
              onClick={() => onDecision(product.id, "approved")}
              disabled={busy}
            >
              {busy ? "Sparar..." : "Godkänn"}
            </button>
            <button
              type="button"
              onClick={() => onDecision(product.id, "rejected")}
              disabled={busy}
            >
              Neka
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}

export default PendingListings;
