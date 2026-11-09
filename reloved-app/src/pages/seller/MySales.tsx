import { fetchMySales } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { formatKr } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../utils/statusLabels";
import PanelSection from "../../components/ui/PanelSection";
import StatusBadge from "../../components/ui/StatusBadge";

interface MySalesProps {
  refreshKey: number;
}

function MySales({ refreshKey }: MySalesProps) {
  const { token } = useAuth();
  const { data: sales, loading } = useApi(
    (signal) => fetchMySales(token!, signal),
    [token, refreshKey],
    { enabled: Boolean(token) },
  );

  return (
    <PanelSection
      variant="seller"
      eyebrow="Försäljningar"
      title="Senaste försäljningar"
    >
      <div className="seller-table">
        <div className="seller-table__row seller-table__row--head">
          <span>Order</span>
          <span>Produkt</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {loading ? (
          <p>Laddar försäljningar...</p>
        ) : !sales || sales.length === 0 ? (
          <p>Inga försäljningar än.</p>
        ) : (
          sales.map((item) => (
            <div
              className="seller-table__row"
              data-order-id={item.orders.id}
              key={item.id}
            >
              <span>#{item.orders.id}</span>
              <span>{item.product_name}</span>
              <span>{formatKr(item.line_total)}</span>
              <StatusBadge label={ORDER_STATUS_LABELS[item.orders.status]} />
            </div>
          ))
        )}
      </div>
    </PanelSection>
  );
}

export default MySales;
