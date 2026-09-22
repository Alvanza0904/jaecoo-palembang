/**
 * JAECOO Palembang — Responsive Image Component
 *
 * Wraps Next.js Image with art direction support.
 * Each breakpoint can have an independent source.
 *
 * UPDATED: Now applies presentation_settings (position/scale/fit) using the
 * same shared helpers as LayeredHero — single source of truth.
 */

import Image from "next/image";
import type { ResponsiveImage as ResponsiveImageData } from "@/lib/types/media";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./ResponsiveImage.module.css";

interface ResponsiveImageProps {
  image: ResponsiveImageData;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
}

export function ResponsiveImage({
  image,
  priority = false,
  fill = false,
  className = "",
  objectFit = "cover",
}: ResponsiveImageProps) {
  // Use desktop as primary src, fallback chain: desktop → tablet → mobile → placeholder
  const src = image.desktop ?? image.tablet ?? image.mobile ?? "/images/placeholder.jpg";

  // Apply presentation_settings if available — same as LayeredHero pattern.
  const ps = image.presentation_settings;
  const presentationStyle = ps
    ? getBackgroundLayerStyle(ps, "desktop", image.focal_x ?? 50, image.focal_y ?? 50)
    : {};

  // Base style: objectFit prop as fallback, overridden by presentation_settings
  const imageStyle = Object.keys(presentationStyle).length > 0
    ? presentationStyle
    : { objectFit };

  if (fill) {
    return (
      <Image
        src={src}
        alt={image.alt}
        fill
        priority={priority}
        style={imageStyle}
        className={[styles.image, className].filter(Boolean).join(" ")}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={image.alt}
      width={image.width ?? 1920}
      height={image.height ?? 1080}
      priority={priority}
      style={imageStyle}
      className={[styles.image, className].filter(Boolean).join(" ")}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
    />
  );
}
