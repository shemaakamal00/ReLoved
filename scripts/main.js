import { products } from "./products.js";

const productGrid = document.getElementById("productGrid");

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    products.forEach((product) => {
        productGrid.innerHTML += `
        <article class="product-card" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}">
        <img 
          src="${product.image}" 
          alt="${product.alt}" 
          class="product-card__image"
        />
        </a>

        <div class="product-card__content">
          <p class="product-card__brand">${product.brand}</p>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__meta">
            ${product.size} • ${product.condition}
          </p>
          <p class="product-card__price">${product.price} kr</p>
          <a href="product.html?id=1">Visa produkt</a>
        </div>
      </article>
        `;
    });
}

renderProducts();