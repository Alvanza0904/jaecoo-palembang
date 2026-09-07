-- JAECOO Palembang — STEP 5E: Visual Media Editor
-- 
-- Additive only — no DROP TABLE, no destructive ops.
-- Run in Supabase SQL editor.
--
-- Changes:
--   1. media_assets: add presentation_settings JSONB
--      Stores per-breakpoint visual editor data:
--      position, scale, focal point, object-fit, mode, inheritance, 
--      cutout positioning, typography readiness.

-- ─── 1. Add presentation_settings to media_assets ─────────────────────────

ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS presentation_settings jsonb DEFAULT '{}';

COMMENT ON COLUMN media_assets.presentation_settings IS
  'Visual Editor per-breakpoint settings. Structure:
  {
    "desktop":      { "mode": "auto|custom|inherited", "position_x": 50, "position_y": 50,
                      "scale": 100, "object_fit": "cover",
                      "focal_x": 50, "focal_y": 50,
                      "cutout": { "position_x": 50, "position_y": 50, "scale": 100 },
                      "typography": { "x": 10, "y": 50, "width": 45, "alignment": "left",
                                      "font_size": 100, "font_weight": 700, "letter_spacing": 0 }
                    },
    "tablet":       { ... },
    "mobile":       { ... },
    "small_mobile": { ... }
  }';

-- ─── 2. Index for faster JSONB queries ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_media_presentation_settings
  ON media_assets USING gin(presentation_settings);

