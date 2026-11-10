import { useState, useCallback } from "react";
import { fetchSellerStats } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { Product } from "../../types";
import StatCards from "../../components/ui/StatCards";
import SellerForm from "./SellerForm";
import MyListings from "./MyListings";
import MySales from "./MySales";

function SellerDashboard() {
  const { user } = useAuth();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: stats } = useApi(
    (signal) => fetchSellerStats(signal),
    [refreshKey],
    { enabled: Boolean(user) },
  );

  const handleSaved = useCallback(() => {
    setEditingProduct(null);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main>
      <section className="seller-page">
        <div className="seller-header">
          <p className="eyebrow">Säljarpanel</p>
          <h1>Mina annonser</h1>
          <p>
            Nya annonser granskas innan de publiceras, oftast inom ett dygn. Du
            ser status i listan nedan.
          </p>
        </div>

        <StatCards
          variant="seller"
          stats={[
            { label: "Väntar på granskning", value: stats?.pending },
            { label: "Aktiva annonser", value: stats?.active },
            { label: "Sålda", value: stats?.sold },
            { label: "Väntar på leverans", value: stats?.pendingDelivery },
          ]}
        />

        <SellerForm editingProduct={editingProduct} onSaved={handleSaved} />
        <MyListings onEdit={setEditingProduct} refreshKey={refreshKey} />
        <MySales refreshKey={refreshKey} />
      </section>
    </main>
  );
}

export default SellerDashboard;
