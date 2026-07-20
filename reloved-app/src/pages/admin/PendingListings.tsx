import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchProducts, updateProductStatus } from "../../api/client";
import type { Product } from "../../types";
import { useToast } from "../../context/ToastContext";

function PendingListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await fetchProducts("pending");
      setListings(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id: number, status: "approved" | "rejected") {
    if (!token) return;
    try {
      await updateProductStatus(id, status, token);
      await load();
      showToast(
        status === "approved" ? "Annonsen godkändes!" : "Annonsen nekades.",
      );
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera annonsen.", "error");
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="eyebrow"> Granskning </p>
          <h2> Annonser att godkänna </h2>
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-table__row admin-table__row--head">
          <span> Produkt </span>
          <span> Säljare </span>
          <span> Pris </span>
          <span> Status </span>
          <span> Åtgärd </span>
        </div>

        {loading ? (
          <p> Laddar annonser ... </p>
        ) : listings.length === 0 ? (
          <p> Inga annonser väntar på granskning just nu. </p>
        ) : (
          listings.map((product) => (
            <div
              className="admin-table__row"
              data-listing-id={product.id}
              key={product.id}
            >
              <span> {product.name} </span>
              <span> {product.seller_name ?? "Okänd säljare"} </span>
              <span> {product.price} kr </span>
              <span className="status-badge status-badge--pending">Väntar</span>
              <div className="admin-actions">
                <button
                  type="button"
                  onClick={() => handleDecision(product.id, "approved")}
                >
                  Godkänn
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision(product.id, "rejected")}
                >
                  Neka
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default PendingListings;
