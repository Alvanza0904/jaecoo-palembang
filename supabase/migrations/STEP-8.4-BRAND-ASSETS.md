# JAECOO Palembang — STEP 8.4 Brand Assets

## Scope

Public frontend/data-layer preparation only. Admin/CMS UI, auth, dashboard, media manager, and upload UI are intentionally unchanged.

## Single source of truth

The public layout resolves `global / site` media assignments once through `getSiteBrandAssets()`. Header and Footer receive the same resolved `SiteBrandAssets` object.

Slots:

- `logo` — default website logo
- `logo_light` — transparent/hero header variant
- `logo_dark` — footer/dark-surface variant

Each slot points to `media_assets`, whose binary is stored in the existing `jaecoo-media` Supabase Storage bucket.

## Fallback

If CMS media is unavailable, Header/Footer retain their existing text-brand fallback. No new local logo binary was invented or introduced because the Step 8.3 project archive contains no local logo image file.

## Metadata

Favicon and OG/Twitter images remain on the existing Next.js metadata implementation in this step. Their sources are audited and intentionally not changed to avoid unnecessary metadata regression. They are candidates for the dedicated metadata/CMS step.
