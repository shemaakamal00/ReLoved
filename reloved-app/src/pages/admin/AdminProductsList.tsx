import { useState } from "react";
import { fetchAllProducts, deleteProduct } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { Product } from "../../types";
import { formatKr } from "../../utils/format";
import { SEARCH_INDEX_WARNING } from "../../utils/messages";
import { PRODUCT_STATUS_LABELS } from "../../utils/statusLabels";
import PanelSection from "../../components/ui/PanelSection";
import StatusBadge from "../../components/ui/StatusBadge";
import TableSkeleton from "../../components/ui/TableSkeleton";

interface AdminProductsListProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

function AdminProductsList({ onEdit, refreshKey }: AdminProductsListProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const {
    data: products,
    loading,
    reload,
  } = useApi(
    (signal) => fetchAllProducts(token!, signal),
    [token, refreshKey],
    {
      enabled: Boolean(token),
    },
  );

  async function handleDelete(product: Product) {
    if (!token) return;
    if (
      !window.confirm(`Ta bort "${product.name}"? Detta går inte att ångra.`)
    ) {
      return;
    }

    setDeletingId(product.id);
    try {
      const result = await deleteProduct(token, product.id);
      if (result.searchIndexed === false) {
        showToast(SEARCH_INDEX_WARNING, "error");
      } else {
        showToast("Produkten togs bort.");
      }
      reload();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte ta bort produkten.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PanelSection variant="admin" eyebrow="Produkter" title="Alla produkter">
      <div className="admin-table">
        <div className="admin-table__row admin-table__row--head">
          <span>Produkt</span>
          <span>Pris</span>
          <span>Status</span>
          <span>Åtgärd</span>
        </div>

        {loading ? (
          <TableSkeleton label="Laddar produkter..." />
        ) : (
          (products ?? []).map((product) => (
            <div
              className="admin-table__row"
              data-product-id={product.id}
              key={product.id}
            >
              <span>{product.name}</span>
              <span>{formatKr(product.price)}</span>
              <StatusBadge label={PRODUCT_STATUS_LABELS[product.status]} />
              <div className="admin-actions">
                <button type="button" onClick={() => onEdit(product)}>
                  Redigera
                </button>
                <button
                  type="button"
                  className="button-danger"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? "Tar bort..." : "Ta bort"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PanelSection>
  );
}

export default AdminProductsList;
