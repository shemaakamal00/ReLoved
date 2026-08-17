[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/r1QxwNOh)

# ReLoved

En fullstack e-handelsplattform för second hand-kläder och accessoarer. Byggd som ett skolprojekt (Full Stack Developer, inriktning E-handel).

> ReLoved är ett utbildningsprojekt utvecklat i studiesyfte.

## Om projektet

Administratörer kan lägga till och redigera produkter, samt godkänna eller neka annonser som användare laddat upp. Kunder kan bläddra bland produkter, spara favoriter, lägga produkter i en varukorg, gå igenom kassan och skapa en order. Administratörer kan se inkommande ordrar och uppdatera deras status.

## Live

- **Frontend:** https://re-loved.vercel.app
- **API:** deployad separat (se `VITE_API_URL` i frontend-miljön)

## Funktionskrav

### Betyg G
- [x] Diagram för databas (ER), sitemap, användarflöde och tidsplan — se [`docs/`](docs/)
- [x] Databas uppsatt enligt diagram — se [`database/schema.sql`](database/schema.sql)
- [x] Admin-gränssnitt för att lägga till/redigera produkter
- [x] Produkter sparas i databasen
- [x] Kund kan se produktlista och lägga i varukorg
- [x] Kund kan "betala" i kassan och skapa en order
- [x] Admin kan se lista över ordrar och beställda varor
- [x] Deployad live (Vercel + separat API)

### Betyg VG
- [x] Varukorgen sparas i databasen (gäst-korg i `localStorage` slås ihop till DB-korgen vid inloggning)
- [x] Inloggning krävs för att redigera produkter (admin-roll, skyddat i både frontend och backend)
- [x] Admin kan uppdatera orderstatus (Beställd, Behandlas, Skickad, Levererad, Återbetald, Avbruten)

## Tech-stack

| Lager | Teknik |
|-------|--------|
| Frontend | React + TypeScript, Vite, React Router |
| Backend | Node.js + Express (REST API) |
| Databas | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt, roller (customer / seller / admin) |
| Filer | Supabase Storage (produktbilder via multer) |
| Deploy | Vercel (frontend) + Node-host (API) |

## Projektstruktur

```
ReLoved/
├── docs/                     # ER-diagram, sitemap, användarflöde, tidsplan, API-plan
├── database/
│   └── schema.sql            # Tabeller + seed-data
├── server/                   # Express-API
│   ├── lib/                  # Supabase-klient, filuppladdning
│   ├── middleware/           # requireAuth / requireAdmin
│   ├── routes/               # products, orders, cart, favorites, auth, users, categories, admin, seller
│   └── server.js
└── reloved-app/              # React + TypeScript-frontend
    ├── src/
    │   ├── api/              # API-klient (fetch)
    │   ├── components/       # Header, Footer, RequireAuth, RequireAdmin ...
    │   ├── context/          # Auth, Cart, Favorites, Toast
    │   ├── pages/            # Publika sidor + admin/ + seller/
    │   └── types/            # TypeScript-typer
    └── ...
```

## Kom igång lokalt

Projektet består av två delar som körs samtidigt: API:et (`server/`) och frontend (`reloved-app/`).

### 1. Databas
Skapa ett gratis Supabase-projekt och kör [`database/schema.sql`](database/schema.sql) i SQL-editorn så att tabeller och exempel-data skapas. Skapa även en Storage-bucket som heter `products` för produktbilder.

### 2. Backend (API)
```bash
cd server
npm install
```
Skapa en `.env` i `server/`:
```
SUPABASE_URL=din-supabase-url
SUPABASE_SERVICE_KEY=din-service-key
JWT_SECRET=en-lang-slumpmassig-strang
PORT=3001
```
Starta:
```bash
node server.js
```
API:et körs på `http://localhost:3001`.

### 3. Frontend
```bash
cd reloved-app
npm install
```
Skapa en `.env` i `reloved-app/` (valfritt lokalt, default pekar på localhost):
```
VITE_API_URL=http://localhost:3001/api
```
Starta:
```bash
npm run dev
```
Appen körs på `http://localhost:5173`.

## Licens

Utbildningsprojekt — ej för kommersiellt bruk.
