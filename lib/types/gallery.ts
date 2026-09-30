/**
 * JAECOO Palembang — Gallery Types
 *
 * Gallery is a visual showcase, not a second model product page.
 * Items always reference real ResponsiveImage from CMS / model data.
 */

import type { ResponsiveImage } from "./media";

export type GallerySectionId =
  | "exterior"
  | "interior"
  | "detail"
  | "technology"
  | "colors"
  | "delivery";

export type GalleryLayout = "full" | "wide" | "portrait" | "square";

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image: ResponsiveImage;
  model_slug?: string;
  category?: GallerySectionId | string;
  layout?: GalleryLayout;
  /** Hex swatch for color items */
  color_hex?: string;
  published: boolean;
  sort_order: number;
}

export interface GallerySection {
  id: GallerySectionId;
  heading: string;
  body?: string;
  items: GalleryItem[];
}

export interface ModelGalleryData {
  slug: string;
  name: string;
  short_name: string;
  hero?: ResponsiveImage;
  hero_caption: string;
  sections: GallerySection[];
}
