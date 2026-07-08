const API_URL = "http://localhost:3001/api";

export async function fetchProducts(){
    const response = await fetch (`${API_URL}/products`);
    if (!response.ok) throw new Error ("Kunde inte hämta produkter");
    return response.json();
}

export async function fetchProductsById(){
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Produkten hittades inte");
    return response.json();
}