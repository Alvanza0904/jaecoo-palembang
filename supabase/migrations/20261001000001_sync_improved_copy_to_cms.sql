-- Sync improved copywriting (static fallback) into live CMS tables.
-- Safe to re-run. Does NOT touch media_asset_id / image slots / presentation.
--
-- Run in Supabase SQL Editor (recommended) or via supabase db push.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Homepage content (singleton)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.homepage_content
SET
  hero = hero || '{
    "eyebrow": "DEALER RESMI JAECOO PALEMBANG",
    "headline": "JAECOO J5",
    "description": "SUV listrik untuk perjalanan harian. Tenaga instan, kabin lega, dan jarak tempuh yang cukup untuk aktivitas kota maupun luar kota.",
    "ctaText": "Jelajahi J5",
    "ctaUrl": "/model/jaecoo-j5-ev"
  }'::jsonb,
  experience = experience || '{
    "title": "Satu Lini. Tiga Karakter.",
    "description": "J5 EV untuk mobilitas listrik sehari-hari, J7 SHS untuk hybrid yang fleksibel, J7 SIVP dengan valet parkir pintar, dan J8 SHS-P ARDIS sebagai flagship dengan AWD."
  }'::jsonb,
  technology = technology || '{
    "title": "Teknologi yang Terasa, Bukan Sekadar Terlihat",
    "description": "Dari powertrain listrik dan Super Hybrid System hingga ARDIS, kamera 540°, dan bantuan pengemudi — teknologi yang membantu perjalanan terasa lebih tenang dan terkendali."
  }'::jsonb,
  about = about || '{
    "title": "JAECOO Palembang",
    "description": "Kenali lineup JAECOO bersama Alvan di Palembang. Dari membandingkan model, konsultasi kebutuhan, sampai menjadwalkan test drive — semuanya dibuat sederhana dan personal."
  }'::jsonb,
  promo = promo || '{
    "title": "Penawaran Terkini",
    "description": "Cek harga, program, dan penawaran terbaru JAECOO Palembang. Hubungi Alvan untuk detail yang sesuai dengan kebutuhan Anda.",
    "ctaText": "Lihat Semua Promo",
    "ctaUrl": "/promo"
  }'::jsonb,
  journal = journal || '{
    "title": "Berita & Informasi JAECOO",
    "description": "Ikuti update produk, teknologi, dan aktivitas JAECOO yang relevan untuk Anda di Palembang."
  }'::jsonb,
  dealer_location = dealer_location || '{
    "title": "Kenali JAECOO Lebih Dekat",
    "description": "Datang ke dealer resmi di Palembang. Lihat unit secara langsung, bandingkan model, dan tanyakan detail ke Alvan tanpa basa-basi bertele-tele.",
    "address": "JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan — 085183145926"
  }'::jsonb,
  final_cta = final_cta || '{
    "title": "Temukan JAECOO yang Tepat untuk Anda.",
    "description": "Ingin melihat unit, membandingkan model, atau menjadwalkan test drive? Chat Alvan untuk informasi langsung dari JAECOO Palembang.",
    "ctaText": "Chat dengan Alvan",
    "ctaUrl": "https://wa.me/6285183145926"
  }'::jsonb,
  seo = seo || '{
    "metaTitle": "JAECOO Palembang | Dealer Resmi SUV Premium",
    "metaDescription": "Dealer resmi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Test drive, simulasi kredit, dan promo eksklusif bersama Alvan."
  }'::jsonb,
  updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Model identity copy (description + tagline)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE public.models SET
  description = 'SUV listrik untuk perjalanan harian di kota. Tenaga instan, ruang kabin yang nyaman, dan jarak tempuh yang cukup untuk aktivitas sehari-hari.',
  tagline = 'THIS IS THE REAL SUV.',
  updated_at = now()
WHERE slug = 'jaecoo-j5-ev';

UPDATE public.models SET
  description = 'SUV plug-in hybrid dengan Super Hybrid System: mesin 1.5TGDI generasi kelima dipadu powertrain listrik melalui DHT. Nyaman di kota, tenang untuk jarak jauh.',
  tagline = 'SUPER HYBRID SYSTEM',
  updated_at = now()
WHERE slug = 'jaecoo-j7-shs';

UPDATE public.models SET
  description = 'Super Intelligent Valet Parking: J7 bisa mencari tempat parkir, memarkir sendiri, lalu datang kembali saat dipanggil — tanpa pengemudi di dalam mobil.',
  tagline = 'YOUR SUV. YOUR PERSONAL VALET.',
  updated_at = now()
