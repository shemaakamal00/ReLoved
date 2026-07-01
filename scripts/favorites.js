import { products } from "./products.js";
import { getFavorites, saveFavorites } from "./storage.js";

export function toggleFavorite(productId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(productId);

  if (index === -1) {
    favorites.push(productId);
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
}

export function isFavorited(productId) {
  return getFavorites().includes(productId);
}

export function renderFavoritesPage() {
  const favoritesList = document.querySelector("[data-favorites-list]");
  const favoritesEmpty = document.querySelector("[data-favorites-empty]");
  if (!favoritesList) return;

  const favoriteIds = getFavorites();
  favoritesList.innerHTML = "";

  if (favoriteIds.length === 0) {
    if (favoritesEmpty) favoritesEmpty.hidden = false;
    return;
  }

  if (favoritesEmpty) favoritesEmpty.hidden = true;

  favoriteIds.forEach((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    favoritesList.innerHTML += `
      <article class="product-card" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.alt}" class="product-card__image" />
        </a>
        <div class="product-card-content">
          <p class="product-card__brand">${product.brand}</p>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__meta">${product.size} • ${product.condition}</p>
          <p class="product-card__price">${product.price} kr</p>
          <button type="button" class="button button-secondary" data-action="remove-favorite">♥ Ta bort</button>
        </div>
      </article>
    `;
  });
}

export function setupFavoritesEvents() {
  const favoritesList = document.querySelector("[data-favorites-list]");
  if (!favoritesList) return;

  favoritesList.addEventListener("click", (event) => {
    if (event.target.dataset.action !== "remove-favorite") return;

    const card = event.target.closest(".product-card");
    const productId = card.dataset.productId;

    toggleFavorite(productId);
    renderFavoritesPage();
  });
}