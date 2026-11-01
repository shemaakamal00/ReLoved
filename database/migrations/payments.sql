-- Betalning med Stripe

-- 1. Två nya orderstatusar: 'pending' (sparad, inte betald) och 'paid' (betald enligt Stripes webhook)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending', 'paid', 'ordered', 'processing', 'shipped', 'delivered', 'refunded', 'cancelled'
));
-- Nya ordrar är obetalda tills webhooken säger något annat
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- 2. Kopplingen till Stripe och när betalningen bekräftades
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- 3. Markera en order som betald och minska lagret, i en transaktion, och bara en gång.
CREATE OR REPLACE FUNCTION mark_order_paid(p_order_id INTEGER, p_session_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE orders
     SET status = 'paid', paid_at = NOW()
   WHERE id = p_order_id
     AND status = 'pending'
     AND stripe_session_id = p_session_id;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows = 0 THEN
    RETURN 'already_handled';
  END IF;

  UPDATE products p
     SET stock = GREATEST(p.stock - oi.quantity, 0),
         updated_at = NOW()
    FROM order_items oi
   WHERE oi.order_id = p_order_id
     AND oi.product_id = p.id
     AND p.stock IS NOT NULL;

  UPDATE products p
     SET status = 'sold',
         updated_at = NOW()
    FROM order_items oi
   WHERE oi.order_id = p_order_id
     AND oi.product_id = p.id
     AND (p.stock IS NULL OR p.stock = 0);

  RETURN 'paid';
END;
$$;