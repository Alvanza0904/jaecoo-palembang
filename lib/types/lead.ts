/**
 * JAECOO Palembang — Lead Types
 */

export type LeadSource =
  | "homepage_hero"
  | "homepage_global"
  | "homepage_final_cta"
  | "model_overview"
  | "model_index"
  | "model_technology"
  | "model_specifications"
  | "promo"
  | "promo_page"
  | "promo_detail"
  | "gallery_page"
  | "berita_page"
  | "calculator"
  | "sales_page"
  | "footer"
  | "other";

export interface LeadContext {
  source: LeadSource;
  source_page?: string;
  model?: string;
  variant?: string;
  source_cta?: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  message?: string;
  context: LeadContext;
}
