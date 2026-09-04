/**
 * JAECOO Palembang — Promo Types
 */

import type { ResponsiveImage } from "./media";

export interface PromoData {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge?: string;
  valid_until?: string;
  /** null = still active */
  expired_at?: string | null;
  image: ResponsiveImage;
  cta_label: string;
  cta_whatsapp_context?: string;
  model_slug?: string;
  published: boolean;
  updated_at: string;
}
