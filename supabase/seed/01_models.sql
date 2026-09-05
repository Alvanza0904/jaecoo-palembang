-- JAECOO Palembang — Supabase Seed Data
-- STEP 4A: Seeds 3 models with correct slugs, prices, taglines.
--
-- Run AFTER migration: supabase db reset (or paste after tables exist)
-- Safe to re-run — uses INSERT ... ON CONFLICT DO UPDATE

-- ─── Models ──────────────────────────────────────────────────────────────

insert into models (slug, name, short_name, tagline, description, published, sort_order)
values
  (
    'jaecoo-j5-ev',
    'JAECOO J5 EV',
    'J5 EV',
    'THIS IS THE REAL SUV.',
    'JAECOO J5 EV hadir sebagai SUV elektrik yang menggabungkan performa modern dengan desain premium — siap mengubah cara Anda berkendara di Palembang dan sekitarnya.',
    true,
    1
  ),
  (
    'jaecoo-j7-shs',
    'JAECOO J7 SHS',
    'J7 SHS',
    'SUPER HYBRID, REDEFINED.',
    'JAECOO J7 SHS menggabungkan keiritan hybrid dengan performa SUV sejati dan kemampuan AWD — pilihan sempurna untuk jiwa petualang yang tidak mau kompromi.',
    true,
    2
  ),
  (
    'jaecoo-j8-shs',
    'JAECOO J8 Ardis SHS',
    'J8 Ardis',
    'POWER, REFINED.',
    'JAECOO J8 Ardis SHS mendefinisikan ulang standar SUV flagship — kemewahan tanpa kompromi, teknologi hybrid terdepan, dan performa AWD yang menghadirkan sensasi berkendara di level yang berbeda.',
    true,
    3
  )
on conflict (slug) do update set
  name        = excluded.name,
  short_name  = excluded.short_name,
  tagline     = excluded.tagline,
  description = excluded.description,
  published   = excluded.published,
  sort_order  = excluded.sort_order,
  updated_at  = now();

-- ─── Model Variants ───────────────────────────────────────────────────────

-- J5 EV Variants
insert into model_variants (model_id, variant_key, name, price_idr, price_display, price_region, is_default)
select
  m.id, 'j5-ev-standard', 'JAECOO J5 EV', 354900000, 'Rp354.900.000', 'OTR Palembang', true
from models m where m.slug = 'jaecoo-j5-ev'
on conflict (model_id, variant_key) do update set
  price_idr = excluded.price_idr,
  price_display = excluded.price_display;

-- J7 SHS Variants (2 varian: SHS + SIVP)
insert into model_variants (model_id, variant_key, name, label, price_idr, price_display, price_region, is_default)
select
  m.id, 'j7-shs-standard', 'JAECOO J7 SHS', null, 534900000, 'Rp534.900.000', 'OTR Palembang', true
from models m where m.slug = 'jaecoo-j7-shs'
on conflict (model_id, variant_key) do update set
  price_idr = excluded.price_idr,
  price_display = excluded.price_display;

insert into model_variants (model_id, variant_key, name, label, price_idr, price_display, price_region, is_default)
select
  m.id, 'j7-sivp', 'JAECOO J7 SHS-P', 'SIVP', 534900000, 'Rp534.900.000', 'OTR Palembang', false
from models m where m.slug = 'jaecoo-j7-shs'
on conflict (model_id, variant_key) do update set
  label = excluded.label,
  price_idr = excluded.price_idr,
  price_display = excluded.price_display;

-- J8 Ardis SHS Variants
insert into model_variants (model_id, variant_key, name, price_idr, price_display, price_region, is_default)
select
  m.id, 'j8-ardis-shs-standard', 'JAECOO J8 Ardis SHS', 865000000, 'Rp865.000.000', 'OTR Palembang', true
from models m where m.slug = 'jaecoo-j8-shs'
on conflict (model_id, variant_key) do update set
  price_idr = excluded.price_idr,
  price_display = excluded.price_display;

-- ─── Model Colors ─────────────────────────────────────────────────────────

-- J5 EV Colors
insert into model_colors (model_id, color_key, name, hex, image_path, sort_order)
select m.id, v.color_key, v.name, v.hex, v.image_path, v.sort_order
from models m,
  (values
    ('j5-white',  'Crystal White',  '#f0f0f0', '/images/models/j5-ev/color-white.jpg',  1),
    ('j5-black',  'Midnight Black', '#1a1a1a', '/images/models/j5-ev/color-black.jpg',  2),
    ('j5-blue',   'Ocean Blue',     '#1e3a5f', '/images/models/j5-ev/color-blue.jpg',   3),
    ('j5-silver', 'Stellar Silver', '#c0c0c0', '/images/models/j5-ev/color-silver.jpg', 4)
  ) as v(color_key, name, hex, image_path, sort_order)
where m.slug = 'jaecoo-j5-ev'
on conflict (model_id, color_key) do update set
  name = excluded.name, hex = excluded.hex;

-- J7 SHS Colors
insert into model_colors (model_id, color_key, name, hex, image_path, sort_order)
select m.id, v.color_key, v.name, v.hex, v.image_path, v.sort_order
from models m,
  (values
    ('j7-white',  'Pearl White',     '#f5f5f5', '/images/models/j7-shs/color-white.jpg',  1),
    ('j7-silver', 'Titanium Silver', '#9ca3af', '/images/models/j7-shs/color-silver.jpg', 2),
    ('j7-black',  'Cosmic Black',    '#1a1a1a', '/images/models/j7-shs/color-black.jpg',  3),
    ('j7-green',  'Forest Green',    '#2d4a3e', '/images/models/j7-shs/color-green.jpg',  4)
  ) as v(color_key, name, hex, image_path, sort_order)
where m.slug = 'jaecoo-j7-shs'
on conflict (model_id, color_key) do update set
  name = excluded.name, hex = excluded.hex;

-- J8 Ardis Colors
insert into model_colors (model_id, color_key, name, hex, image_path, sort_order)
select m.id, v.color_key, v.name, v.hex, v.image_path, v.sort_order
from models m,
  (values
    ('j8-obsidian', 'Obsidian Black',  '#111111', '/images/models/j8-ardis/color-black.jpg',  1),
    ('j8-gold',     'Champagne Gold',  '#c8a96e', '/images/models/j8-ardis/color-gold.jpg',   2),
    ('j8-white',    'Alpine White',    '#f8f8f6', '/images/models/j8-ardis/color-white.jpg',  3),
    ('j8-silver',   'Platinum Silver', '#d4d4d4', '/images/models/j8-ardis/color-silver.jpg', 4)
  ) as v(color_key, name, hex, image_path, sort_order)
where m.slug = 'jaecoo-j8-shs'
on conflict (model_id, color_key) do update set
  name = excluded.name, hex = excluded.hex;
