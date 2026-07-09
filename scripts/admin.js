import {
  fetchAllOrders,
  updateOrderStatus,
  createProduct,
  fetchPendingProducts,
  updateProductStatus,
} from "./api.js";
import { showToast } from "./toast.js";

const STATUS_OPTIONS = [
  { value: "ordered", label: "Beställd" },
  { value: "processing", label: "Behandlas" },
  { value: "shipped", label: "Skickad" },
  { value: "delivered", label: "Levererad" },
  { value: "refunded", label: "Återbetald" },
  { value: "cancelled", label: "Avbruten" },
];

export async function renderAdminOrders() {
  const ordersTable = document.getElementById("adminOrdersTable");
  if (!ordersTable) return;
  let orders;
  try {
    orders = await fetchAllOrders();
  } catch (err) {
    console.error(err);
    ordersTable.innerHTML = "<p> Kunde inte hämta ordrar </p>";
    return;
  }

  ordersTable.innerHTML = "";

  orders.forEach((order) => {
    const optionsHtml = STATUS_OPTIONS.map(
      (opt) =>
        `<option value="${opt.value}" ${opt.value === order.status ? "selected" : ""}>${opt.label}</option>`,
    ).join("");

    ordersTable.innerHTML += `
        <div class="admin-table__row" data-order-id="${order.id}">
        <span>#${order.id}</span>
        <span>${order.full_name}</span>
        <span>${order.total} kr</span>
        <select data-role="status-select">${optionsHtml}</select>
        <button type="button" data-action="save-status">Spara</button>
      </div>
    `;
  });
}

export function setupAdminOrderEvents() {
  const ordersTable = document.getElementById("adminOrdersTable");
  if (!ordersTable) return;

  ordersTable.addEventListener("click", async (event) => {
    if (event.target.dataset.action !== "save-status") return;

    const row = event.target.closest(".admin-table__row");
    const orderId = row.dataset.orderId;
    const select = row.querySelector('[data-role="status-select"]');
    const newStatus = select.value;

    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} uppdaterad!`);
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera status.", "error");
    }
  });
}

export function setupProductForm() {
  const form = document.getElementById("admin-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      await createProduct(formData);
      showToast("Produkten är skapad!");
      form.reset();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte skapa produkten.", "error");
    }
  });
}

export async function renderPendingListings() {
  const table = document.getElementById("pendingListingsTable");
  if (!table) return;

  let listings;
  try {
    listings = await fetchPendingProducts();
  } catch (err) {
    console.error(err);
    table.innerHTML = "<p>Kunde inte hämta annonser.</p>";
    return;
  }

  if (listings.length === 0) {
    table.innerHTML = "<p>Inga annonser väntar på granskning just nu.</p>";
    return;
  }

  table.innerHTML = "";

  listings.forEach((product) => {
    table.innerHTML += `
      <div class="admin-table__row" data-listing-id="${product.id}">
        <span>${product.name}</span>
        <span>${product.seller_name ?? "Okänd säljare"}</span>
        <span>${product.price} kr</span>
        <span class="status-badge status-badge--pending">Väntar</span>
        <div class="admin-actions">
          <button type="button" data-action="approve">Godkänn</button>
          <button type="button" data-action="reject">Neka</button>
        </div>
      </div>
    `;
  });
}

export function setupPendingListingsEvents() {
  const table = document.getElementById("pendingListingsTable");
  if (!table) return;

  table.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    if (action !== "approve" && action !== "reject") return;

    const row = event.target.closest(".admin-table__row");
    const listingId = row.dataset.listingId;
    const newStatus = action === "approve" ? "approved" : "rejected";

    try {
      await updateProductStatus(listingId, newStatus);
      renderPendingListings();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera annonsen.", "error");
    }
  });
}
