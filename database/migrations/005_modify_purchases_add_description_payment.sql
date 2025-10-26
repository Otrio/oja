-- Migration: modify purchases table to support manual expenses
-- 1) drop packs column
-- 2) add description and payment_method columns
-- 3) update positive_quantities constraint to remove packs

BEGIN;

-- Drop existing CHECK constraint if present (named in schema as positive_quantities)
ALTER TABLE IF EXISTS purchases DROP CONSTRAINT IF EXISTS positive_quantities;

-- Drop packs column if exists
ALTER TABLE IF EXISTS purchases DROP COLUMN IF EXISTS packs;

-- Add description and payment_method columns
ALTER TABLE IF EXISTS purchases
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Recreate positive_quantities constraint without packs and make total_units_bought optional
ALTER TABLE IF EXISTS purchases
  ADD CONSTRAINT positive_quantities CHECK (
    units >= 0 AND
    cartons >= 0 AND
    (total_units_bought > 0 OR total_units_bought IS NULL)
  );

COMMIT;

-- Notes:
-- - This migration removes the `packs` column from purchases and introduces `description` and `payment_method`.
-- - If you depend on data in `packs`, run a data-migration prior to dropping the column to preserve values.
-- - After running this migration, update application code to stop sending `packs` to the purchases table (already updated in the frontend).
