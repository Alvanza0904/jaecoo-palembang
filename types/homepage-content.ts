export interface HomepageContent {
  id: string;
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };
  experience: {
    title: string;
    description: string;
  };
  technology: {
    title: string;
    description: string;
  };
  about: {
    title: string;
    description: string;
  };
  promo: {
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };
  journal: {
    title: string;
    description: string;
  };
  dealer_location: {
    title: string;
    description: string;
    address: string;
  };
  final_cta: {
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  updated_at?: string;
}
