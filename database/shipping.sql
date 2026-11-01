-- Frakten sparas på ordern.
-- shipping (fanns redan) = fraktpriset i kronor, räknat av servern från shoppens egen prislista.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method TEXT
    CHECK (shipping_method IN ('service_point', 'home')),
  ADD COLUMN IF NOT EXISTS service_point_id TEXT,      -- PostNords id, behövs för etiketten
  ADD COLUMN IF NOT EXISTS service_point_name TEXT,    -- visas på ordern utan att fråga PostNord igen
  ADD COLUMN IF NOT EXISTS service_point_address TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery DATE;    -- PostNords beräknade leveransdag när ordern lades

-- Ett ombud kräver ett ombuds-id, hemleverans har inget
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_point_check;
ALTER TABLE orders ADD CONSTRAINT orders_service_point_check
  CHECK (shipping_method IS DISTINCT FROM 'service_point' OR service_point_id IS NOT NULL);