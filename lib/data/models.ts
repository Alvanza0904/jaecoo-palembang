/**
 * JAECOO Palembang — Model Data
 *
 * Static fallback used when Supabase has no row for a field.
 * Figures below are taken from omodajaecoopalembang.web.id.
 * J7 SHS and J7 SIVP are separate models — do not share feature copy.
 *
 * Slugs: jaecoo-j5-ev | jaecoo-j7-shs | jaecoo-j7-sivp | jaecoo-j8-shs
 */

import type { ModelData, ModelSpecCategory } from "@/lib/types/model";

export const MODEL_PRICES = {
  "jaecoo-j5-ev": 354_900_000,
  "jaecoo-j7-shs": 534_900_000,
  "jaecoo-j8-shs": 865_000_000,
} as const;

const emptyImage = (alt: string) => ({ desktop: undefined, alt });
