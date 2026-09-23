import type { MediaWithArtDirection, ResponsiveImage } from "@/lib/types/media";

function hasSource(image?: ResponsiveImage): boolean {
  return !!(image?.desktop || image?.tablet || image?.mobile || image?.small_mobile);
}

/**
 * Sub-page heroes are optional. An empty Technology or Specifications hero
 * falls back to the model hero. A filled hero replaces it completely.
 */
export function resolveSubpageHero(
  custom: ResponsiveImage | undefined,
  modelHero: MediaWithArtDirection,
): MediaWithArtDirection {
  if (!hasSource(custom) || !custom) return modelHero;
  return { image: custom };
}
