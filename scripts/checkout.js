import { getCart, saveCart } from "./storage.js";
import { createOrder } from "./api.js";
import { updateCartBadge } from "./cart.js";

export function renderChecoutSummary(products) {
  const checkoutItems = document.getElementById("checkoutItems");

  if (!checkoutItems) return;

  const cart = getCart();
  checkoutItems.innerHTML = "";
  let subtotal = 0;

  cart.fortEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    checkoutItems.innerHTML += `
        <div class="checkout-item">
            <span> ${product.name} (${item.quantity})</span>
            <span>${lineTotal} kr</span>
        </div>
        `;
  });

  const shipping = subtotal > 0 ? 49 : 0;
  const total = subtotal + shipping;

  document.getElementById("checkoutSubtotal").textContent = `${subtotal} kr`;
  document.getElementById("checkoutShipping").textContent = `${shipping} kr`;
  document.getElementById("checkoutTotal").textContent = `${total} kr`;
}

export function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListner("submit", async (event) => {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert("Din varukorg är tom");
      return;
    }

    const formData = new FormData(form);

    const orderData = {
      email: formData.get("email"),
      phone: formData.get("phone"),
      full_name: formData.get("full_name"),
      address: formData.get("address"),
      postal_code: formData.get("postal_code"),
      city: formData.get("city"),
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const order = await createOrder(orderData);
      saveCart([]);
      updateCartBadge();
      alert(`Tack för din order! Order #${order.id} har skapats.`);
      window.location.href = "order.html";
    } catch (err) {
      console.error(err);
      alert("Något gick fel vid skapandet av ordern. Försök igen senare.");
    }
  });
}
