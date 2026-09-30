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

// Additional models loaded from sibling modules once present.
// Keep exports stable for consumers of MODEL_PRICES and MODELS.
export { MODEL_PRICES } from "./models/shared";

let MODELS_CACHE: ModelData[] | null = null;

function loadModels(): ModelData[] {
  if (MODELS_CACHE) return MODELS_CACHE;
  const list: ModelData[] = [MODEL_J5_EV];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MODEL_J7_SHS } = require("./models/j7-shs");
    list.push(MODEL_J7_SHS);
  } catch {
    /* module not yet available */
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MODEL_J7_SIVP } = require("./models/j7-sivp");
    list.push(MODEL_J7_SIVP);
  } catch {
    /* module not yet available */
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MODEL_J8_SHS } = require("./models/j8-shs");
    list.push(MODEL_J8_SHS);
  } catch {
    /* module not yet available */
  }
  MODELS_CACHE = list;
  return list;
}

export const MODELS: ModelData[] = loadModels();

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
