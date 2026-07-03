# ReLoved 🌿

En e-handelsplattform för second hand-kläder och accessoarer. Byggd som ett skolprojekt (Full Stack Developer, inriktning E-handel) med målet att gå från grunderna (HTML/CSS) till en fullständig fullstack-applikation.

> ReLoved är ett utbildningsprojekt utvecklat i studiesyfte.

## Om projektet

Administratörer ska kunna lägga till och redigera produkter i en katalog, antingen direkt eller genom att godkänna annonser som användare laddat upp. Kunder kan bläddra bland produkter, spara favoriter, lägga produkter i en varukorg, gå igenom kassan och skapa en order. Administratören kan se och hantera inkommande ordrar.

## Status — vad som är klart just nu

Projektet byggs stegvis: statisk HTML/CSS → vanilla JavaScript → databas/backend → React/TypeScript. Just nu är vi mitt i JavaScript-steget.

**Klart:**
- [x] Alla sidor byggda i HTML/CSS (23 sidor)
- [x] Produktdata som JS-modul (`scripts/products.js`)
- [x] Produktlistan renderas dynamiskt på `home.html` och `products.html`
- [x] Produktdetaljsida (`product.html`) läser `id` från URL:en och visar rätt produkt
- [x] Varukorg (`cart.js`) — lägg till, ta bort, sparas i `localStorage`, badge i headern uppdateras live
- [x] Favoriter (`favorites.js`) — spara/ta bort, sparas i `localStorage`

**Kvar att göra:**
- [ ] Sökfunktion på `search.html` (visar just nu alla produkter, ingen filtrering än)
- [ ] Checkout: läsa varukorgen och skapa en order
- [ ] Orders.html: visa sparade ordrar
- [ ] Admin: lägga till/redigera produkter (skrivbart, inte bara statiskt)
- [ ] Databas (ersätter `localStorage` och `products.js`)
- [ ] Node.js + Express REST API
- [ ] Inloggning/autentisering (admin-roll)
- [ ] Ombyggnad till React + TypeScript
- [ ] Deploy

### Funktionskrav (G)
- [x] Diagram för databas, sitemap och tidsplan
- [ ] Databas uppsatt enligt diagram
- [ ] Admin-gränssnitt för att lägga till/redigera produkter
- [ ] Produkter sparas i databasen
- [x] Kund kan se produktlista och lägga i varukorg
- [ ] Kund kan "betala" och skapa en order
- [ ] Admin kan se lista över ordrar och beställda varor
- [ ] Deployad live

### Funktionskrav (VG)
- [ ] Varukorgen sparas i databasen (inte bara `localStorage`)
- [ ] Inloggning krävs för att redigera produkter (admin-roll)
- [ ] Admin kan uppdatera orderstatus (Beställd, Behandlas, Levererad, Återbetald)

## Tech-stack (utveckling steg för steg)

| Steg | Teknik | Status |
|------|--------|--------|
| 1 | HTML5 + CSS3 | ✅ Klart |
| 2 | Vanilla JavaScript |  Pågår |
| 3 | Databas |  Kommande |
| 4 | Node.js + Express (REST API) |  Kommande |
| 5 | Koppla frontend mot API |  Kommande |
| 6 | React |  Kommande |
| 7 | TypeScript |  Kommande |
| 8 | Autentisering |  Kommande |
| 9 | Deploy |  Kommande |

## Projektstruktur

```
ReLoved/
├── imgs/                  # Produktbilder
├── scripts/
│   ├── products.js        # Produktdata
│   ├── storage.js         # localStorage-hjälpfunktioner
│   ├── cart.js             # Varukorgslogik
│   ├── favorites.js        # Favoritlogik
│   └── main.js              # Kopplar ihop allt, körs på varje sida
├── styles/
│   ├── base/                # Reset, typografi, variabler, utilities
│   ├── layout/               # Återanvändbara komponenter (knappar, kort, header osv)
│   └── pages/                 # Sidspecifik styling
├── *.html                    # 23 sidor (se sitemap-diagram)
└── README.md
```

## Kom igång lokalt

Projektet är byggt utan byggverktyg — öppna det direkt i en lokal server (t.ex. VS Codes Live Server-tillägg), eftersom JavaScript-modulerna (`type="module"`) kräver `http://` och inte fungerar via `file://`.

```bash
git clone <repo-url>
cd ReLoved
```
Öppna sedan `home.html` med Live Server (eller `npx serve .`).

## Licens

Utbildningsprojekt — ej för kommersiellt bruk.
