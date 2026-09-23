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
  return {
    image: custom,
    presentation_settings: custom.presentation_settings,
    cutout_presentation_settings: custom.cutout_presentation_settings,
    focal_x: custom.focal_x,
    focal_y: custom.focal_y,
    cutout_focal_x: custom.cutout_focal_x,
    cutout_focal_y: custom.cutout_focal_y,
  };
}
