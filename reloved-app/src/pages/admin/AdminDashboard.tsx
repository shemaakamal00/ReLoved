import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminStats } from "../../api/client";
import type { AdminStats, Product } from "../../types";
import PendingListings from "./PendingListings";
import ProductForm from "./ProductForm";
import AdminCategories from "./AdminCategories";
import AdminProductsList from "./AdminProductsList";
import AdminOrdersTable from "./AdminOrdersTable";

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchAdminStats(token).then(setStats).catch(console.error);
  }, [token]);

  const handleSaved = useCallback(() => {
    setEditingProduct(null);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main>
      <section className="admin-page">
        <div className="admin-header">
          <p className="eyebrow"> Admin </p>
          <h1> Adminpanel </h1>
          <p> Hantera produkter, annonser, ordrar och användare på ReLoved. </p>
        </div>

        <div className="admin-stats">
          <article className="admin-stat-card">
            <span> Väntar på godkännande </span>
            <strong> {stats ? stats.pending : "-"} </strong>
          </article>

          <article className="admin-stat-card">
            <span> Aktiva annonser </span>
            <strong> {stats ? stats.active : "-"} </strong>
          </article>

          <article className="admin-stat-card">
            <span> Ordrar </span>
            <strong> {stats ? stats.orders : "-"} </strong>
          </article>

          <article className="admin-stat-card">
            <span> Användare </span>
            <strong> {stats ? stats.users : "-"} </strong>
          </article>
        </div>

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
