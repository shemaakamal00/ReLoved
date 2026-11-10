import { useState, useCallback } from "react";
import { fetchAdminStats } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { Product } from "../../types";
import StatCards from "../../components/ui/StatCards";
import AdminCategories from "./AdminCategories";
import AdminOrdersTable from "./AdminOrdersTable";
import AdminProductsList from "./AdminProductsList";
import PendingListings from "./PendingListings";
import ProductForm from "./ProductForm";
import SearchIndexPanel from "./SearchIndexPanel";
import SupplierImport from "./SupplierImport";

function AdminDashboard() {
  const { token } = useAuth();
  const { data: stats } = useApi(
    (signal) => fetchAdminStats(token!, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const refreshProducts = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleSaved = useCallback(() => {
    setEditingProduct(null);
    refreshProducts();
  }, [refreshProducts]);

  return (
    <main>
      <section className="admin-page">
        <div className="admin-header">
          <p className="eyebrow">Admin</p>
          <h1>Adminpanel</h1>
          <p>Hantera produkter, annonser, ordrar och användare på ReLoved.</p>
        </div>

        <StatCards
          variant="admin"
          stats={[
            { label: "Väntar på godkännande", value: stats?.pending },
            { label: "Aktiva annonser", value: stats?.active },
            { label: "Ordrar", value: stats?.orders },
            { label: "Användare", value: stats?.users },
          ]}
        />

        <SupplierImport onImported={refreshProducts} />
        <SearchIndexPanel />
        <PendingListings />
        <ProductForm editingProduct={editingProduct} onSaved={handleSaved} />
        <AdminProductsList onEdit={setEditingProduct} refreshKey={refreshKey} />
        <AdminCategories />
        <AdminOrdersTable />
      </section>
    </main>
  );
}

export default AdminDashboard;
