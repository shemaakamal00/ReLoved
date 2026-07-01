const CART_KEY = "reloved-cart";

export function getCart(){
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const FAVORITES_KEY = "relovedFavorites";

export function getFavorites(){
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }catch{
        return [];
    }
}

export function saveFavorites (favorites){
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}