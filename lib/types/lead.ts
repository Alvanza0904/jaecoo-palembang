/**
 * JAECOO Palembang — Lead Types
 */

export type LeadSource =
  | "homepage_hero"
  | "model_overview"
  | "model_technology"
  | "model_specifications"
  | "promo"
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
