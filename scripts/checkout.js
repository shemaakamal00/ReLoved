import { getCart, saveCart } from "./storage.js";
import { createOrder } from "./api.js";
import { updateCartBadge } from "./cart.js";

export function renderCheckoutSummary(products) {
  const checkoutItems = document.getElementById("checkoutItems");
  if (!checkoutItems) return;

  const cart = getCart();
  checkoutItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    checkoutItems.innerHTML += `
      <div class="checkout-item">
        <span>${product.name} × ${item.quantity}</span>
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert("Din varukorg är tom.");
      return;
    }

    const formData = new FormData(form);

    const orderData = {
      email: formData.get("email"),
      phone: formData.get("phone"),
      full_name: formData.get("fullName"),
      address: formData.get("address"),
      postal_code: formData.get("postalCode"),
      city: formData.get("city"),
      items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
    };

    try {
      const order = await createOrder(orderData);
      localStorage.setItem ("reloved-order-email", orderData.email);
      saveCart([]);
      updateCartBadge();
      alert(`Tack för din order! Order #${order.id} är skapad.`);
      window.location.href = "orders.html";
    } catch (err) {
      console.error(err);
      alert("Något gick fel, försök igen.");
    }
  });
}