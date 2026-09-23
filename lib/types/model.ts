/**
 * JAECOO Palembang — Model Types
 *
 * One reusable template drives J5, J7, J8.
 * Variants (e.g. J7 SIVP) belong to a model, not a separate page.
 *
 * STEP 4A: Updated slugs to jaecoo-* format.
 * STEP 5B.1: Added PriceStatus — price_status lives on ModelVariant.
 *            price_idr and price_display are now nullable (non-official statuses).
 */

import type { MediaWithArtDirection, ResponsiveImage } from "./media";

export type ModelSlug = "jaecoo-j5-ev" | "jaecoo-j7-shs" | "jaecoo-j7-sivp" | "jaecoo-j8-shs";

// ─── Price Status ─────────────────────────────────────────────────────────────

/**
 * Controls how price is rendered on the public website.
 *
 * official      → tampil nominal Rp, calculator aktif
 * starting_from → tampil "Mulai dari Rp...", calculator boleh aktif jika price valid
 * prebook       → tampil badge PRE-BOOK, calculator disabled
 * coming_soon   → tampil badge COMING SOON, calculator disabled
 * contact_sales → tampil CTA Hubungi Sales, calculator disabled
 * hidden        → harga tidak tampil sama sekali, calculator disabled
 */
export type PriceStatus =
  | "official"
  | "starting_from"
  | "prebook"
  | "coming_soon"
  | "contact_sales"
  | "hidden";

/**
 * Returns true if this status requires a price_idr amount to render correctly.
 * (Used to decide if calculator can be shown and if price_idr should be required
 * in API validation.)
 */
export function priceStatusRequiresAmount(status: PriceStatus): boolean {
  return status === "official" || status === "starting_from";
}

/**
 * Returns true if FinanceCalculator should be shown for this variant.
 * Calculator is only meaningful when price_idr is a real number.
 */
export function priceStatusAllowsCalculator(
  status: PriceStatus,
  price_idr: number | null | undefined
): boolean {
  if (!priceStatusRequiresAmount(status)) return false;
  if (!price_idr || price_idr <= 0 || isNaN(price_idr)) return false;
  return true;
}

// ─── Model entities ───────────────────────────────────────────────────────────

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
  /** Price status — controls display & calculator */
  price_status: PriceStatus;
  /** OTR price in IDR — nullable for non-official statuses */
  price_idr: number | null;
  /** Price formatted for display — nullable */
  price_display: string | null;
  /** Optional override e.g. "Mulai dari Rp500 juta" */
  price_display_override?: string | null;
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

export interface ModelImageSlots {
  [slot: string]: ResponsiveImage | undefined;
}

export interface ModelHighlight {
  value: string;
  label: string;
  unit?: string;
}

export interface ModelSectionCopy {
  /** Small category label, e.g. "Desain" */
  label?: string;
  /** Heading. Newlines become line breaks. */
  heading?: string;
  body?: string;
  stat?: string;
  unit?: string;
  /** Primary button label when this section has a CTA. */
  primary_label?: string;
  /** Secondary button label when this section has a second CTA. */
  secondary_label?: string;
}

/**
 * Editable editorial copy for the cinematic model pages.
 * Stored in model_content.section = "page". Empty fields fall back
 * to the static copy for that model — never to another model's data.
 */
export interface ModelPageCopy {
  exterior?: ModelSectionCopy;
  design?: ModelSectionCopy;
  profile?: ModelSectionCopy;
  interior?: ModelSectionCopy;
  cockpit?: ModelSectionCopy;
  performance?: ModelSectionCopy;
  adas?: ModelSectionCopy;
  /** Overview hero button labels. */
  hero_cta?: ModelSectionCopy;
  /** Overview final CTA. */
  cta?: ModelSectionCopy;
  tech_intelligence?: ModelSectionCopy;
  /** Technology page closing scene. Image is the tech_cta slot. */
  tech_close?: ModelSectionCopy;
  /** Specifications page closing CTA. */
  specs_cta?: ModelSectionCopy;
  tech_stats?: ModelHighlight[];
}

export interface ModelData {
  /** URL slug — matches route /model/[slug] */
  slug: ModelSlug;
  /** CMS display order — mirrors models.sort_order. */
  sort_order?: number;
  /** Full display name e.g. "JAECOO J5 EV" */
  name: string;
  /** Short model identifier e.g. "J5 EV" */
  short_name: string;
  /** Tagline for hero */
  tagline: string;
  /** Body — one to two sentences */
  description: string;

  /** Hero media */
  hero_media: MediaWithArtDirection;

  /** CMS-managed image slots for the cinematic model page. */
  image_slots?: ModelImageSlots;

  /** Key performance numbers for the overview performance scene. */
  highlights?: ModelHighlight[];

  /** Per-model editorial copy. Not shared across variants. */
  page_copy?: ModelPageCopy;

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
