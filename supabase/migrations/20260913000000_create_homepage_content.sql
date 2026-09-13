-- Create table for Homepage Content
CREATE TABLE IF NOT EXISTS public.homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero JSONB NOT NULL DEFAULT '{}'::jsonb,
    experience JSONB NOT NULL DEFAULT '{}'::jsonb,
    technology JSONB NOT NULL DEFAULT '{}'::jsonb,
    about JSONB NOT NULL DEFAULT '{}'::jsonb,
    promo JSONB NOT NULL DEFAULT '{}'::jsonb,
    journal JSONB NOT NULL DEFAULT '{}'::jsonb,
    dealer_location JSONB NOT NULL DEFAULT '{}'::jsonb,
    final_cta JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert singleton row (We will always query this specific row or just the first row)
INSERT INTO public.homepage_content (id, hero, experience, technology, about, promo, journal, dealer_location, final_cta, seo)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '{"eyebrow": "THE NEW ERA OF OFF-ROAD", "headline": "JAECOO J7", "description": "From Classic, Beyond Classic.", "ctaText": "Discover More", "ctaUrl": "/models/j7"}',
    '{"title": "Unrivaled Experience", "description": "Designed for the fearless."}',
    '{"title": "Advanced Technology", "description": "Smart cabin and ARDIS system for all terrains."}',
    '{"title": "About JAECOO", "description": "Born for the global off-road SUV market."}',
    '{"title": "Special Offers", "description": "Get exclusive deals at JAECOO Palembang.", "ctaText": "View Promos", "ctaUrl": "/promo"}',
    '{"title": "JAECOO Journal", "description": "Latest news and community stories."}',
    '{"title": "Visit Our Dealer", "description": "Test drive your dream car today.", "address": "OMODA JAECOO Palembang\nJl. R. Sukamto, Palembang"}',
    '{"title": "Ready for Adventure?", "description": "Contact our sales consultant for the best price.", "ctaText": "Contact Alvan", "ctaUrl": "/contact"}',
    '{"metaTitle": "JAECOO Palembang | Official Dealer", "metaDescription": "Temukan SUV Premium JAECOO J7 & J8 di Palembang."}'
) ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read-only access." ON public.homepage_content FOR SELECT USING (true);

-- Allow authenticated users (Admin) to update
CREATE POLICY "Allow authenticated users to update." ON public.homepage_content FOR UPDATE USING (auth.role() = 'authenticated');
