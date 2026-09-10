-- JAECOO Palembang — Supabase Migration
-- STEP 4A: Model data architecture
--
-- Tables:
--   models              — core model identity & pricing
--   model_variants      — varian per model (e.g. J7 SIVP)
--   model_content       — hero, overview, technology sections (jsonb)
--   model_specifications — spec categories & rows
--   model_colors        — available exterior colors
--   model_media         — gallery & hero images
--
-- SAFETY: migration is additive — no DROP TABLE, no destructive ops.
-- Run: supabase db push (or paste into Supabase SQL editor)

-- ─── Enable UUID extension ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── models ──────────────────────────────────────────────────────────────
create table if not exists models (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,   -- 'jaecoo-j5-ev' | 'jaecoo-j7-shs' | 'jaecoo-j8-shs'
  name          text not null,          -- 'JAECOO J5 EV'
  short_name    text not null,          -- 'J5 EV'
  tagline       text not null,          -- 'THIS IS THE REAL SUV.'
  description   text,
  published     boolean default false,
  sort_order    int default 0,          -- display order on range page
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

comment on table models is 'Core model catalogue. One row per model URL.';
comment on column models.slug is 'URL slug — maps to /model/[slug]. Must use jaecoo-* prefix.';

-- ─── model_variants ──────────────────────────────────────────────────────
create table if not exists model_variants (
  id             uuid primary key default uuid_generate_v4(),
  model_id       uuid not null references models(id) on delete cascade,
  variant_key    text not null,         -- 'j5-ev-standard', 'j7-sivp'
  name           text not null,         -- display name
  label          text,                  -- short badge e.g. 'SIVP' (nullable)
  price_idr      bigint not null,       -- price in IDR (no decimals)
  price_display  text not null,         -- 'Rp534.900.000'
  price_region   text not null default 'OTR Palembang',
  is_default     boolean default false, -- marks the primary variant shown
  created_at     timestamptz default now(),
  unique(model_id, variant_key)
);

comment on table model_variants is 'Variants per model. J7 SIVP is a variant row, not a separate model.';
comment on column model_variants.price_idr is 'Integer IDR — divide by 100 not needed; IDR has no decimal.';

-- ─── model_content ───────────────────────────────────────────────────────
-- Flexible JSONB for structured page content (technology features, hero media, etc.)
create table if not exists model_content (
  id          uuid primary key default uuid_generate_v4(),
  model_id    uuid not null references models(id) on delete cascade,
  section     text not null,  -- 'hero' | 'overview' | 'technology'
  content     jsonb not null default '{}',
  updated_at  timestamptz default now(),
  unique(model_id, section)
);

comment on table model_content is 'Structured page content per model per section. Replaces hardcoded copy.';

-- ─── model_specifications ────────────────────────────────────────────────
create table if not exists model_specifications (
  id           uuid primary key default uuid_generate_v4(),
  model_id     uuid not null references models(id) on delete cascade,
  category     text not null,   -- 'Dimensi', 'Powertrain', etc.
  spec_label   text not null,   -- 'Panjang'
  spec_value   text not null,   -- '4.330 mm'
  sort_order   int default 0,
  unique(model_id, category, spec_label)
);

comment on table model_specifications is 'Flat spec rows — grouped by category in application layer.';

-- ─── model_colors ────────────────────────────────────────────────────────
create table if not exists model_colors (
  id           uuid primary key default uuid_generate_v4(),
  model_id     uuid not null references models(id) on delete cascade,
  color_key    text not null,
  name         text not null,   -- 'Crystal White'
  hex          char(7) not null,-- '#f0f0f0'
  image_path   text,            -- 'models/j5-ev/color-white.jpg' (Supabase Storage path)
  sort_order   int default 0,
  unique(model_id, color_key)
);

comment on table model_colors is 'Available exterior colors per model.';

-- ─── model_media ─────────────────────────────────────────────────────────
create table if not exists model_media (
  id           uuid primary key default uuid_generate_v4(),
  model_id     uuid not null references models(id) on delete cascade,
  media_type   text not null,   -- 'hero' | 'gallery' | 'cutout'
  breakpoint   text,            -- 'desktop' | 'tablet' | 'mobile' | null (universal)
  path         text not null,   -- 'models/j5-ev/hero-desktop.jpg' (Supabase Storage path)
  alt          text,
  focal_x      int default 50,  -- focal point for art direction
  focal_y      int default 50,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

comment on table model_media is 'All media assets per model. Breakpoint = null means universal.';

-- ─── Indexes ──────────────────────────────────────────────────────────────
create index if not exists idx_models_slug         on models(slug);
create index if not exists idx_models_published    on models(published);
create index if not exists idx_variants_model_id   on model_variants(model_id);
create index if not exists idx_content_model_sec   on model_content(model_id, section);
create index if not exists idx_specs_model_id      on model_specifications(model_id);
create index if not exists idx_colors_model_id     on model_colors(model_id);
create index if not exists idx_media_model_type    on model_media(model_id, media_type);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────
-- All tables: public read, authenticated write (admin panel)

alter table models              enable row level security;
alter table model_variants      enable row level security;
alter table model_content       enable row level security;
alter table model_specifications enable row level security;
alter table model_colors        enable row level security;
alter table model_media         enable row level security;

-- Public SELECT
create policy "models_public_read"       on models              for select using (true);
create policy "variants_public_read"     on model_variants      for select using (true);
create policy "content_public_read"      on model_content       for select using (true);
create policy "specs_public_read"        on model_specifications for select using (true);
create policy "colors_public_read"       on model_colors        for select using (true);
create policy "media_public_read"        on model_media         for select using (true);

-- Authenticated write
create policy "models_auth_write"       on models              for all using (auth.role() = 'authenticated');
create policy "variants_auth_write"     on model_variants      for all using (auth.role() = 'authenticated');
create policy "content_auth_write"      on model_content       for all using (auth.role() = 'authenticated');
create policy "specs_auth_write"        on model_specifications for all using (auth.role() = 'authenticated');
create policy "colors_auth_write"       on model_colors        for all using (auth.role() = 'authenticated');
create policy "media_auth_write"        on model_media         for all using (auth.role() = 'authenticated');
