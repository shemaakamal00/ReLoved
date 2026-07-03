# ReLoved — Databasdiagram

Motsvarar `database/schema.sql`. GitHub renderar diagrammet nedan automatiskt när filen visas på github.com. Se även `ER-diagram.png` för en exporterad bild av samma diagram.

```mermaid
erDiagram
  USERS ||--o{ PRODUCTS : sells
  USERS ||--o{ FAVORITES : saves
  USERS ||--o{ CARTS : owns
  USERS ||--o{ ORDERS : places

  CATEGORIES ||--o{ PRODUCTS : contains

  PRODUCTS ||--o{ FAVORITES : saved_as
  PRODUCTS ||--o{ CART_ITEMS : added_to
  PRODUCTS ||--o{ ORDER_ITEMS : ordered_as

  CARTS ||--o{ CART_ITEMS : contains
  ORDERS ||--o{ ORDER_ITEMS : contains

  USERS {
    int id PK
    string first_name
    string last_name
    string email UK
    string password_hash
    string role
    string address
    string postal_code
    string city
    timestamp created_at
  }

  CATEGORIES {
    int id PK
    string name UK
    string slug UK
  }

  PRODUCTS {
    int id PK
    int seller_id FK
    int category_id FK
    string brand
    string name
    string size
    string condition
    string color
    string material
    text description
    int price
    string image_url
    string alt_text
    string status
    timestamp created_at
    timestamp updated_at
  }

  FAVORITES {
    int user_id PK,FK
    int product_id PK,FK
    timestamp created_at
  }

  CARTS {
    int id PK
    int user_id FK
    timestamp created_at
    timestamp updated_at
  }

  CART_ITEMS {
    int cart_id PK,FK
    int product_id PK,FK
    int quantity
  }

  ORDERS {
    int id PK
    int user_id FK
    string email
    string phone
    string full_name
    string address
    string postal_code
    string city
    int subtotal
    int shipping
    int total
    string status
    timestamp created_at
  }

  ORDER_ITEMS {
    int id PK
    int order_id FK
    int product_id FK
    int seller_id FK
    string product_name
    string product_brand
    int quantity
    int unit_price
    int line_total
  }
```