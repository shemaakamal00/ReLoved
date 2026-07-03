# ReLoved — Användarflöden

Tre huvudflöden i systemet: kund som handlar, kund som säljer, och admin som modererar.

## 1. Kund — handla en produkt

```mermaid
flowchart LR
  A[Bläddra på home / products / search] --> B[Öppna produktsida]
  B --> C{Vill spara eller köpa?}
  C -->|Spara| D[Lägg till i favoriter]
  C -->|Köpa| E[Lägg i varukorg]
  E --> F[Gå till varukorg]
  F --> G[Fyll i kassan]
  G --> H[Order skapas i databasen]
  H --> I[Order visas på Mina ordrar]
```

## 2. Kund — sälj en produkt (annonsflöde)

```mermaid
flowchart LR
  A[Logga in] --> B[Gå till Sälj-sidan]
  B --> C[Fyll i produktformulär]
  C --> D[Skicka för granskning]
  D --> E[status = pending]
  E --> F{Admin granskar}
  F -->|Godkänns| G[status = approved\nSynlig i katalogen]
  F -->|Nekas| H[status = rejected\nSäljaren kan redigera och skicka igen]
```

## 3. Admin — moderera och hantera ordrar

```mermaid
flowchart LR
  A[Logga in som admin] --> B[Öppna granskningskö]
  B --> C{Produkt i kön}
  C -->|Godkänn| D[status = approved]
  C -->|Neka| E[status = rejected]
  A --> F[Öppna orderlista]
  F --> G[Välj order]
  G --> H[Uppdatera status:\nBeställd → Behandlas → Levererad / Återbetald]
```

## Sammanfattning av statusflöden

| Entitet | Statusfält | Möjliga värden | Vem ändrar |
|---|---|---|---|
| `products.status` | Annonsstatus | `pending` → `approved` / `rejected` (senare `sold`, `archived`) | Admin (godkänner/nekar), system (sold) |
| `orders.status` | Orderstatus | `ordered` → `processing` → `shipped` → `delivered` (eller `refunded`/`cancelled`) | Admin |