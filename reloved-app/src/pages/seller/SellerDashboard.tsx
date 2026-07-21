import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchSellerStats } from "../../api/client";
import type { SellerStats } from "../../types";
import SellerForm from "./SellerForm";
import MyListings from "./MyListings";
import MySales from "./MySales";

function SellerDashBoard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchSellerStats(token).then(setStats).catch(console.error);
  }, [token]);

  return (
    <main>
      <section className="seller-page">
        <div className="seller-header">
          <p className="eyebrow"> Säljarpanel </p>
          <h1> Mina försäljningar </h1>
          <p> Hantera dina annonser, produkter och försäljningar på ReLoved </p>
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
        </div>

        <SellerForm />
        <MyListings />
        <MySales />
      </section>
    </main>
  );
}

export default SellerDashBoard;
