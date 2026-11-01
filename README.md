# ReLoved

En fullstack e-handelsplattform för second hand kläder och accessoarer. Byggd som ett skolprojekt (Full Stack Developer, inriktning E-handel).

> ReLoved är ett utbildningsprojekt utvecklat i studiesyfte.

## Om projektet

Administratörer kan lägga till och redigera produkter, samt godkänna eller neka annonser som användare laddat upp. Kunder kan bläddra bland produkter, spara favoriter, lägga produkter i en varukorg, gå igenom kassan och skapa en order. Administratörer kan se inkommande ordrar och uppdatera deras status.

## Live

- **Frontend:** https://re-loved.vercel.app
- **API:** https://reloved.onrender.com/api (Render)

## Tech-stack

| Lager    | Teknik                                           |
| -------- | ------------------------------------------------ |
| Frontend | React + TypeScript, Vite, React Router           |
| Backend  | Node.js + Express (REST API)                     |
| Databas  | PostgreSQL (Supabase)                            |
| Auth     | JWT + bcrypt, roller (customer / seller / admin) |
| Filer    | Supabase Storage (produktbilder via multer)      |
| Deploy   | Vercel (frontend) + Node-host (API)              |

## Projektstruktur

```
ReLoved/
├── docs/                     # ER-diagram, sitemap, användarflöde, tidsplan, API-plan
├── database/
│   ├── schema.sql            # Tabeller och seed-data
│   └── migrations/           # Ändringar för labbarna (t.ex. 002_payments.sql)
├── server/                   # Express-API
│   ├── integrations/         # En adapter per extern tjänst (valuta, leverantör, sök, betalning)
│   ├── lib/                  # Supabase-klient, filuppladdning, fetchJson (timeout + retries), searchSync
│   ├── middleware/           # requireAuth / requireAdmin
│   ├── routes/               # products, orders, cart, favorites, auth, users, categories, admin, seller,
│   │                         # currency, search, checkout, webhook
│   └── server.js
└── reloved-app/              # React + TypeScript-frontend
    ├── src/
    │   ├── api/              # API-klient (fetch)
    │   ├── components/       # Header, Footer, RequireAuth, RequireAdmin ...
    │   ├── context/          # Auth, Cart, Favorites, Toast, Currency
    │   ├── pages/            # Publika sidor + admin/ + seller/
    │   └── types/            # TypeScript-typer
    └── ...
```

## Kom igång lokalt

Projektet består av två delar som körs samtidigt: API:et (`server/`) och frontend (`reloved-app/`). Kräver Node 22.6 eller senare, eftersom adaptrarna är skrivna i TypeScript och körs direkt av Node.

### 1. Databas

Skapa ett gratis Supabase-projekt och kör följande i SQL Editor:

1. [`database/schema.sql`](database/schema.sql) tabeller, exempeldata och kolumnerna för leverantörsimporten (`sku`, `ean`, `stock`, `variants`).
2. [`database/migrations/002_payments.sql`](database/migrations/002_payments.sql) – orderstatus `pending`/`paid`, koppling till Stripe och funktionen `mark_order_paid`.
3. Skapa en Storage bucket som heter `products` för produktbilder.
4. Skapa en publik Storage-bucket som heter products för produktbilder.

### 2. Backend (API)

```bash
cd server
npm install
cp .env.example .env
```

Fyll i `server/.env`. Alla variabler finns i [`server/.env.example`](server/.env.example):

| Variabel | Behövs för | Var får jag värdet? |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Databas | Supabase → Project Settings → API |
| `JWT_SECRET` | Inloggning | Valfri lång slumpmässig sträng |
| `CURRENCY_API_URL`, `CURRENCY_API_TIMEOUT_MS`, `CURRENCY_CACHE_SECONDS` | Valutaomvandling | Färdiga värden i `.env.example`, ingen nyckel behövs |
| `SUPPLIER_API_KEY` | Produktimport | Kursens testnyckel för leverantörs-API:et |
| `SUPPLIER_API_URL`, `SUPPLIER_API_TIMEOUT_MS`, `SUPPLIER_BRANSCH` | Produktimport | Färdiga värden i `.env.example` |
| `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_INDEX` | Sökning | Algolia → Settings → API Keys (gratiskonto). Utan `ALGOLIA_APP_ID` startar inte servern. |
| `STRIPE_SECRET_KEY` | Betalning | Stripe (testläge) → Developers → API keys, börjar med `sk_test_` |
| `STRIPE_WEBHOOK_SECRET` | Betalning | Lokalt: `whsec_...` från `stripe listen`. Deployat: från webhook-endpointen i Stripe Dashboard |
| `CLIENT_URL`, `CHECKOUT_EXPIRES_MINUTES` | Betalning | Dit Stripe skickar kunden tillbaka, och hur länge en betalning får pågå (30 min) |

