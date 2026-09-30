/**
 * JAECOO Palembang — Model Data
 *
 * Static fallback used when Supabase has no row for a field.
 * Figures below are taken from omodajaecoopalembang.web.id.
 * J7 SHS and J7 SIVP are separate models — do not share feature copy.
 *
 * Slugs: jaecoo-j5-ev | jaecoo-j7-shs | jaecoo-j7-sivp | jaecoo-j8-shs
 */

import type { ModelData } from "@/lib/types/model";
import { MODEL_J5_EV } from "./models/j5-ev";
import { MODEL_J7_SHS } from "./models/j7-shs";
import { MODEL_J7_SIVP } from "./models/j7-sivp";
import { MODEL_J8_SHS } from "./models/j8-shs";

export { MODEL_PRICES } from "./models/shared";

export const MODELS: ModelData[] = [
  MODEL_J5_EV,
  MODEL_J7_SHS,
  MODEL_J7_SIVP,
  MODEL_J8_SHS,
];

export function getModels(): ModelData[] {
  return MODELS.filter((m) => m.published);
}

export function getModelBySlug(slug: string): ModelData | undefined {
  return MODELS.find((m) => m.slug === slug && m.published);
}

export function getModelSlugs(): string[] {
  return MODELS.filter((m) => m.published).map((m) => m.slug);
}

export function getModelPrice(slug: string): number | null {
  const model = getModelBySlug(slug);
  return model?.default_variant.price_idr ?? null;
}
