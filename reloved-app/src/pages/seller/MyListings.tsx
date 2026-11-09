import { fetchMyListings, deleteMyListing } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { Product } from "../../types";
import { formatKr } from "../../utils/format";
import { errorMessage } from "../../utils/messages";
import { PRODUCT_STATUS_LABELS } from "../../utils/statusLabels";
import PanelSection from "../../components/ui/PanelSection";
import StatusBadge from "../../components/ui/StatusBadge";

interface MyListingsProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

function MyListings({ onEdit, refreshKey }: MyListingsProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const {
    data: listings,
    loading,
    reload,
  } = useApi((signal) => fetchMyListings(token!, signal), [token, refreshKey], {
    enabled: Boolean(token),
  });

  async function handleDelete(product: Product) {
    if (!token) return;
    if (!window.confirm(`Ta bort annonsen "${product.name}"?`)) return;

    try {
      await deleteMyListing(token, product.id);
      showToast("Annonsen är borttagen.");
      reload();
    } catch (err) {
      console.error(err);
      showToast(errorMessage(err, "Kunde inte ta bort annonsen."), "error");
    }
  }

  return (
    <PanelSection
      variant="seller"
      eyebrow="Mina annonser"
      title="Dina annonser"
    >
      <div className="seller-table">
        <div className="seller-table__row seller-table__row--head">
          <span>Produkt</span>
          <span>Pris</span>
          <span>Status</span>
          <span>Åtgärd</span>
        </div>

        {loading ? (
          <p>Laddar dina annonser...</p>
        ) : !listings || listings.length === 0 ? (
          <p>Inga annonser än. Den första tar ett par minuter.</p>
        ) : (
          listings.map((product) => {
            const isSold = product.status === "sold";

            return (
              <div
                className="seller-table__row"
                data-listing-id={product.id}
                key={product.id}
              >
                <span>{product.name}</span>
                <span>{formatKr(product.price)}</span>
                <StatusBadge label={PRODUCT_STATUS_LABELS[product.status]} />
                <div className="seller-actions">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    disabled={isSold}
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={isSold}
                  >
                    Ta bort
                  </button>
                </div>
                {product.status === "rejected" && product.rejection_reason && (
                  <span className="rejection-reason">
                    {product.rejection_reason}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </PanelSection>
  );
}

export default MyListings;
