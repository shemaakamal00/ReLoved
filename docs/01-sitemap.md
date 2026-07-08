# ReLoved — Sitemap

## Textformat

```
home.html
├── products.html
│   └── product.html?id=...
├── search.html
│   └── product.html?id=...
├── favorites.html
│   └── product.html?id=...
├── cart.html
│   └── checkout.html
│       └── orders.html
├── login.html
│   └── profile.html
│       ├── orders.html
│       └── seller.html
│           ├── product.html?id=...
│           └── orders.html
├── register.html
│   └── profile.html
├── about.html
├── contact.html
├── faq.html
├── privacy-policy.html
├── terms-of-service.html
└── 404.html  (visas vid ogiltig/saknad URL, ej länkad från menyn)

admin.html  (separat, kräver admin-roll)
├── products.html   (lägg till / redigera / granska annonser)
└── orders.html     (lista + uppdatera status)
```

## Diagramformat

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