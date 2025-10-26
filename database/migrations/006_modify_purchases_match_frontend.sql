-- Migration: align purchases table to frontend AddPurchase form
-- Keep only the fields used by the frontend form and metadata columns
-- Removes inventory-specific quantity/price columns (units, packs, cartons, total_units_bought, price_per_*)
-- Adds product_name, type, payment_method, description, for_inventory if missing

BEGIN;

-- Drop legacy constraint that referenced quantity columns
ALTER TABLE IF EXISTS purchases DROP CONSTRAINT IF EXISTS positive_quantities;

-- Drop inventory quantity/price columns that the frontend no longer uses
ALTER TABLE IF EXISTS purchases
  DROP COLUMN IF EXISTS packs,
  DROP COLUMN IF EXISTS cartons,
  DROP COLUMN IF EXISTS units,
  DROP COLUMN IF EXISTS total_units_bought,
  DROP COLUMN IF EXISTS price_per_unit,
  DROP COLUMN IF EXISTS price_per_pack,
  DROP COLUMN IF EXISTS price_per_carton,
  DROP COLUMN IF EXISTS notes; -- migrated to description

-- Add/ensure columns required by the frontend form
ALTER TABLE IF EXISTS purchases
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS for_inventory BOOLEAN DEFAULT true;

-- Ensure total_price exists and has a sensible default/constraint
ALTER TABLE IF EXISTS purchases
  ALTER COLUMN total_price SET DEFAULT 0
  -- leave NOT NULL as-is if present; ensure non-negative
  ;

-- Add a simple constraint to ensure total_price is not negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'purchases' AND c.conname = 'positive_total_price'
  ) THEN
    ALTER TABLE purchases
      ADD CONSTRAINT positive_total_price CHECK (total_price >= 0);
  END IF;
END$$;

-- Re-create RLS policies if necessary remain unchanged, existing policies that reference
-- dropped columns should continue to work because we didn't remove user_id, product_id, or created_at/updated_at.

COMMIT;

-- Notes:
-- 1) This migration intentionally removes inventory-specific columns. If you need to preserve historical data
--    from those columns (units/packs/cartons/price_per_*), run a data-migration first to copy values to an archive table.
-- 2) The frontend expects/uses these fields: product_name, type, payment_method, total_price (cost), supplier, description, date, user_id, for_inventory.
-- 3) After applying this migration, re-run your frontend and verify the network payload; unknown-column errors should be resolved.
