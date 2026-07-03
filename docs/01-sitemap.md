# ReLoved — Sitemap

```mermaid
flowchart TD
  Home[home.html / Startsida]
  Products[products.html / Produktlista]
  Product[product.html?id=... / Produktdetalj]
  Search[search.html / Sökresultat]
  Favorites[favorites.html / Favoriter]
  Cart[cart.html / Varukorg]
  Checkout[checkout.html / Checkout]
  Orders[orders.html / Mina ordrar]
  Login[login.html / Logga in]
  Register[register.html / Skapa konto]
  Forgot[forgot-password.html / Glömt lösenord]
  Profile[profile.html / Min profil]
  Seller[seller.html / Mina försäljningar]
  Admin[admin.html / Adminpanel]
  About[about.html / Om ReLoved]
  Contact[contact.html / Kontakt]
  FAQ[faq.html / FAQ]
  Privacy[privacy-policy.html / Integritetspolicy]
  Terms[terms-of-service.html / Användarvillkor]
  NotFound[404.html]

  Home --> Products
  Home --> Search
  Home --> Favorites
  Home --> Cart
  Home --> Login
  Home --> Register
  Home --> Seller
  Home --> About
  Home --> Contact
  Home --> FAQ

  Products --> Product
  Search --> Product
  Favorites --> Product
  Product --> Cart
  Cart --> Checkout
  Checkout --> Orders

  Login --> Profile
  Register --> Profile
  Profile --> Orders
  Profile --> Seller

  Seller --> Product
  Seller --> Orders
  Admin --> Products
  Admin --> Orders

  Home --> Privacy
  Home --> Terms
```