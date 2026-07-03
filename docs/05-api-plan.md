# ReLoved — API-plan

Endpoints som matchar `database/schema.sql`. Byggs med Node.js + Express, kopplat mot Supabase (Postgres).

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

GET    /api/categories

GET    /api/favorites
POST   /api/favorites/:productId
DELETE /api/favorites/:productId

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status

POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
```

## Anteckningar

- `PATCH /api/products/:id` (redigera) och `POST /api/products` (skapa) ska kräva inloggad admin — se VG-kravet om att endast admin kan redigera produkter.
- `PATCH /api/orders/:id/status` används av admin för att uppdatera orderstatus (Beställd/Behandlas/Levererad/Återbetald) — VG-krav.
- `GET /api/cart` och `POST /api/cart/items` ska vara knutna till inloggad användares `user_id`, inte bara en anonym `localStorage`-korg — VG-krav om att varukorgen sparas i databasen.