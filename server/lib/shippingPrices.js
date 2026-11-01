export const FREE_SHIPPING_FROM = Number(process.env.FREE_SHIPPING_FROM ?? 500);

export const SHIPPING_OPTIONS = {
  service_point: {
    label: "Hämta hos ombud",
    stripeName: "PostNord – ombud",
    price: 59,
  },
  home: {
    label: "Hemleverans",
    stripeName: "PostNord – hemleverans",
    price: 99,
  },
};

export const SHIPPING_METHODS = Object.keys(SHIPPING_OPTIONS); // ["service_point", "home"]

export function shippingPrice(method, subtotal) {
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_OPTIONS[method].price;
}
