/**
 * JAECOO Palembang — Media Types
 *
 * Supports independent art direction per breakpoint.
 * All breakpoints are optional; UI falls back gracefully.
 */

export type ImageFormat = "avif" | "webp" | "jpg" | "png";

export interface ArtDirectionSettings {
  /** Horizontal focal point 0–100 */
  focal_x?: number;
  /** Vertical focal point 0–100 */
  focal_y?: number;
  /** CSS object-position x override */
  x?: string;
  /** CSS object-position y override */
  y?: string;
  /** Scale multiplier */
  scale?: number;
  /** Text block horizontal position 0–100 */
  text_x?: number;
  /** Text block vertical position 0–100 */
  text_y?: number;
  /** Text block width as percentage */
  text_width?: number;
  /** "auto" uses focal_x/y; "custom" uses x/y */
  mode?: "auto" | "custom";
}

export interface ResponsiveImage {
  /** Desktop (≥1024px) */
  desktop?: string;
  /** Tablet (≥768px) */
  tablet?: string;
  /** Mobile (≥390px) */
  mobile?: string;
  /** Small mobile (<390px) */
  small_mobile?: string;
  /** Vehicle cutout (transparent PNG/WebP) */
  cutout?: string;
  /** Video poster fallback */
  poster?: string;
  /** Alt text — required for accessibility */
  alt: string;
  /** Width of source image */
  width?: number;
  /** Height of source image */
  height?: number;
}

export interface MediaWithArtDirection {
  image: ResponsiveImage;
  art_direction?: {
    desktop?: ArtDirectionSettings;
    tablet?: ArtDirectionSettings;
    mobile?: ArtDirectionSettings;
    small_mobile?: ArtDirectionSettings;
  };
}

export interface ResponsiveVideo {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  small_mobile?: string;
  poster: string;
  alt: string;
}
