# STEP 5E — Visual Media Editor — Supabase Setup

## Migration

Run in Supabase SQL Editor:

```
supabase/migrations/20250907000002_media_presentation_settings.sql
```

This adds `presentation_settings JSONB` column to `media_assets`.

## What's added

### `media_assets.presentation_settings` (JSONB)

Stores per-breakpoint visual editor settings:

```json
{
  "desktop": {
    "mode": "auto | custom | inherited",
    "inherit_from": null,
    "position_x": 50,
    "position_y": 50,
    "scale": 100,
    "object_fit": "cover",
    "focal_x": 50,
    "focal_y": 50,
    "cutout": {
      "position_x": 50,
      "position_y": 50,
      "scale": 100
    },
    "typography": {
      "x": 8,
      "y": 50,
      "width": 44,
      "alignment": "left",
      "font_size": 100,
      "font_weight": 700,
      "letter_spacing": 0
    }
  },
  "tablet": { "mode": "inherited", "inherit_from": "desktop" },
  "mobile": { "mode": "custom", ... },
  "small_mobile": { "mode": "inherited", "inherit_from": "mobile" }
}
```

If a breakpoint is `auto` or not set, the editor resolves defaults from `focal_x`/`focal_y`.
If `inherited`, it copies the parent breakpoint's resolved settings.

## API

`PATCH /api/admin/media/presentation`

Body:
```json
{
  "mediaId": "uuid",
  "settings": { ... }  
}
```

Requires authenticated admin session.

## RLS

No new RLS policies needed — inherits existing `media_assets` policies.

## New files

- `lib/types/presentation.ts` — TypeScript types
- `components/admin/visual-editor/VisualMediaEditor.tsx` — Editor UI
- `components/admin/visual-editor/VisualMediaEditor.module.css`
- `components/admin/visual-editor/index.ts`
- `app/api/admin/media/presentation/route.ts` — Save API

## Modified files

- `lib/types/media-asset.ts` — added `presentation_settings` field
- `app/api/admin/media/[id]/route.ts` — added `presentation_settings` to PATCH allowed fields
- `components/admin/media/MediaDetail.tsx` — added "Buka Visual Editor" button
