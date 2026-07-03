# ReLoved — Tidsplan och roadmap

## Tidsplan

| Vecka | Fokus | Leverans |
|---|---|---|
| 1 | Planering | Databasdiagram, sitemap och tidsplan klara |
| 2 | Databas | Tabeller skapas i Supabase enligt schema + seed-data från `products.js` |
| 3 | Backend/API | Node.js + Express, endpoints för produkter och kategorier |
| 4 | Varukorg/order | Checkout skapar order och order_items |
| 5 | Admin/säljare | Skapa/redigera produkter, godkänna annonser, se ordrar |
| 6 | Auth/roller | Login, register, admin/seller/customer-behörigheter |
| 7 | React/TypeScript | Bygg om sidor till komponenter och typa data |
| 8 | Test/deploy | Fixa buggar, deploya live, uppdatera README |

## Ordning

1. Skapa ett gratis Supabase-projekt.
2. Kör `database/schema.sql` i Supabases SQL-editor så tabeller och exempelprodukter skapas.
3. Bygg API:et (se `05-api-plan.md`) innan React/TypeScript, så frontend senare kan hämta data från riktiga endpoints istället för `products.js`.
4. Koppla om `cart.js`/`favorites.js` från `localStorage` till `fetch`-anrop mot API:et.
5. Byt ut `scripts/products.js` sist, när API:et kan returnera samma produktfält.