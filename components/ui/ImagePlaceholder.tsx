/**
 * JAECOO Palembang — Image Placeholder Component
 *
 * Displays a premium, clearly-labelled placeholder whenever a CMS image
 * is not yet available.  Appearance is intentionally minimal — off-white,
 * thin border, subtle grid — so the owner immediately understands
 * "this area needs a photo" without breaking the editorial feel.
 *
 * Usage:
 *   <ImagePlaceholder label="HERO BACKGROUND · DESKTOP" ratio="16/9" />
 *   <ImagePlaceholder label="EXTERIOR" ratio="4/3" device="desktop" />
 */

import styles from "./ImagePlaceholder.module.css";

interface ImagePlaceholderProps {
  /** Section label — e.g. "HERO BACKGROUND", "EXTERIOR", "INTERIOR" */
  label: string;
  /** Optional device / breakpoint qualifier */
  device?: "desktop" | "tablet" | "mobile" | "all";
  /** Suggested aspect ratio — displayed as hint */
  ratio?: string;
  /** Optional source hint */
  source?: string;
  /** Custom className for outer wrapper */
  className?: string;
  /** Height override — defaults to ratio-based padding trick */
  height?: string | number;
}

export function ImagePlaceholder({
  label,
  device,
  ratio = "16/9",
  source = "Admin → Media Library",
  className = "",
  height,
}: ImagePlaceholderProps) {
  const deviceLabel = device ? ` · ${device.toUpperCase()}` : "";
  const fullLabel = `${label}${deviceLabel}`;

  const paddingStyle = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : { aspectRatio: ratio };

  return (
    <div
      className={[styles.placeholder, className].filter(Boolean).join(" ")}
      style={paddingStyle}
      aria-label={`Image placeholder: ${fullLabel}`}
      role="img"
    >
      {/* Subtle grid overlay */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Corner accents */}
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerTR} aria-hidden="true" />
      <div className={styles.cornerBL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="17" height="17" rx="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M1.5 13L6.5 8L10 11.5L13 8.5L18.5 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className={styles.labelLine}>IMAGE PLACEHOLDER</p>
        <p className={styles.sectionLine}>{fullLabel}</p>
        {ratio && <p className={styles.ratioLine}>{ratio}</p>}
        <p className={styles.sourceLine}>{source}</p>
      </div>
    </div>
  );
}
