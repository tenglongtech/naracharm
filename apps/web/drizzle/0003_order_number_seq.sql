-- Add PG sequence for order numbers (used by /api/stripe-webhook)
-- Format: NC-00001, NC-00002, ...
-- Idempotent: IF NOT EXISTS
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10000 INCREMENT 1;
