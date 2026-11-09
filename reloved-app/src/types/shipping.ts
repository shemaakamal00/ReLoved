export type ShippingMethod = "service_point" | "home";

export interface ServicePoint {
  id: string;
  name: string;
  address: string;
  distanceMeters: number | null;
}

export interface ShippingOption {
  method: ShippingMethod;
  label: string;
  price: number;
  estimatedDelivery: string | null;
}

export interface ShippingQuote {
  subtotal: number;
  freeShippingFrom: number;
  options: ShippingOption[];
  servicePoints: ServicePoint[] | null;
  servicePointsError: string | null;
}

/** Det som skickas till API:et: bara id och antal, aldrig pris. */
export interface CartItemPayload {
  product_id: number;
  quantity: number;
}
