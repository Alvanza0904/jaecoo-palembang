import { priceStatusAllowsCalculator, type ModelData, type ModelVariant, type PriceStatus } from "@/lib/types/model";

export interface CalculatorVariant {
  id: string;
  name: string;
  label?: string;
  price_status: PriceStatus;
  price_idr: number | null;
  price_region?: string;
}

export interface CalculatorModel {
  slug: string;
  name: string;
  short_name: string;
  variants: CalculatorVariant[];
}

function asVariant(variant: ModelVariant): CalculatorVariant {
  return {
    id: variant.id,
    name: variant.name,
    label: variant.label,
    price_status: variant.price_status,
    price_idr: variant.price_idr,
    price_region: variant.price_region,
  };
}

export function toCalculatorModel(
  model: Pick<ModelData, "slug" | "name" | "short_name" | "variants">,
): CalculatorModel {
  return {
    slug: model.slug,
    name: model.name,
    short_name: model.short_name,
    variants: model.variants.map(asVariant),
  };
}

export function isCalculableVariant(
  variant: CalculatorVariant,
): variant is CalculatorVariant & { price_idr: number } {
  return priceStatusAllowsCalculator(variant.price_status, variant.price_idr);
}

export function catalogFromModels(models: ModelData[]): CalculatorModel[] {
  return models
    .map(toCalculatorModel)
    .filter((entry) => entry.variants.some(isCalculableVariant));
}