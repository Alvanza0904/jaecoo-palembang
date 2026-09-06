-- JAECOO Palembang — STEP 5D: Smart Media Processing
--
-- Additive only — no DROP TABLE, no destructive ops.
-- Run in Supabase SQL editor.
--
-- Changes:
--   1. media_assets: add processing_status, cutout_url, variants JSONB
--   2. model_variants: add cutout_media_id reference
--   3. models: add cutout_media_id reference

-- ─── 1. Extend media_assets ───────────────────────────────────────────────

-- Processing status enum
DO $$ BEGIN
  CREATE TYPE media_processing_status AS ENUM (
    'uploaded',    -- original uploaded, no processing yet
    'processing',  -- variants/cutout being generated
    'ready',       -- all processing done
    'partial',     -- original ok, some processing failed
    'failed'       -- processing failed (original still accessible)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add processing_status column
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS processing_status media_processing_status NOT NULL DEFAULT 'uploaded';

-- Add cutout URL (transparent PNG/WebP of vehicle without background)
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS cutout_url text;

-- Add cutout storage path (for deletion)
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS cutout_storage_path text;

-- Add variants JSONB — stores all responsive variant URLs
-- Structure: { "1920": "url", "1440": "url", "1024": "url", "768": "url", "480": "url", "thumb": "url" }
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '{}';

-- Add alt text for accessibility
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS alt_text text;

-- Add processing error message (for debugging failed processing)
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS processing_error text;

-- ─── 2. Add cutout_media_id to models (for layered Hero) ─────────────────

-- models table: separate cutout reference from hero background
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS cutout_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;

COMMENT ON COLUMN models.cutout_media_id IS
  'Vehicle cutout (transparent BG) for layered Hero. Separate from hero_asset_id (background).';

-- ─── 3. Add cutout_media_id to model_variants ────────────────────────────

ALTER TABLE model_variants
  ADD COLUMN IF NOT EXISTS cutout_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;

COMMENT ON COLUMN model_variants.cutout_media_id IS
  'Per-variant cutout if needed (e.g. different color shows different angle).';

-- ─── 4. Add index on processing_status ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_media_processing_status
  ON media_assets(processing_status);

-- ─── 5. Comments ──────────────────────────────────────────────────────────

COMMENT ON COLUMN media_assets.processing_status IS
  'uploaded → processing → ready | partial | failed. Original always accessible.';
COMMENT ON COLUMN media_assets.cutout_url IS
  'Public URL of vehicle cutout (transparent WebP). Null until background removal done.';
COMMENT ON COLUMN media_assets.variants IS
  'Responsive variants: {"1920":"url","1440":"url","1024":"url","768":"url","480":"url","thumb":"url"}';
COMMENT ON COLUMN media_assets.alt_text IS
  'Accessibility alt text. Set by admin in media detail.';
COMMENT ON COLUMN media_assets.processing_error IS
  'Last processing error message. Cleared on successful retry.';
