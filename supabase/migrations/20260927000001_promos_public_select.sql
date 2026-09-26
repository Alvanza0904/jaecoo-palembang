-- Public site and sitemap read published rows only.
-- RLS stays enabled.
-- Existing policies already restrict anon:
--   news.published = true
--   promos.status = 'published'
-- 42501 is a missing table GRANT, not a schema change.

GRANT SELECT ON TABLE public.news TO anon;
GRANT SELECT ON TABLE public.promos TO anon;
