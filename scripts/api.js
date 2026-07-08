const API_URL = "http://localhost:3001/api";

export async function fetchProducts(){
    const response = await fetch (`${API_URL}/products`);
    if (!response.ok) throw new Error ("Kunde inte hämta produkter");
    return response.json();
}

export async function fetchProductsById(id){
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Produkten hittades inte");
    return response.json();
}

export async function createOrder (orderData) {
    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error ("Kunde inte skapa order");
    return response.json();
}

export async function fetchOrders(email) {
    const response = await fetch (`${API_URL}/orders?email=${encodeURIComponent(email)}`);
    if(!response.ok) throw new Error("Kunde inte hämta ordrar");
    return response.json();
}