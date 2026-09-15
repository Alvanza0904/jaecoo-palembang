-- Step 8.10: Promo CMS — Database Migration
-- Buat enum dan tabel promos

CREATE TYPE public.promo_type_enum AS ENUM (
  'general', 'cashback', 'dp', 'leasing', 'trade_in', 'event', 'special_offer'
);

CREATE TYPE public.promo_status_enum AS ENUM (
  'draft', 'published', 'expired'
);

CREATE TABLE IF NOT EXISTS public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  promo_type public.promo_type_enum NOT NULL DEFAULT 'general',
  model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  status public.promo_status_enum NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  cta_label VARCHAR(100) DEFAULT 'Dapatkan Promo',
  cta_action VARCHAR(255) DEFAULT 'https://wa.me/6285183145926',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_promos_status   ON public.promos(status);
CREATE INDEX IF NOT EXISTS idx_promos_slug     ON public.promos(slug);
CREATE INDEX IF NOT EXISTS idx_promos_featured ON public.promos(featured);

ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to published promos"
  ON public.promos FOR SELECT
  USING (status = 'published');

CREATE POLICY "Allow authenticated users full access on promos"
  ON public.promos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
