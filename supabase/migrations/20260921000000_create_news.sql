-- JAECOO Palembang — News / Journal Table Migration

CREATE TABLE IF NOT EXISTS public.news (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  excerpt       TEXT NOT NULL DEFAULT '',
  body_html     TEXT,
  category      VARCHAR(100) NOT NULL DEFAULT 'Brand',
  cover_url     TEXT,
  published     BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  meta_title    VARCHAR(255),
  meta_description TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_news_published    ON public.news(published);
CREATE INDEX IF NOT EXISTS idx_news_slug         ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);

-- Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public: hanya baca artikel yang published
CREATE POLICY "Public read published news"
  ON public.news FOR SELECT
  USING (published = true);

-- Admin (authenticated): full access
CREATE POLICY "Authenticated full access on news"
  ON public.news FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
