-- Separate J7 SIVP from J7 SHS and align published copy that contradicted
-- the reference site. Specification rows are inserted only when a model has
-- none, so an admin-edited spec table is not overwritten.

insert into models (slug, name, short_name, tagline, description, published, sort_order)
values (
  'jaecoo-j7-sivp',
  'JAECOO J7 SHS-P SIVP',
  'J7 SIVP',
  'YOUR SUV. YOUR PERSONAL VALET.',
  'Super Intelligent Valet Parking memungkinkan J7 mencari tempat parkir, memarkirkan diri, lalu datang kembali saat dipanggil — tanpa pengemudi di dalam mobil.',
  true,
  3
)
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  description = excluded.description,
  published = true,
  updated_at = now();

insert into model_variants (model_id, variant_key, name, label, price_idr, price_display, price_region, is_default, price_status)
select m.id, 'j7-sivp', 'JAECOO J7 SHS-P SIVP', 'SIVP', null, null, 'OTR Palembang', true, 'prebook'
from models m
where m.slug = 'jaecoo-j7-sivp'
on conflict (model_id, variant_key) do update set
  name = excluded.name,
  label = excluded.label,
  price_status = excluded.price_status,
  is_default = true;

update models
set description = 'JAECOO J7 SHS hadir dengan Super Hybrid System — perpaduan mesin 1.5TGDI generasi kelima dan powertrain listrik melalui DHT. SUV premium untuk perjalanan kota maupun jarak jauh, tanpa klaim fitur SIVP.',
    updated_at = now()
where slug = 'jaecoo-j7-shs'
  and description like '%kemampuan AWD%';

update models
set short_name = 'J8 SHS-P ARDIS',
    updated_at = now()
where slug = 'jaecoo-j8-shs'
  and coalesce(btrim(short_name), '') = '';

delete from model_variants v
using models m
where v.model_id = m.id
  and m.slug = 'jaecoo-j7-shs'
  and v.variant_key = 'j7-sivp';
