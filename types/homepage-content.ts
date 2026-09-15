// ─────────────────────────────────────────────────────────────
// Visual Positioning Types (Unified Editor Step 9)
// ─────────────────────────────────────────────────────────────

export interface TextPosition {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
}

export interface SectionVisual {
  desktop_image?: string;
  mobile_image?: string;
  text_position_mode?: 'auto' | 'manual';
  desktop_position?: TextPosition;
  mobile_position?: TextPosition;
}

// ─────────────────────────────────────────────────────────────
// Homepage Section Shapes
// ─────────────────────────────────────────────────────────────

export interface HomepageContent {
  id: string;

  hero: SectionVisual & {
    eyebrow: string;
    headline: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };

  experience: SectionVisual & {
    title: string;
    description: string;
  };

  technology: SectionVisual & {
    title: string;
    description: string;
  };

  about: SectionVisual & {
    title: string;
    description: string;
  };

  promo: SectionVisual & {
    title: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
  };

  journal: SectionVisual & {
    title: string;
    description: string;
  };

  dealer_location: SectionVisual & {
    title: string;
    description: string;
    address: string;
  };

  final_cta: SectionVisual & {
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
