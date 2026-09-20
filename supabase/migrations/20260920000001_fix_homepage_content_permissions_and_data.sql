-- Fix: Grant permissions dan update data homepage content ke versi final
-- Run sekali di Supabase SQL Editor atau via supabase db push

-- 1. Grant permissions yang diperlukan
GRANT ALL ON public.homepage_content TO authenticated;
GRANT SELECT ON public.homepage_content TO anon;
GRANT ALL ON public.homepage_content TO service_role;

-- 2. Tambahkan INSERT policy jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'homepage_content'
    AND policyname = 'Allow authenticated users to insert.'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to insert." ON public.homepage_content FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- 3. Update data ke versi final production-ready
-- Hanya update field yang masih berisi placeholder lama
UPDATE public.homepage_content
SET
  hero = hero || '{
    "eyebrow": "DEALER RESMI JAECOO PALEMBANG",
    "headline": "JAECOO J5",
    "description": "Electric, legah dan bertenaga. SUV masa kini untuk perjalanan tanpa batas.",
    "ctaText": "Jelajahi J5",
    "ctaUrl": "/model/jaecoo-j5-ev"
  }'::jsonb,
  experience = experience || '{
    "title": "Berkendara Tanpa Kompromi",
    "description": "Setiap model JAECOO dirancang untuk memberikan pengalaman berkendara yang berbeda — dari efisiensi kota hingga ketangguhan off-road sesungguhnya."
  }'::jsonb,
  technology = technology || '{
    "title": "Teknologi yang Bekerja untuk Anda",
    "description": "Sistem hybrid terdepan, ADAS generasi terbaru, dan konektivitas cerdas — semua terintegrasi secara mulus dalam satu ekosistem yang intuitif."
  }'::jsonb,
  about = about || '{
    "title": "OMODA JAECOO Palembang",
    "description": "Dealer resmi JAECOO untuk wilayah Palembang dan Sumatera Selatan. Melayani konsultasi, test drive, pembelian, dan layanan purna jual dengan standar tertinggi."
  }'::jsonb,
  promo = promo || '{
    "title": "Penawaran Terkini",
    "description": "Program spesial dan harga terbaik untuk wilayah Palembang.",
    "ctaText": "Lihat Semua Promo",
    "ctaUrl": "/promo"
  }'::jsonb,
  journal = journal || '{
    "title": "JAECOO Journal",
    "description": "Cerita, insight, dan update terbaru dari dunia JAECOO."
  }'::jsonb,
  dealer_location = dealer_location || '{
    "title": "Kunjungi Showroom Kami",
    "description": "Rasakan langsung pengalaman JAECOO di showroom resmi Palembang.",
    "address": "OMODA JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506\u2013509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan \u2014 085183145926"
  }'::jsonb,
  final_cta = final_cta || '{
    "title": "Mulai Perjalanan Anda.",
    "description": "Jadwalkan test drive atau konsultasikan kebutuhan Anda bersama Alvan — sales resmi JAECOO Palembang.",
    "ctaText": "Chat dengan Alvan",
    "ctaUrl": "https://wa.me/6285183145926"
  }'::jsonb,
  seo = seo || '{
    "metaTitle": "JAECOO Palembang | Dealer Resmi SUV Premium",
    "metaDescription": "Dealer resmi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Test drive, simulasi kredit, dan promo eksklusif bersama Alvan."
  }'::jsonb,
  updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';
