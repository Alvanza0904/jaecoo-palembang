/**
 * JAECOO Palembang — Model Types
 *
 * One reusable template drives J5, J7, J8.
 * Variants (e.g. J7 SIVP) belong to a model, not a separate page.
 */

import type { MediaWithArtDirection, ResponsiveImage } from "./media";

export type ModelSlug = "j5-ev" | "j7-shs" | "j8-ardis-shs";

export interface ModelColor {
  id: string;
  name: string;
  /** Hex value for swatch */
  hex: string;
  /** Image per color, per breakpoint */
  image: ResponsiveImage;
}

export interface ModelVariant {
  id: string;
  name: string;
  /** e.g. "SIVP" */
  label?: string;
  /** OTR price in IDR */
  price_idr: number;
  /** Price formatted for display */
  price_display: string;
  /** Region for OTR price */
  price_region: string;
}

export interface ModelSpecCategory {
  label: string;
  specs: Array<{
    label: string;
    value: string;
  }>;
}

export interface ModelFeature {
  id: string;
  title: string;
  description: string;
  media?: MediaWithArtDirection;
  tag?: string;
}

export interface ModelTechnologySection {
  headline: string;
  subheadline?: string;
  features: ModelFeature[];
}

export interface ModelData {
  /** URL slug — matches route /model/[slug] */
  slug: ModelSlug;
  /** Full display name e.g. "JAECOO J5 EV" */
  name: string;
  /** Short model identifier e.g. "J5" */
  short_name: string;
  /** Tagline for hero */
  tagline: string;
  /** Body — one to two sentences */
  description: string;

  /** Hero media */
  hero_media: MediaWithArtDirection;

  /** Default / base variant */
  default_variant: ModelVariant;
  /** All variants including default */
  variants: ModelVariant[];

  /** Available exterior colors */
  colors: ModelColor[];

  /** Technology page content */
  technology: ModelTechnologySection;

  /** Specifications */
  specifications: ModelSpecCategory[];

  /** SEO */
  meta_title?: string;
  meta_description?: string;

  /** Published state */
  published: boolean;
  updated_at: string;
}
