import {fetchAllOrders, updateOrderStatus} from "./api.js";

const STATUS_OPTIONS = [
    {value: "ordered", label: "Beställd"},
    {value: "processing", label: "Behandlas"},
    {value: "shipped", label: "Skickad"},
    {value: "delivered", label: "Levererad"},
    {value: "refunded", label: "Återbetald"},
    {value: "cancelled", label: "Avbruten"},
];

export async function renderAdminOrders(){
    const ordersTable = document.getElementById("adminOrdersTable");
    if(!ordersTable) return;
    let orders;
    try{
        orders = await fetchAllOrders();
    } catch (err) {
        console.error(err);
        ordersTable.innerHTML ="<p> Kunde inte hämta ordrar </p>";
        return;
    }

    ordersTable.innerHTML = "";

    orders.forEach((order)=>{
        const optionsHtml = STATUS_OPTIONS.map(
            (opt) =>
                `<option value="${opt.value}" ${opt.value === order.status ? "selected" : ""}>${opt.label}</option>`
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

export function setupAdminOrderEvents(){
    const ordersTable = document.getElementById("adminOrdersTable");
    if(!ordersTable) return;

    ordersTable.addEventListener("click", async (event)=>{
        if(event.target.dataset.action !== "save-status") return;

        const row = event.target.closest(".admin-table__row");
        const orderId = row.dataset.orderId;
        const select = row.querySelector('[data-role="status-select"]');
        const newStatus = select.value;

        try {
            await updateOrderStatus(orderId, newStatus);
            alert(`Order #${orderId} uppdaterad!`);
        } catch (err) {
            console.error(err);
            alert("kunde inte uppdatera status");
        }
    });
}