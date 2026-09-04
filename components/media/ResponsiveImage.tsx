/**
 * JAECOO Palembang — Responsive Image Component
 *
 * Wraps Next.js Image with art direction support.
 * Each breakpoint can have an independent source.
 */

import Image from "next/image";
import type { ResponsiveImage as ResponsiveImageData } from "@/lib/types/media";
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

  if (fill) {
    return (
      <Image
        src={src}
        alt={image.alt}
        fill
        priority={priority}
        style={{ objectFit }}
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
      style={{ objectFit }}
      className={[styles.image, className].filter(Boolean).join(" ")}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
    />
  );
}
