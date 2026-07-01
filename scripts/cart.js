import { products } from "./products.js";
import { getCart, saveCart} from "./storage.js";

export function addToCart(productId, quantity = 1){
    const cart = getCart();
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
        existing.quantity += quantity;
    }else {
        cart.push({id: productId, quantity});
    }

    saveCart(cart);
    updateCartBadge();
}

export function updateCartBadge(){
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

export function removeFromCart(productId) {
    const cart = getCart();
    const updated = cart.filter((item) => item.id !== productId);
    saveCart(updated);
    updateCartBadge();
  }
  
  export function renderCartPage() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;
  
    const cart = getCart();
  
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Din varukorg är tom.</p>";
      updateCartSummary(0);
      return;
    }
  
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;
  
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return;
  
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
  
      cartItemsContainer.innerHTML += `
        <article class="cart-item" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.alt}" />
          <div class="cart-item__info">
            <h2>${product.name}</h2>
            <p>${product.brand}</p>
            <p>Antal: ${item.quantity}</p>
            <button type="button" data-action="remove">Ta bort</button>
          </div>
          <p class="cart-item__price">${lineTotal} kr</p>
        </article>
      `;
    });
  
    updateCartSummary(subtotal);
  }
  
  function updateCartSummary(subtotal) {
    const shipping = subtotal > 0 ? 49 : 0;
    const total = subtotal + shipping;
  
    document.getElementById("cartSubtotal").textContent = `${subtotal} kr`;
    document.getElementById("cartShipping").textContent = `${shipping} kr`;
    document.getElementById("cartTotal").textContent = `${total} kr`;
  }
  
  export function setupCartEvents() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;
  
    cartItemsContainer.addEventListener("click", (event) => {
      if (event.target.dataset.action !== "remove") return;
  
      const cartItem = event.target.closest(".cart-item");
      const productId = cartItem.dataset.productId;
  
      removeFromCart(productId);
      renderCartPage();
    });
  }