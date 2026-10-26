## Kom igång lokalt
Projektet består av två delar som körs samtidigt: API:et (`server/`) och frontend (`reloved-app/`). Kräver Node 22.6 eller senare, eftersom adaptrarna är skrivna i TypeScript och körs direkt av Node.

### 1. Databas
Skapa ett gratis Supabase-projekt och kör följande i SQL Editor:

1. [`database/schema.sql`](database/schema.sql) – tabeller, exempeldata och kolumnerna för leverantörsimporten (`sku`, `ean`, `stock`, `variants`).
2. Skapa en Storage-bucket som heter `products` för produktbilder.

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

Starta:

```bash
npm run dev
```

API:et körs på `http://localhost:3001`.

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
- **Backend:** Render, startkommando `node server.js`. Samma variabler som i `server/.env` ligger under Environment i Render.

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

**Validering:** varje produkt kontrolleras för sig. Artikelnummer måste finnas, EAN ska vara 13 siffror, priset ett tal större än 0 och lagersaldot ett heltal ≥ 0. En trasig produkt hoppas över med en orsak, t.ex. LEV-1037: `price: Priset är inte ett giltigt tal`. Ett ogiltigt pris ersätts aldrig med 0, eftersom produkten då skulle säljas gratis. Fel som gäller hela importen, som fel API-nyckel, trasig XML eller databasfel,