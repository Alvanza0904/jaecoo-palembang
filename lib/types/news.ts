/**
 * JAECOO Palembang — News / Journal Types
 */

import type { ResponsiveImage } from "./media";

export interface NewsData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html?: string;
  cover: ResponsiveImage;
  category: string;
  published_at: string;
  updated_at: string;
  published: boolean;
  meta_title?: string;
  meta_description?: string;
}
