import { fetchProducts, fetchProductsById } from "./api.js";
import { addToCart, updateCartBadge, renderCartPage, setupCartEvents } from "./cart.js";
import { toggleFavorite, isFavorited, renderFavoritesPage, setupFavoritesEvents } from "./favorites.js";
import { renderCheckoutSummary, setupCheckoutForm } from "./checkout.js";
const products = await fetchProducts();

const productGrid = document.getElementById("productGrid");

function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  products.forEach((product) => {
    productGrid.innerHTML += `
      <article class="product-card" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}">
          <img src="${product.image_url}" alt="${product.alt_text}" class="product-card__image" />
        </a>
        <div class="product-card-content">
          <p class="product-card__brand">${product.brand}</p>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__meta">${product.size} • ${product.condition}</p>
          <p class="product-card__price">${product.price} kr</p>
          <a href="product.html?id=${product.id}">Visa produkt</a>
        </div>
      </article>
    `;
  });
}

renderProducts();

async function renderProductDetails() {
  const productImage = document.getElementById("productImage");
  if (!productImage) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  let product;
  try {
    product = await fetchProductsById(id);
  } catch {
    document.querySelector(".product").innerHTML = "<p>Produkten hittades inte.</p>";
    return;
  }

  document.getElementById("breadcrumbName").textContent = product.name;
  productImage.src = product.image_url;
  productImage.alt = product.alt_text;

  document.getElementById("productBrand").textContent = product.brand;
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productPrice").textContent = `${product.price} kr`;
  document.getElementById("productSize").textContent = product.size;
  document.getElementById("productCondition").textContent = product.condition;
  document.getElementById("productColor").textContent = product.color;
  document.getElementById("productMaterial").textContent = product.material;
  document.getElementById("productDescription").textContent = product.description;

  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCart(product.id);
      alert(`${product.name} tillagd i varukorgen!`);
    });
  }

  const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
  if (saveFavoriteBtn) {
    saveFavoriteBtn.textContent = isFavorited(product.id) ? "♥ Sparad" : "♡ Spara";
    saveFavoriteBtn.addEventListener("click", () => {
      toggleFavorite(product.id);
      saveFavoriteBtn.textContent = isFavorited(product.id) ? "♥ Sparad" : "♡ Spara";
    });
  }
}

renderProductDetails();
renderCartPage(products);
setupCartEvents(products);
renderFavoritesPage(products);
setupFavoritesEvents(products);
updateCartBadge();
renderCheckoutSummary(products);
setupCheckoutForm();