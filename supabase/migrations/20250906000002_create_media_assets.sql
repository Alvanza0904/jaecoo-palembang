-- JAECOO Palembang — Supabase Migration
-- STEP 5C: Media System
--
-- Table: media_assets — central media registry
--
-- SAFETY: Additive only — no DROP TABLE, no destructive ops.
-- Run in Supabase SQL editor or: supabase db push

-- ─── media_assets ─────────────────────────────────────────────────────────
create table if not exists media_assets (
  id              uuid primary key default uuid_generate_v4(),
  filename        text not null,
  storage_path    text not null unique, -- e.g. models/hero-j5.webp
  storage_bucket  text not null default 'jaecoo-media',
  public_url      text,                -- Supabase public URL after upload
  mime_type       text not null,
  size_bytes      bigint not null,
  width           int,
  height          int,
  category        text not null default 'system',
  -- Art direction / focal point (0–100 normalized)
  focal_x         int default 50,
  focal_y         int default 50,
  -- Responsive art direction per breakpoint (JSONB, optional)
  responsive_settings jsonb default '{}',
  -- Hero / text positioning metadata
  text_color_mode  text default 'auto', -- 'auto' | 'light' | 'dark' | 'custom'
  -- Who uploaded
  uploaded_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

comment on table media_assets is
  'Central media registry — all uploaded assets with metadata and art direction.';
comment on column media_assets.category is
  'Folder category: models | promos | news | gallery | about | og | system';
comment on column media_assets.focal_x is
  'Horizontal focal point 0–100 (normalized). Used for CSS object-position.';
comment on column media_assets.focal_y is
  'Vertical focal point 0–100 (normalized).';
comment on column media_assets.responsive_settings is
  'Per-breakpoint art direction: {desktop:{focal_x,focal_y,...}, mobile:{...}}';

-- ─── Indexes ──────────────────────────────────────────────────────────────
create index if not exists idx_media_category  on media_assets(category);
create index if not exists idx_media_created   on media_assets(created_at desc);
create index if not exists idx_media_bucket    on media_assets(storage_bucket);

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table media_assets enable row level security;

-- Public: can SELECT (read metadata of any asset)
create policy "media_public_select"
  on media_assets for select
  using (true);

-- Authenticated admin: full write access
create policy "media_auth_insert"
  on media_assets for insert
  with check (auth.role() = 'authenticated');

create policy "media_auth_update"
  on media_assets for update
  using (auth.role() = 'authenticated');

create policy "media_auth_delete"
  on media_assets for delete
  using (auth.role() = 'authenticated');

-- ─── Add media_asset_id to model_colors ───────────────────────────────────
-- Soft reference — nullable, so existing rows unaffected.
alter table model_colors
  add column if not exists media_asset_id uuid references media_assets(id) on delete set null;

-- ─── Updated_at trigger ────────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists media_assets_updated_at on media_assets;
create trigger media_assets_updated_at
  before update on media_assets
  for each row execute function update_updated_at_column();
