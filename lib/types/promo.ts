/**
 * JAECOO Palembang — Promo Types (Step 8.10)
 * Aligned with Supabase promos table schema
 */

export type PromoType =
  | 'general'
  | 'cashback'
  | 'dp'
  | 'leasing'
  | 'trade_in'
  | 'event'
  | 'special_offer';

export type PromoStatus = 'draft' | 'published' | 'expired';

export interface Promo {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  promo_type: PromoType;
  model_id: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: PromoStatus;
  featured: boolean;
  sort_order: number;
  cta_label: string | null;
  cta_action: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined data from models table
  models?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export type PromoFormData = Omit<Promo, 'id' | 'created_at' | 'updated_at' | 'models'>;

/**
 * @deprecated Gunakan `Promo` (Step 8.10).
 * Alias ini dipertahankan agar komponen legacy (HomeExperience) tidak broken.
 */
export type PromoData = Promo;
