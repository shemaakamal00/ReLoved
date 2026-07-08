import { fetchOrders } from "./api.js";

const STATUS_LABELS = {
  ordered: { text: "Beställd", className: "status-badge--pending" },
  processing: { text: "Behandlas", className: "status-badge--pending" },
  shipped: { text: "Skickad", className: "status-badge--shipped" },
  delivered: { text: "Levererad", className: "status-badge--paid" },
  refunded: { text: "Återbetald", className: "status-badge--refunded" },
  cancelled: { text: "Avbruten", className: "status-badge--refunded" },
};

export async function renderOrdersPage() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  const email = localStorage.getItem("reloved-order-email");

  if (!email) {
    ordersList.innerHTML =
      "<p>Duu har inga ordrar än. Handla något, så kommer de att visas här.</p>";
    return;
  }

  let orders;
  try {
    orders = await fetchOrders(email);
  } catch (err) {
    console.error(err);
    ordersList.innerHTML =
      "<p>Det gick inte att hämta dina ordrar. Försök igen senare.</p>";
    return;
  }

if (orders.length === 0) {
  ordersList.innerHTML = "<p>Duu har inga ordrar än.</p>";
  return;
}

ordersList.innerHTML = "";

orders.forEach((order) => {
  const status = STATUS_LABELS[order.status] ?? {
    text: order.status,
    className: "status-badge--pending",
  };

  ordersList.innerHTML += `
            <article class="order-card" data-order-id="${order.id}">
            <div class="order-card__top">
              <div>
                <p class="eyebrow">Order #${order.id}</p>
                <h2>${new Date(order.created_at).toLocaleDateString("sv-SE")}</h2>
              </div>
              <span class="status-badge ${status.className}">${status.text}</span>
            </div>
    
            <div class="order-card__bottom">
              <span>Totalt: ${order.total} kr</span>
            </div>
          </article>
        `;
});
}