WHERE slug = 'jaecoo-j7-sivp';

UPDATE public.models SET
  description = 'SUV flagship dengan Super Hybrid System, triple motor, dan AWD ARDIS. Tujuh tempat duduk, tujuh mode berkendara, tenaga gabungan 530 PS.',
  tagline = 'KEKUATAN YANG DISEMPURNAKAN.',
  updated_at = now()
WHERE slug = 'jaecoo-j8-shs';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. model_content section = 'page' (page_copy + highlights + meta)
--    Full replace of text payload so CMS matches static fallback.
-- ═══════════════════════════════════════════════════════════════════════════

-- J5 EV
INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'page', '{
  "highlights": [
    {"value": "60,9 kWh", "label": "CATL · LFP"},
    {"value": "461 km", "label": "NEDC"},
    {"value": "130 kW", "label": "210 PS"},
    {"value": "28 menit", "label": "Pengisian DC"}
  ],
  "exterior": {
    "label": "Desain",
    "heading": "Dirancang untuk\nkeseharian.",
    "body": "Proporsi SUV yang tegas dengan garis bodi bersih. Dari depan, karakter J5 langsung terbaca tanpa terasa berlebihan."
  },
  "design": {
    "label": "Detail",
    "heading": "Karakter yang\nberbicara.",
    "body": "Lampu depan yang tajam, pelek yang tegas, dan garis samping yang mengalir membuat J5 tetap terlihat rapi dari dekat maupun dari kejauhan."
  },
  "profile": {
    "label": "Karakter",
    "heading": "Tegas secara\nalami."
  },
  "interior": {
    "label": "Interior",
    "heading": "Lebih dari\nsekadar kabin.",
    "body": "Masuk ke dalam, kabin terasa lega dengan layout yang simpel. Kursi nyaman, ruang kaki cukup, dan kontrol mudah dijangkau tanpa mengganggu fokus ke jalan."
  },
  "cockpit": {
    "label": "Kokpit",
    "heading": "Pusat kendali\ndigital.",
    "body": "Layar digital dan kontrol utama berada dalam jangkauan tangan. Informasi yang dibutuhkan muncul jelas, tanpa membuat dashboard terasa ramai."
  },
  "performance": {
    "label": "Performa",
    "heading": "Angka yang\npunya tujuan.",
    "body": "Respons motor listrik terasa langsung saat gas diinjak, tetap halus saat dipakai santai di lalu lintas kota."
  },
  "adas": {
    "label": "Keselamatan",
    "stat": "17",
    "unit": "ADAS",
    "heading": "Bantuan pengemudi\nyang terukur.",
    "body": "17 fitur ADAS membantu menjaga jarak, menjaga jalur, dan memberi peringatan saat dibutuhkan — pengemudi tetap memegang kendali."
  },
  "cta": {
    "label": "JAECOO J5 EV · Palembang",
    "heading": "Siap melangkah\nbersama J5?",
    "body": "Hubungi Alvan untuk harga terbaru, simulasi kredit, informasi unit, dan jadwal test drive JAECOO J5 EV di Palembang."
  },
  "tech_intelligence": {
    "label": "Teknologi",
    "heading": "Teknologi yang\nterasa dekat.",
    "body": "Antarmuka digital yang mudah dibaca, regenerasi tiga level, dan pengisian DC hingga 130 kW — sekitar 28 menit untuk kembali siap jalan."
  },
  "tech_stats": [
    {"value": "17", "label": "Fitur ADAS"},
    {"value": "3", "label": "Level regenerasi"},
    {"value": "130 kW", "label": "Pengisian DC"},
    {"value": "7.700 W", "label": "AC wall mount"}
  ],
  "meta_title": "JAECOO J5 EV Palembang | SUV Listrik, Harga & Spesifikasi",
  "meta_description": "Kenali JAECOO J5 EV di Palembang, SUV listrik untuk perjalanan harian. Lihat harga OTR, spesifikasi, dan jadwalkan test drive."
}'::jsonb, now()
FROM public.models m WHERE m.slug = 'jaecoo-j5-ev'
ON CONFLICT (model_id, section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- J7 SHS
INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'page', '{
  "highlights": [
    {"value": "100 km", "label": "EV Range"},
    {"value": "1.300 km", "label": "Jarak kombinasi"},
    {"value": "7,3 det", "label": "0–100 km/jam"},
    {"value": "19", "label": "Fitur ADAS"}
  ],
  "exterior": {
    "label": "Desain",
    "heading": "Desain yang\nberbicara.",
    "body": "Siluet SUV yang tegas dengan lampu LED signature dan stance yang percaya diri. Proporsinya terasa matang dari depan sampai samping."
  },
  "design": {
    "label": "Detail",
    "heading": "Detail yang\ndikerjakan rapi.",
    "body": "Grille horizontal dan lampu LED signature memberi wajah yang tegas. Garis bodi mengalir rapi, wheelbase 2.672 mm dan ground clearance 200 mm."
  },
  "profile": {
    "label": "Karakter",
    "heading": "Garis yang\nterasa bergerak."
  },
  "interior": {
    "label": "Interior",
    "heading": "Kokpit yang\nberkarakter.",
    "body": "Kokpit berorientasi pengemudi dengan layar yang jelas dibaca. Ambient lighting, kamera 540° HD, dan delapan airbag membuat kabin terasa tenang dipakai."
  },
  "cockpit": {
    "label": "Kokpit",
    "heading": "Kontrol di\njung jari.",
    "body": "Layar dan kontrol diletakkan supaya perhatian tetap ke jalan. Informasi penting mudah dibaca tanpa harus mencari-cari."
  },
  "performance": {
    "label": "Performa",
    "heading": "Super Hybrid.\nNyaman dipakai.",
    "body": "Bisa jalan murni listrik di kota, lalu mesin ikut bekerja saat perjalanan lebih jauh. Transisi terasa halus, tanpa drama."
  },
  "adas": {
    "label": "Keselamatan",
    "stat": "19",
    "unit": "ADAS",
    "heading": "Dibekali\n19 fitur ADAS.",
    "body": "Dari adaptive cruise hingga peringatan titik buta dan pengereman darurat — 19 fitur ADAS yang membantu tanpa mengambil alih kendali."
  },
  "cta": {
    "label": "JAECOO J7 SHS · Palembang",
    "heading": "Siap merasakan\nJ7 SHS?",
    "body": "Jadwalkan test drive JAECOO J7 SHS di Palembang. Untuk Super Intelligent Valet Parking, lihat J7 SIVP."
  },
  "tech_intelligence": {
    "label": "Teknologi",
    "heading": "Detail yang\nterasa pintar.",
    "body": "Kamera 540° HD dan 19 fitur ADAS membantu membaca situasi di sekitar. Pengemudi tetap yang memutuskan."
  },
  "tech_stats": [
    {"value": "19", "label": "Fitur ADAS"},
    {"value": "540°", "label": "HD surround camera"},
    {"value": "8", "label": "Airbag"},
    {"value": "44,5%", "label": "Efisiensi termal"}
  ],
  "meta_title": "JAECOO J7 SHS Palembang | SUV Plug-in Hybrid & Spesifikasi",
  "meta_description": "JAECOO J7 SHS di Palembang adalah SUV plug-in hybrid dengan Super Hybrid System. Lihat harga, spesifikasi, dan jadwalkan test drive."
}'::jsonb, now()
FROM public.models m WHERE m.slug = 'jaecoo-j7-shs'
ON CONFLICT (model_id, section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- J7 SIVP
INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'page', '{
  "highlights": [
    {"value": "27", "label": "Sensors & cameras"},
    {"value": "128-ch", "label": "dToF LiDAR"},
    {"value": "540°", "label": "Camera coverage"},
    {"value": "100 km", "label": "EV range"}
  ],
  "exterior": {
    "label": "SIVP",
    "heading": "SUV Anda.\nValet pribadinya.",
    "body": "Cukup pilih area parkir, turun, lalu biarkan J7 bekerja. Sistem mencari slot, memarkir, dan bisa dipanggil kembali saat Anda siap."
  },
  "design": {
    "label": "Cara kerja",
    "heading": "Cari.\nParkir.\nTinggalkan.",
    "body": "Dari smartphone, pilih zona parkir lalu turun. Sistem mendeteksi pejalan kaki dan hambatan, lalu manuver sendiri sampai posisi parkir."
  },
  "profile": {
    "label": "Persepsi",
    "heading": "Persepsi yang\nmembaca sekitar."
  },
  "interior": {
    "label": "Kendali",
    "heading": "Pantau dari\ngenggaman.",
    "body": "Proses parkir bisa dipantau real-time dari aplikasi. Empat langkah sederhana: pilih area, deteksi hambatan, pantau, lalu biarkan J7 selesai."
  },
  "cockpit": {
    "label": "Keputusan",
    "heading": "Melihat.\nMemahami.\nBertindak.",
    "body": "Domain controller memproses data sensor secara bersamaan, menghitung jalur, lalu mengeksekusi kemudi, gas, dan rem tanpa intervensi pengemudi."
  },
  "performance": {
    "label": "Platform",
    "heading": "Plug-in hybrid\nyang tenang dipakai.",
    "body": "Di balik SIVP, platform hybrid-nya sama nyaman dipakai: pure EV untuk kota, hybrid untuk perjalanan lebih jauh."
  },
  "adas": {
    "label": "Persepsi",
    "stat": "27",
    "unit": "SENSOR",
    "heading": "Dibangun untuk\nmembaca sekitar.",
    "body": "27 sensor dan kamera, LiDAR 128-channel dToF, radar, plus kamera 540° — paket persepsi khusus untuk Super Intelligent Valet Parking."
  },
  "cta": {
    "label": "JAECOO J7 SIVP · Palembang",
    "heading": "Siap mencoba\nSIVP?",
    "body": "Harga resmi J7 SIVP belum diumumkan di halaman referensi — status pre-book. Hubungi Alvan untuk informasi dan test drive di Palembang."
  },
  "tech_intelligence": {
    "label": "SIVP",
    "heading": "Cerdas di\nruang sempit.",
    "body": "Basement sempit, tikungan ketat, atau pilar yang menyempit justru jadi area kerja SIVP. Di ruang terbuka, sistem tetap bekerja dengan tenang."
  },
  "tech_stats": [
    {"value": "27", "label": "Sensors & cameras"},
    {"value": "128-ch", "label": "dToF LiDAR"},
    {"value": "540°", "label": "Camera coverage"},
    {"value": "7,7 kW", "label": "AC charging"}
  ],
  "meta_title": "JAECOO J7 SIVP Palembang | Smart Valet Parking & Spesifikasi",
  "meta_description": "JAECOO J7 SIVP di Palembang menambahkan Smart Valet Parking pada platform hybrid J7. Lihat cara kerjanya dan spesifikasi lengkapnya."
}'::jsonb, now()
FROM public.models m WHERE m.slug = 'jaecoo-j7-sivp'
ON CONFLICT (model_id, section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- J8 SHS-P ARDIS
INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'page', '{
  "highlights": [
    {"value": "530 PS", "label": "Tenaga gabungan"},
    {"value": "650 Nm", "label": "Torsi gabungan"},
    {"value": "5,4 dtk", "label": "0–100 km/jam"},
    {"value": "180 km", "label": "EV range"}
  ],
  "exterior": {
    "label": "Desain",
    "heading": "Desain yang kuat.\nDetail yang matang.",
    "body": "Proporsi bodi yang tegas, grille yang kuat, lampu signature, dan velg 20 inci. Dari samping, J8 terasa lebih besar dan matang."
  },
  "design": {
    "label": "Detail",
    "heading": "Satu mobil,\nbanyak sudut.",
    "body": "Grille signature, lampu depan yang tajam, velg 20 inci, dan detail PHEV di sisi bodi — setiap sudut punya karakter sendiri."
  },
  "profile": {
    "label": "Karakter",
    "heading": "Bukan cuma\ntampil gagah."
  },
  "interior": {
    "label": "Interior",
    "heading": "Kabin yang terasa\nseperti ruang sendiri.",
    "body": "Tujuh penumpang dalam tiga baris. Baris depan fokus pengemudi, baris kedua lega untuk penumpang utama, baris ketiga siap dipakai saat dibutuhkan."
  },
  "cockpit": {
    "label": "Kokpit",
    "heading": "Kontrol yang\nmudah dijangkau.",
    "body": "Mode berkendara dan informasi penting diletakkan dalam jangkauan. Saat jalan, yang dibutuhkan tetap mudah dibaca tanpa mengalihkan fokus terlalu lama."
  },
  "performance": {
    "label": "Performa",
    "heading": "Tenaga besar,\ntetap enak dipakai.",
    "body": "530 PS dan 650 Nm terasa saat dibutuhkan, tetap tenang saat dipakai santai. 0–100 km/jam 5,4 detik tanpa terasa kasar."
  },
  "adas": {
    "label": "Keselamatan",
    "stat": "19",
    "unit": "ADAS",
    "heading": "Bantuan untuk\nperjalanan yang tenang.",
    "body": "19 fitur ADAS, kamera 540° HD, dan 10 airbag — bantuan yang bekerja di latar belakang supaya perjalanan terasa lebih tenang."
  },
  "cta": {
    "label": "JAECOO J8 · Palembang",
    "heading": "Mau lihat J8\ndi Palembang?",
    "body": "Tanya harga, promo, simulasi kredit, atau jadwalkan test drive JAECOO J8 SHS-P ARDIS."
  },
  "tech_intelligence": {
    "label": "ARDIS",
    "heading": "Tenaga besar\ntanpa kehilangan fleksibilitas.",
    "body": "Triple motor dan AWD ARDIS menyesuaikan respons dengan kondisi jalan. Tujuh mode berkendara siap dipilih sesuai medan."
  },
  "tech_stats": [
    {"value": "530 PS", "label": "Tenaga gabungan"},
    {"value": "650 Nm", "label": "Torsi gabungan"},
    {"value": "5,4 dtk", "label": "0–100 km/jam"},
    {"value": "7", "label": "Driving modes"}
  ],
  "meta_title": "JAECOO J8 Palembang | ARDIS & SHS-P ARDIS",
  "meta_description": "JAECOO J8 di Palembang hadir sebagai J8 ARDIS bensin dan J8 SHS-P ARDIS plug-in hybrid, keduanya dengan AWD ARDIS. Lihat harga dan spesifikasi."
}'::jsonb, now()
FROM public.models m WHERE m.slug = 'jaecoo-j8-shs'
ON CONFLICT (model_id, section) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Technology section: update headline + subheadline only
--    (preserves existing features[].media / media_asset_id)
--    Feature titles/descriptions are updated by matching id when present.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: merge feature text by id without dropping media keys
CREATE OR REPLACE FUNCTION public._merge_tech_feature_text(
  existing jsonb,
  feature_id text,
  new_title text,
  new_description text,
  new_tag text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  feats jsonb;
  i int;
  item jsonb;
  found boolean := false;
BEGIN
  feats := COALESCE(existing->'features', '[]'::jsonb);
  FOR i IN 0 .. GREATEST(jsonb_array_length(feats) - 1, -1) LOOP
    item := feats->i;
    IF item->>'id' = feature_id THEN
      item := item || jsonb_build_object(
        'title', new_title,
        'description', new_description
      );
      IF new_tag IS NOT NULL THEN
        item := item || jsonb_build_object('tag', new_tag);
      END IF;
      feats := jsonb_set(feats, ARRAY[i::text], item);
      found := true;
    END IF;
  END LOOP;
  IF NOT found THEN
    feats := feats || jsonb_build_array(jsonb_build_object(
      'id', feature_id,
      'title', new_title,
      'description', new_description,
      'tag', COALESCE(new_tag, '')
    ));
  END IF;
  RETURN jsonb_set(COALESCE(existing, '{}'::jsonb), '{features}', feats);
END;
$$;

-- J5 EV technology
UPDATE public.model_content mc
SET
  content = public._merge_tech_feature_text(
    public._merge_tech_feature_text(
      public._merge_tech_feature_text(
        public._merge_tech_feature_text(
          COALESCE(mc.content, '{}'::jsonb)
            || jsonb_build_object(
              'headline', 'Teknologi yang terasa dekat.',
              'subheadline', 'Dari antarmuka digital sampai pengisian daya — teknologi yang terasa membantu saat dipakai setiap hari.'
            ),
          'j5-ev-range',
          'Jangkauan 461 km NEDC',
          'Baterai 60,9 kWh CATL LFP dengan jarak tempuh 461 km NEDC. Cukup untuk aktivitas harian, masih longgar untuk perjalanan luar kota.',
          'Baterai'
        ),
        'j5-ev-charge',
        'Pengisian DC sekitar 28 menit',
        'Isi daya DC hingga 130 kW sekitar 28 menit. Di rumah bisa pakai AC wall mount 7.700 W, atau charger portabel 2.200 W saat bepergian.',
        'Pengisian'
      ),
      'j5-ev-drive',
      '130 kW / 210 PS',
      'Motor 130 kW / 210 PS dan torsi 288 Nm. 0–100 km/jam 7,3 detik, dengan mode Eco, Normal, Sport, plus tiga level regenerasi sesuai gaya berkendara.',
      'Performa'
    ),
    'j5-ev-adas',
    '17 fitur ADAS',
    '17 fitur bantuan pengemudi untuk perjalanan harian — menjaga jarak, jalur, dan memberi peringatan. Kendali tetap di tangan pengemudi.',
    'ADAS'
  ),
  updated_at = now()
FROM public.models m
WHERE mc.model_id = m.id AND m.slug = 'jaecoo-j5-ev' AND mc.section = 'technology';

INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'technology', jsonb_build_object(
  'headline', 'Teknologi yang terasa dekat.',
  'subheadline', 'Dari antarmuka digital sampai pengisian daya — teknologi yang terasa membantu saat dipakai setiap hari.',
  'features', jsonb_build_array(
    jsonb_build_object('id','j5-ev-range','title','Jangkauan 461 km NEDC','description','Baterai 60,9 kWh CATL LFP dengan jarak tempuh 461 km NEDC. Cukup untuk aktivitas harian, masih longgar untuk perjalanan luar kota.','tag','Baterai'),
    jsonb_build_object('id','j5-ev-charge','title','Pengisian DC sekitar 28 menit','description','Isi daya DC hingga 130 kW sekitar 28 menit. Di rumah bisa pakai AC wall mount 7.700 W, atau charger portabel 2.200 W saat bepergian.','tag','Pengisian'),
    jsonb_build_object('id','j5-ev-drive','title','130 kW / 210 PS','description','Motor 130 kW / 210 PS dan torsi 288 Nm. 0–100 km/jam 7,3 detik, dengan mode Eco, Normal, Sport, plus tiga level regenerasi sesuai gaya berkendara.','tag','Performa'),
    jsonb_build_object('id','j5-ev-adas','title','17 fitur ADAS','description','17 fitur bantuan pengemudi untuk perjalanan harian — menjaga jarak, jalur, dan memberi peringatan. Kendali tetap di tangan pengemudi.','tag','ADAS')
  )
), now()
FROM public.models m
WHERE m.slug = 'jaecoo-j5-ev'
  AND NOT EXISTS (
    SELECT 1 FROM public.model_content mc WHERE mc.model_id = m.id AND mc.section = 'technology'
  );

-- J7 SHS technology
UPDATE public.model_content mc
SET
  content = public._merge_tech_feature_text(
    public._merge_tech_feature_text(
      public._merge_tech_feature_text(
        public._merge_tech_feature_text(
          COALESCE(mc.content, '{}'::jsonb)
            || jsonb_build_object(
              'headline', 'Super Hybrid System',
              'subheadline', 'Mesin 1.5TGDI DHE generasi kelima dipadu motor listrik melalui DHT. Efisiensi termal 44,5%, efisiensi EV hingga 98,5%.'
            ),
          'j7-shs-powertrain',
          '1.5TGDI DHE + DHT',
          'Mesin 140 hp dipadu motor listrik 201 hp. Baterai 18,3 kWh (IP68) memungkinkan pure EV mode hingga 100 km untuk perjalanan kota.',
          'SHS'
        ),
        'j7-shs-range',
        '1.300 km jarak kombinasi',
        'Mesin dan listrik bekerja bersama untuk jarak kombinasi hingga 1.300 km. Akselerasi 0–100 km/jam 7,3 detik terasa cukup untuk jalanan harian.',
        'Jarak'
      ),
      'j7-shs-modes',
      'ECO · STANDARD · SPORT',
      'ECO untuk hemat, STANDARD untuk keseimbangan harian, SPORT saat butuh respons lebih cepat dari powertrain hybrid.',
      'Mode'
    ),
    'j7-shs-adas',
    '19 fitur ADAS',
    'Adaptive cruise, traffic jam assist, blind spot, AEB, dan lane assist termasuk di dalamnya. Dilengkapi kamera 540° HD dan delapan airbag.',
    'Keselamatan'
  ),
  updated_at = now()
FROM public.models m
WHERE mc.model_id = m.id AND m.slug = 'jaecoo-j7-shs' AND mc.section = 'technology';

INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'technology', jsonb_build_object(
  'headline', 'Super Hybrid System',
  'subheadline', 'Mesin 1.5TGDI DHE generasi kelima dipadu motor listrik melalui DHT. Efisiensi termal 44,5%, efisiensi EV hingga 98,5%.',
  'features', jsonb_build_array(
    jsonb_build_object('id','j7-shs-powertrain','title','1.5TGDI DHE + DHT','description','Mesin 140 hp dipadu motor listrik 201 hp. Baterai 18,3 kWh (IP68) memungkinkan pure EV mode hingga 100 km untuk perjalanan kota.','tag','SHS'),
    jsonb_build_object('id','j7-shs-range','title','1.300 km jarak kombinasi','description','Mesin dan listrik bekerja bersama untuk jarak kombinasi hingga 1.300 km. Akselerasi 0–100 km/jam 7,3 detik terasa cukup untuk jalanan harian.','tag','Jarak'),
    jsonb_build_object('id','j7-shs-modes','title','ECO · STANDARD · SPORT','description','ECO untuk hemat, STANDARD untuk keseimbangan harian, SPORT saat butuh respons lebih cepat dari powertrain hybrid.','tag','Mode'),
    jsonb_build_object('id','j7-shs-adas','title','19 fitur ADAS','description','Adaptive cruise, traffic jam assist, blind spot, AEB, dan lane assist termasuk di dalamnya. Dilengkapi kamera 540° HD dan delapan airbag.','tag','Keselamatan')
  )
), now()
FROM public.models m
WHERE m.slug = 'jaecoo-j7-shs'
  AND NOT EXISTS (
    SELECT 1 FROM public.model_content mc WHERE mc.model_id = m.id AND mc.section = 'technology'
  );

-- J7 SIVP technology
UPDATE public.model_content mc
SET
  content = public._merge_tech_feature_text(
    public._merge_tech_feature_text(
      public._merge_tech_feature_text(
        public._merge_tech_feature_text(
          COALESCE(mc.content, '{}'::jsonb)
            || jsonb_build_object(
              'headline', 'Super Intelligent Valet Parking',
              'subheadline', 'J7 memetakan lingkungan, memilih jalur, lalu memarkir sendiri. Platform-nya tetap plug-in hybrid; yang membedakan di halaman ini adalah Super Intelligent Valet Parking.'
            ),
          'j7-sivp-see',
          '27 sensor dan kamera',
          'Sensor dan kamera memetakan sekitar secara real-time. LiDAR 128-channel dToF mengukur jarak, radar membaca objek, kamera 540° memberi konteks visual.',
          'Persepsi'
        ),
        'j7-sivp-spaces',
        'Ruang sempit maupun terbuka',
        'Basement sempit, tikungan ketat, dan pilar ditangani dengan lebih presisi. Di ruang terbuka, sistem tetap bekerja tanpa perlu setting khusus.',
        'SIVP'
      ),
      'j7-sivp-steps',
      'Pilih, deteksi, pantau, parkir',
      'Tentukan zona parkir dari smartphone, lalu turun. Sistem mendeteksi objek bergerak dan diam, prosesnya dipantau dari aplikasi sampai parkir selesai.',
      'Alur'
    ),
    'j7-sivp-platform',
    'Platform SHS-P',
    'Platform hybrid sama dengan J7 SHS: baterai 18,3 kWh, EV range 100 km, jarak kombinasi 1.300 km, dan pengisian AC 7,7 kW.',
    'Platform'
  ),
  updated_at = now()
FROM public.models m
WHERE mc.model_id = m.id AND m.slug = 'jaecoo-j7-sivp' AND mc.section = 'technology';

INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'technology', jsonb_build_object(
  'headline', 'Super Intelligent Valet Parking',
  'subheadline', 'J7 memetakan lingkungan, memilih jalur, lalu memarkir sendiri. Platform-nya tetap plug-in hybrid; yang membedakan di halaman ini adalah Super Intelligent Valet Parking.',
  'features', jsonb_build_array(
    jsonb_build_object('id','j7-sivp-see','title','27 sensor dan kamera','description','Sensor dan kamera memetakan sekitar secara real-time. LiDAR 128-channel dToF mengukur jarak, radar membaca objek, kamera 540° memberi konteks visual.','tag','Persepsi'),
    jsonb_build_object('id','j7-sivp-spaces','title','Ruang sempit maupun terbuka','description','Basement sempit, tikungan ketat, dan pilar ditangani dengan lebih presisi. Di ruang terbuka, sistem tetap bekerja tanpa perlu setting khusus.','tag','SIVP'),
    jsonb_build_object('id','j7-sivp-steps','title','Pilih, deteksi, pantau, parkir','description','Tentukan zona parkir dari smartphone, lalu turun. Sistem mendeteksi objek bergerak dan diam, prosesnya dipantau dari aplikasi sampai parkir selesai.','tag','Alur'),
    jsonb_build_object('id','j7-sivp-platform','title','Platform SHS-P','description','Platform hybrid sama dengan J7 SHS: baterai 18,3 kWh, EV range 100 km, jarak kombinasi 1.300 km, dan pengisian AC 7,7 kW.','tag','Platform')
  )
), now()
FROM public.models m
WHERE m.slug = 'jaecoo-j7-sivp'
  AND NOT EXISTS (
    SELECT 1 FROM public.model_content mc WHERE mc.model_id = m.id AND mc.section = 'technology'
  );

-- J8 technology
UPDATE public.model_content mc
SET
  content = public._merge_tech_feature_text(
    public._merge_tech_feature_text(
      public._merge_tech_feature_text(
        public._merge_tech_feature_text(
          COALESCE(mc.content, '{}'::jsonb)
            || jsonb_build_object(
              'headline', 'Super Hybrid System · ARDIS',
              'subheadline', 'Triple motor dan AWD ARDIS menyesuaikan respons dengan medan. Tujuh mode berkendara, tenaga gabungan 530 PS, torsi 650 Nm.'
            ),
          'j8-shs-output',
          '530 PS dan 650 Nm',
          'Mesin 1.5L TGDI dipadu triple motor PHEV. 0–100 km/jam 5,4 detik, kecepatan maksimum 205 km/jam — tenaga yang terasa saat dibutuhkan.',
          'Performa'
        ),
        'j8-shs-ardis',
        'AWD · 7 mode ARDIS',
        'AWD ARDIS dengan tujuh mode — dari jalan berubah, water crossing, sand, hingga trail — supaya traksi menyesuaikan medan.',
        'ARDIS'
      ),
      'j8-shs-battery',
      'EV range hingga 180 km',
      'Baterai 34,46 kWh LFP, EV range hingga 180 km, total range klaim di atas 1.400 km. Ada V2L 6,6 kW dan regenerasi tiga level.',
      'Hybrid'
    ),
    'j8-shs-safety',
    '19 ADAS · 10 airbag',
    '19 fitur ADAS, kamera 540° HD, dan 10 airbag. Suspensi CDC magnetic dengan setup double wishbone / multi-link, velg 20 inci.',
    'Keselamatan'
  ),
  updated_at = now()
FROM public.models m
WHERE mc.model_id = m.id AND m.slug = 'jaecoo-j8-shs' AND mc.section = 'technology';

INSERT INTO public.model_content (model_id, section, content, updated_at)
SELECT m.id, 'technology', jsonb_build_object(
  'headline', 'Super Hybrid System · ARDIS',
  'subheadline', 'Triple motor dan AWD ARDIS menyesuaikan respons dengan medan. Tujuh mode berkendara, tenaga gabungan 530 PS, torsi 650 Nm.',
  'features', jsonb_build_array(
    jsonb_build_object('id','j8-shs-output','title','530 PS dan 650 Nm','description','Mesin 1.5L TGDI dipadu triple motor PHEV. 0–100 km/jam 5,4 detik, kecepatan maksimum 205 km/jam — tenaga yang terasa saat dibutuhkan.','tag','Performa'),
    jsonb_build_object('id','j8-shs-ardis','title','AWD · 7 mode ARDIS','description','AWD ARDIS dengan tujuh mode — dari jalan berubah, water crossing, sand, hingga trail — supaya traksi menyesuaikan medan.','tag','ARDIS'),
    jsonb_build_object('id','j8-shs-battery','title','EV range hingga 180 km','description','Baterai 34,46 kWh LFP, EV range hingga 180 km, total range klaim di atas 1.400 km. Ada V2L 6,6 kW dan regenerasi tiga level.','tag','Hybrid'),
    jsonb_build_object('id','j8-shs-safety','title','19 ADAS · 10 airbag','description','19 fitur ADAS, kamera 540° HD, dan 10 airbag. Suspensi CDC magnetic dengan setup double wishbone / multi-link, velg 20 inci.','tag','Keselamatan')
  )
), now()
FROM public.models m
WHERE m.slug = 'jaecoo-j8-shs'
  AND NOT EXISTS (
    SELECT 1 FROM public.model_content mc WHERE mc.model_id = m.id AND mc.section = 'technology'
  );

-- Cleanup helper (optional keep for re-runs)
DROP FUNCTION IF EXISTS public._merge_tech_feature_text(jsonb, text, text, text, text);
