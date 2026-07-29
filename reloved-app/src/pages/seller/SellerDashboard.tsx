import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchSellerStats } from "../../api/client";
import type { SellerStats, Product } from "../../types";
import SellerForm from "./SellerForm";
import MyListings from "./MyListings";
import MySales from "./MySales";

function SellerDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchSellerStats(token).then(setStats).catch(console.error);
  }, [token, refreshKey]);

  const handleSaved = useCallback(() => {
    setEditingProduct(null);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main>
      <section className="seller-page">
        <div className="seller-header">
          <p className="eyebrow">Säljarpanel</p>
          <h1>Mina försäljningar</h1>
          <p>Hantera dina annonser, produkter och försäljningar på ReLoved.</p>
        </div>

        <div className="seller-stats">
          <article className="seller-stat-card">
            <span>Väntar på granskning</span>
            <strong>{stats ? stats.pending : "–"}</strong>
          </article>
          <article className="seller-stat-card">
            <span>Aktiva annonser</span>
            <strong>{stats ? stats.active : "–"}</strong>
          </article>
          <article className="seller-stat-card">
            <span>Sålda produkter</span>
            <strong>{stats ? stats.sold : "–"}</strong>
          </article>
          <article className="seller-stat-card">
            <span>Väntar på leverans</span>
            <strong>{stats ? stats.pendingDelivery : "–"}</strong>
          </article>
        </div>

        <SellerForm editingProduct={editingProduct} onSaved={handleSaved} />
        <MyListings onEdit={setEditingProduct} refreshKey={refreshKey} />
        <MySales refreshKey={refreshKey} />
      </section>
    </main>
  );
}

export default SellerDashboard;
