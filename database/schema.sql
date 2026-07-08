-- ReLoved database schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  address VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  size VARCHAR(50),
  condition VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  material VARCHAR(100),
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url VARCHAR(500),
  alt_text VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'archived')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  full_name VARCHAR(200) NOT NULL,
  address VARCHAR(255) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping INTEGER NOT NULL DEFAULT 49 CHECK (shipping >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'processing', 'shipped', 'delivered', 'refunded', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  product_brand VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  line_total INTEGER NOT NULL CHECK (line_total >= 0)
);

INSERT INTO categories (name, slug) VALUES
('Dam', 'dam'),
('Herr', 'herr'),
('Designer', 'designer'),
('Barn', 'barn'),
('Hem', 'hem'),
('Elektronik', 'elektronik'),
('Sport', 'sport');

-- Exempelprodukter från scripts/products.js
INSERT INTO products (category_id, brand, name, size, condition, color, material, description, price, image_url, alt_text, status) VALUES
(1, 'Zara', 'Svart skinnjacka', 'M', 'Mycket bra', 'Svart', 'Skinn', 'Klassisk svart skinnjacka från Zara i mycket fint skick. Jackan är endast använd ett fåtal gånger och har inga synliga skador eller slitningar.', 350, 'imgs/jacket.png', 'Svart skinnjacka', 'approved'),
(1, 'Mango', 'Blommig sommarklänning', 'S', 'Mycket bra', 'Flerfärgad', 'Bomull', 'Söt blommig sommarklänning från Mango i mycket fint skick. Klänningen är lätt och luftig, perfekt för varma sommardagar.', 180, 'imgs/dress.png', 'Blommig sommarklänning', 'approved'),
(1, 'Vintage', 'Brun handväska', 'One size', 'Mycket bra', 'Brun', 'Läder', 'Elegant brun handväska i vintage-stil. Väskan är i mycket fint skick och har en klassisk design som passar till många olika outfits.', 250, 'imgs/bag.png', 'Brun handväska', 'approved');