/**
 * JAECOO Palembang — Gallery Types
 */

import type { ResponsiveImage } from "./media";

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image: ResponsiveImage;
  model_slug?: string;
  category?: string;
  published: boolean;
  sort_order: number;
}
