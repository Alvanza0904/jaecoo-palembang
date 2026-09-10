-- JAECOO Palembang — Image Management Architecture
-- STEP 8.3: content_media assignment layer
--
-- This does NOT create a second media system. media_assets remains the single
-- registry and Supabase Storage remains the single binary store.
-- content_media only maps a CMS/content slot to an existing media asset.
--
-- Examples:
--   home / hero
--   model / jaecoo-j5-ev / exterior
--   promo / promo-001 / cover
--   news / news-001 / cover
--   global / site / logo
--   global / site / logo_light
--   global / site / logo_dark
--
-- The Admin UI is intentionally NOT changed by this migration.

create table if not exists content_media (
  id               uuid primary key default uuid_generate_v4(),
  content_type     text not null,
  content_key      text not null,
  slot_key         text not null,
  breakpoint       text,
  media_asset_id   uuid not null references media_assets(id) on delete restrict,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(content_type, content_key, slot_key, breakpoint)
);

comment on table content_media is
  'CMS image assignment layer. Maps content slots to media_assets; binaries stay in Supabase Storage.';

comment on column content_media.content_type is
  'Content namespace: home | model | promo | news | global (extensible).';

comment on column content_media.content_key is
  'Stable content identifier, e.g. home, jaecoo-j5-ev, promo-001, news-001.';

comment on column content_media.slot_key is
  'Semantic image slot, e.g. hero, exterior, cover, dealer_location.';

comment on column content_media.breakpoint is
  'Optional art direction override: desktop | tablet | mobile | small_mobile. NULL = universal.';

create index if not exists idx_content_media_lookup
  on content_media(content_type, content_key, slot_key);

create index if not exists idx_content_media_asset
  on content_media(media_asset_id);

alter table content_media enable row level security;

create policy "content_media_public_select"
  on content_media for select
  using (true);

create policy "content_media_auth_insert"
  on content_media for insert
  with check (auth.role() = 'authenticated');

create policy "content_media_auth_update"
  on content_media for update
  using (auth.role() = 'authenticated');

create policy "content_media_auth_delete"
  on content_media for delete
  using (auth.role() = 'authenticated');

drop trigger if exists content_media_updated_at on content_media;
create trigger content_media_updated_at
  before update on content_media
  for each row execute function update_updated_at_column();
