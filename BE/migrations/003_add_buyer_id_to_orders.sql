-- Migration: Add buyer_id field to orders table for linking orders to buyer accounts
-- This allows guest purchases to be linked when users create accounts

-- Add buyer_id column (nullable, since existing orders are guest orders)
ALTER TABLE orders
ADD COLUMN buyer_id UUID;

-- Add foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_buyer
FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster buyer order queries
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);

-- Optional: Link existing orders to users if email matches
-- This automatically links any existing guest orders to accounts with matching emails
UPDATE orders o
SET buyer_id = u.id
FROM users u
WHERE o.buyer_email = u.email
  AND o.buyer_id IS NULL;