Starta:

```bash
npm run dev
```

API:et körs på `http://localhost:3001`.

**Testa betalningar lokalt:** installera [Stripe CLI](https://docs.stripe.com/stripe-cli), kör `stripe login` och låt den här stå igång i en egen terminal:

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to localhost:3001/api/stripe/webhook
```

Betala med testkortet `4242 4242 4242 4242`, ett datum i framtiden och valfri CVC.

### 3. Frontend

```bash
cd reloved-app
npm install
```

Skapa en `.env` i `reloved-app/` (valfritt lokalt, standard pekar på localhost):

```
VITE_API_URL=http://localhost:3001/api
```

Starta:

```bash
npm run dev
```

Appen körs på `http://localhost:5173`.

### Deploy

- **Frontend:** Vercel, med `VITE_API_URL` satt till API:ets adress.
- **Backend:** Render, startkommando `node server.js`. Samma variabler som i `server/.env` ligger under Environment i Render, med `CLIENT_URL=https://re-loved.vercel.app`.
- **Stripe:** en webhook-endpoint i Stripe Dashboard pekar på `https://reloved.onrender.com/api/stripe/webhook` med händelserna `checkout.session.completed`, `checkout.session.async_payment_succeeded` och `checkout.session.expired`.

## Integrationer

Alla externa tjänster anropas från Express, aldrig direkt från React. Varje tjänst har en egen adapter i `server/integrations/`. Adaptern är det enda stället som känner till tjänstens URL, nycklar och format, och den returnerar ReLoveds egen modell. Gemensamma anrop går via `server/lib/fetchJson.ts`, som har timeout och upp till tre försök vid tillfälliga fel (408, 429, 500, 502, 503 och 504).

### Valutaomvandling (Frankfurter)

**Vad den gör:** kunden väljer valuta (SEK, EUR, USD, GBP) i navbaren, och alla produktpriser räknas om från SEK.

- **Adapter:** `server/integrations/currencyAdapter.ts`
- **Route:** `GET /api/currency/rates`
- **Variabler:** `CURRENCY_API_URL`, `CURRENCY_API_TIMEOUT_MS`, `CURRENCY_CACHE_SECONDS`

**Om tjänsten är nere:** priserna visas i SEK och valutaväljaren inaktiveras. Butiken fungerar som vanligt.

**Val och motiveringar:**
- **Zod-validering:** svaret valideras med Zod. Varje kurs måste vara ett positivt tal, och alla valutor vi bad om måste finnas med. En TypeScript-typ ensam skyddar inte mot felaktig data från ett externt API.
- **Cache i en timme:** kurserna cachas i minnet i en timme. ECB publicerar nya kurser en gång per bankdag, så tätare anrop ger samma svar. Svaret har headern `X-Cache: HIT/MISS`.
- **Räkning från originalpriset:** priserna räknas alltid från originalpriset i SEK, aldrig från ett redan omräknat pris, så att avrundningsfel inte byggs på.
- **Hela belopp:** omräknade priser visas avrundade, t.ex. `$15` och `€14`, eftersom de ändå är ungefärliga. Kassan och ordrarna visar SEK, som är det kunden betalar.

### Labb 1 – Import av produktdata (CSV och XML)

**Vad den gör:** admin importerar leverantörens katalog (bransch `klader`) med knapparna **Importera CSV** och **Importera XML** på adminsidan. Rapporten visar antal nya, uppdaterade och överhoppade produkter, med orsaken till varje överhoppad produkt.

- **Adapter:** `server/integrations/supplierAdapter.ts` – hämtar, avkodar, parsar och mappar.
- **Route:** `POST /api/admin/products/import/:format` i `server/routes/admin.js` – validerar, sparar och rapporterar. Kräver admin.
- **Variabler:** `SUPPLIER_API_URL`, `SUPPLIER_API_KEY`, `SUPPLIER_API_TIMEOUT_MS`, `SUPPLIER_BRANSCH`

```
Adminsidan → POST /api/admin/products/import/:format
  → supplierAdapter.ts: hämta bytes → avkoda → parsa CSV/XML → mappa
  → admin.js: validera med Zod → upsert på sku → rapport
```

**Om tjänsten är nere:** importen avbryts, och admin får meddelandet "Kunde inte hämta leverantörens katalog". Befintliga produkter påverkas inte, och butiken fungerar som vanligt. Importen körs bara när admin klickar, så kunderna märker inget.

**Tolkning av filerna:**

| Problem | CSV | XML |
|---|---|---|
| Teckenkodning | Windows-1252, avkodas med `TextDecoder("windows-1252")` | UTF-8 |
| Decimaltecken | `599,00` (komma) | `599.00` (punkt) |
| Artikelnummer | kolumnen `artNr` | attributet `artNr="…"` |
| EAN | text, behåller inledande nolla | `parseTagValue: false`, behåller nollan |
| Varianter | `S\|M\|L` delas på `\|` | upprepade `<variant>`, alltid en lista (`isArray`) |
| Tomt lagersaldo | `;;` → 0 | `<lagersaldo/>` → 0 |

Båda parsrarna lämnar samma `ProductCandidate`, och samma Zod-schema används för båda formaten.

**Mappning till ReLoveds produktmodell:**

| Leverantören | ReLoved | Motivering |
|---|---|---|
| `artNr` | `sku` (ny, UNIQUE) | Identitet vid upsert. Samma produkt får samma rad oavsett format. |
| `ean` | `ean` (ny, text) | Sparas för framtida lager- och fraktintegrationer. Text, eftersom ett tal tappar den inledande nollan. |
| `benamning` | `name` | |
| `kategori` | `category_id` | Kopplas till en kategori med samma namn, t.ex. "Hoodies" under Herr. Saknas kategorin blir den `NULL`, och produkten syns ändå under Alla produkter. |
| `pris` | `price` | Avrundas till hela kronor, eftersom `price` är `INTEGER` och resten av butiken (varukorg, ordrar) räknar i hela kronor. |
| `lagersaldo` | `stock` (ny) | Tomt värde räknas som 0. Egna secondhand-plagg har `NULL` (alltid "1 av 1"). |
| `varianter` | `variants` (ny, `TEXT[]`) och `size` | Listan sparas, och `size` får t.ex. "S, M, L, XL" eller "One size", så att produktkortet visar storlekar utan ändringar. |
| `uppdaterad` | hoppas över | CSV har bara datum, XML har datum och tid. `updated_at` sätts i stället till tidpunkten för importen. |
| – | `brand` = "FSU25 Grossist", `condition` = "Nyskick", `seller_name` = "ReLoved" | Obligatoriska fält i vår modell som leverantören saknar. |

**Validering:** varje produkt kontrolleras för sig. Artikelnummer måste finnas, EAN ska vara 13 siffror, priset ett tal större än 0 och lagersaldot ett heltal ≥ 0. En trasig produkt hoppas över med en orsak, t.ex. LEV-1037: `price: Priset är inte ett giltigt tal`. Ett ogiltigt pris ersätts aldrig med 0, eftersom produkten då skulle säljas gratis. Fel som gäller hela importen, som fel API-nyckel, trasig XML eller databasfel, avbryter importen med ett felmeddelande.

**Upsert och rapport:** importen hämtar först vilka artikelnummer som redan finns i databasen. De räknas som *uppdaterade*, och övriga som *nya*. "Uppdaterad" betyder att raden skrevs om med leverantörens värden, även om inget faktiskt ändrades. Nya produkter får status `approved` och syns direkt. Befintliga behåller sin status, så en produkt som admin har arkiverat blir inte aktiv igen av en ny import. En andra import, i samma eller det andra formatet, skapar inga nya produkter.

**Lagerstatus i butiken:** produkter med `stock = 0` visas som "Slut i lager" och kan inte läggas i varukorgen. Servern kontrollerar ändå lagret i kassan.

### Labb 2 – Sök-API (Algolia)

**Vad den gör:** kunden söker i sidhuvudet och kommer till `/search`, med stavfelstolerans ("hodie" hittar "Hoodie"), relevansordning och bläddring mellan sidor.

- **Adapter:** `server/integrations/searchAdapter.ts`
- **Synk:** `server/lib/searchSync.js`
- **Route:** `GET /api/search?q=&page=&pageSize=` och `POST /api/admin/search/reindex`
- **Variabler:** `ALGOLIA_APP_ID`, `ALGOLIA_ADMIN_KEY`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_INDEX`

**Om tjänsten är nere:** sökningen visar "Sökningen kunde inte genomföras just nu". Resten av butiken fungerar. Ändringar på adminsidan sparas ändå i databasen, och admin får en varning om att sökindexet inte är uppdaterat. Knappen **Bygg om sökindex** synkar allt när Algolia fungerar igen.

**Val och motiveringar:**
- **Databasen är sanningen, Algolia är en kopia.** Varje ändring sparas först i databasen. Sedan läser `syncProductsToSearch` produkten därifrån och gör sökningen likadan: godkända produkter läggs till eller uppdateras, och väntande, nekade, sålda och arkiverade produkter tas bort.
- **`objectID` = artikelnumret** (`LEV-1001`). Egna secondhand-plagg saknar artikelnummer och får `RL-<id>`. Samma produkt får alltid samma `objectID`, så en ny indexering uppdaterar i stället för att skapa dubbletter.
- **Två nycklar.** Admin-nyckeln, som får skriva, används bara vid indexering. Söknyckeln får bara läsa. Båda finns enbart på servern, och React anropar bara `/api/search`.
- **Validering.** `q` får vara högst 100 tecken, `page` ≥ 1 och `pageSize` 1–48. Ogiltiga värden ger 400 innan Algolia anropas. Algolias träffar valideras också med Zod innan de skickas vidare.
- **Sökbara fält:** namn, märke, kategori, färg, material och beskrivning, i den prioritetsordningen. Pris och bild-URL går inte att söka i.
- **Söktext och sida ligger i URL:en**, så att bakåtknappen fungerar och en sökning går att dela som länk.

### Labb 3 – Betalning (Stripe)

**Vad den gör:** kunden betalar en order med Stripe Checkout (hosted, på Stripes egen sida). Ordern blir betald först när Stripes signerade webhook bekräftar betalningen, och då minskar lagret.

- **Adapter:** `server/integrations/paymentAdapter.ts`
- **Routes:** `POST /api/checkout` och `GET /api/checkout/order?session_id=` i `server/routes/checkout.js`, `POST /api/stripe/webhook` i `server/routes/webhook.js`
- **Databas:** `database/migrations/002_payments.sql`
- **Variabler:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`, `CHECKOUT_EXPIRES_MINUTES`

```
Kassan → POST /api/checkout { kunduppgifter, items: [{ product_id, quantity }] }   (inget pris)
  → validera, hämta priser från databasen, kontrollera lager
  → spara ordern som "pending" → skapa Stripe-session → spara stripe_session_id
Kunden betalar hos Stripe
Stripe → POST /api/stripe/webhook (signerad) → mark_order_paid: "paid" + lagret minskar, en gång
Kunden → /order-confirmation → läser orderns status (ändrar den aldrig)
```

**Om tjänsten är nere:** kunden får "Betaltjänsten svarar inte just nu. Ingenting har dragits." och ordern förblir obetald. Resten av butiken fungerar.

**Val och motiveringar:**
- **Hosted Checkout.** Kunden betalar på Stripes sida, så kortuppgifter passerar aldrig vår server och React behöver ingen Stripe-nyckel alls. Den hemliga nyckeln finns bara på servern.
- **Priset räknas på servern.** React skickar bara `product_id` och antal. Servern hämtar namn, pris och lager från databasen, så beloppet i Stripe stämmer även om någon ändrar priset i webbläsaren. Orderraderna sparar priset vid köpet.
- **Ordern sparas som obetald först**, och orderns id följer med betalningen som `client_reference_id`. Webhooken hittar ordern med det.
- **Bara webhooken gör en order betald.** Signaturen verifieras med `express.raw` och `STRIPE_WEBHOOK_SECRET`. Utan giltig signatur blir svaret 400 och ingen order ändras. Webhooken kontrollerar också att session, belopp och valuta stämmer med ordern. Bekräftelsesidan visar bara status, och admin kan inte välja "Betald".
- **En gång per order.** Databasfunktionen `mark_order_paid` gör en villkorad uppdatering (`WHERE status = 'pending'`) och minskar lagret i samma transaktion. Kommer samma händelse flera gånger, även samtidigt, blir ordern betald och lagret minskat exakt en gång.
- **Lager.** Servern kontrollerar lagret när ordern skapas. Vid betalning minskar leverantörens varor med köpt antal, och unika secondhand-plagg (`stock = NULL`) och slutsålda varor markeras som sålda. Sökindexet uppdateras efteråt.
- **Övergivna ordrar.** Sessionen löper ut efter 30 minuter. `checkout.session.expired` markerar ordern som avbruten, men bara om den fortfarande är obetald. En betald order ändras aldrig.

**Begränsning:** lagret reserveras inte medan kunden betalar. Två kunder kan i teorin hinna betala för den sista varan samtidigt. Saldot kan då inte bli negativt, men varan är översåld och måste hanteras manuellt.

### Labb 4 – Produktbilder i molnlagring

Vad den gör: admin (och säljare) laddar upp en produktbild via vår egen server. Bilden sparas i en publik bucket i Supabase Storage, och butiken visar den med bildens publika URL.

Adapter: server/integrations/storageAdapter.ts
Validering och hjälpfunktioner: server/lib/upload.js (multer, maxstorlek, filtyp) och server/lib/productImages.js (uppladdning, borttagning)
Routes: POST /api/products, PATCH /api/products/:id (admin), POST /api/products/submit, PATCH /api/products/:id/mine (säljare) i server/routes/products.js
Databas: database/migrations/003_product_images.sql (kolumnen image_path)
Variabler: SUPABASE_URL, SUPABASE_SERVICE_KEY (finns redan). Valfritt: SUPABASE_BUCKET (standard products) och SUPABASE_STORAGE_TIMEOUT_MS (standard 10 000)
Supabase: bucketen products måste vara publik
Admin väljer bild → POST/PATCH /api/products (multipart/form-data, fältet "image")
  → multer: max 4 MB, annars 400
  → kontroll av filtyp: bara JPEG/PNG (mimetyp + filens första bytes), annars 400
  → ladda upp till Supabase Storage som <uuid>.jpg/.png (upsert: false) → { path, url }
  → spara image_path + image_url på produkten
  → vid byte: ta bort den gamla filen FÖRST NU
Butiken visar image_url → https://<projekt>.supabase.co/storage/v1/object/public/products/<uuid>.png

Om tjänsten är nere: admin får "Bildtjänsten svarar inte just nu. Ingenting har ändrats, försök igen om en stund." (502). Inget sparas i databasen, och produkten behåller sin gamla bild. Resten av butiken fungerar, och bilder som redan finns visas som vanligt.

Val och motiveringar:

Uppladdning via vår server, inte direkt från React. Den hemliga nyckeln (SUPABASE_SERVICE_KEY) finns bara på servern. Webbläsaren skickar bilden till /api/products och vet inte ens vilken lagringstjänst vi använder.
Validering på servern. Max 4 MB (multer stoppar större filer innan de läses in helt) och bara JPEG eller PNG. Vi kontrollerar både mimetypen och filens första bytes ("magiska bytes"), så en PDF som döpts om till .png avvisas också. Felen blir 400 med ett begripligt meddelande som visas i formuläret. React gör samma kontroll när filen väljs, men bara för att ge besked direkt: servern bestämmer.
Ny unik sökväg för varje bild. Filen får namnet <uuid>.<filändelse>. Adminens filnamn används aldrig (inga konstiga tecken, inga krockar), och upsert: false gör att en fil aldrig skrivs över.
Sökväg och URL sparas på produkten. image_url visas i butiken. image_path behövs för att kunna ta bort rätt fil senare. För äldre produkter som bara har en URL räknas sökvägen ut ur URL:en, men bara om bilden ligger i vår bucket.
Ordning vid byte: ny först, gammal sist. Validera → ladda upp den nya → spara i databasen → ta bort den gamla. Misslyckas något av de tre första stegen finns den gamla bilden kvar, orörd. Misslyckas databasen tas den nyuppladdade filen bort igen. Misslyckas borttagningen av den gamla loggas det bara: en kvarglömd fil är bättre än en produkt utan bild.
Timeout. Adaptern har en egen Supabase-klient med AbortSignal.timeout (10 s) på varje anrop, så att admin får ett svar även om Supabase hänger sig.
Borttagning. När en produkt tas bort tas även dess bild bort ur bucketen.

Begränsningar: bilderna skalas inte om eller komprimeras, så en bild på 4 MB laddas ner i full storlek. Om borttagningen av en gammal bild misslyckas ligger filen kvar i bucketen tills någon tar bort den manuellt. Bucketen är publik: den som har en bildadress kan öppna bilden, vilket är okej för produktbilder men inte för privata filer.

### Labb 5 – Frakt


## Reflektion


## Licens

Utbildningsprojekt — ej för kommersiellt bruk.