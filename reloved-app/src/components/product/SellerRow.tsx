import { initials } from "../../utils/format";

// Säljarens initialer och namn. Produkter utan säljare kommer från ReLoved
function SellerRow({ sellerName }: { sellerName: string | null }) {
  const name = sellerName ?? "ReLoved";
  return (
    <div className="seller-row">
      <span className="seller-avatar">{initials(name)}</span>
      <span className="seller-name">{name}</span>
    </div>
  );
}

export default SellerRow;
