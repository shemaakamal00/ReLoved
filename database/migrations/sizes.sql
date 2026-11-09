-- Storlek och antal för lagervaror (t.ex. från FSU25 Grossist)

-- Varukorgen sparar vald storlek. Tom text betyder "ingen storlek"
--    (second hand-plagg och produkter utan varianter).
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT '';

-- Samma produkt kan ligga i varukorgen i flera storlekar,
-- så storleken blir en del av nyckeln.
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE cart_items ADD PRIMARY KEY (cart_id, product_id, size);

-- Orderraden sparar storleken så att den syns på ordern och följesedeln.
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS size TEXT;
