-- ─────────────────────────────────────────────────────────────────────────────
-- JAECOO Palembang — STEP 5B.1: Add price_status to model_variants
--
-- Safe to run on existing data:
--   - Uses IF NOT EXISTS / DO $$ ... $$ guards
--   - Existing variants default to 'official' (harga nominal tampil normal)
--   - price_idr & price_display become nullable (status lain tidak butuh angka)
--   - Existing prices (J5 EV, J7 SHS, J8 SHS) tidak berubah
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create enum type (idempotent)
DO $$ BEGIN
  CREATE TYPE price_status_enum AS ENUM (
    'official',
    'prebook',
    'coming_soon',
    'contact_sales',
    'starting_from',
    'hidden'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL; -- already exists, skip
END $$;

-- 2. Add price_status column (idempotent)
ALTER TABLE model_variants
  ADD COLUMN IF NOT EXISTS price_status price_status_enum NOT NULL DEFAULT 'official';

-- 3. Make price_idr nullable (safe — existing rows keep their values)
ALTER TABLE model_variants
  ALTER COLUMN price_idr DROP NOT NULL;

-- 4. Make price_display nullable (safe — existing rows keep their values)
ALTER TABLE model_variants
  ALTER COLUMN price_display DROP NOT NULL;

-- 5. Add price_display_override — optional human-readable override
--    e.g. "Mulai dari Rp500 juta" or "PRE-BOOK sekarang"
ALTER TABLE model_variants
  ADD COLUMN IF NOT EXISTS price_display_override text;

-- 6. Backfill: existing variants get 'official' (already default, just confirm)
UPDATE model_variants
SET price_status = 'official'
WHERE price_status IS NULL;

-- 7. Add comment
COMMENT ON COLUMN model_variants.price_status IS
  'Controls how price is displayed: official=nominal, prebook=pre-order badge, coming_soon=coming soon badge, contact_sales=CTA only, starting_from=mulai dari, hidden=no price shown';

COMMENT ON COLUMN model_variants.price_display_override IS
  'Optional override for price_display text. If null, price_display is auto-formatted from price_idr.';
