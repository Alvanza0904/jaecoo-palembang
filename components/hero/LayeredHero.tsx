/**
 * JAECOO Palembang — Layered Hero
 *
 * Architecture:
 *   BACKGROUND MEDIA (image/video)
 *     ↓
 *   TYPOGRAPHY LAYER
 *     ↓
 *   VEHICLE CUTOUT (foreground — overlaps typography)
 *
 * Supports: desktop / tablet / mobile / small_mobile
 * Art direction: focal_x, focal_y, mode (auto | custom)
 * Video: muted autoplay loop with poster fallback
 */

import Image from "next/image";
import type { MediaWithArtDirection, ResponsiveVideo } from "@/lib/types/media";
import { BREAKPOINT_ORDER, resolveBreakpointSettings, cutoutTransformToCSS, type BreakpointKey, type PresentationSettings, type PresentationMeta } from "@/lib/types/presentation";
import styles from "./LayeredHero.module.css";

export interface LayeredHeroProps {
  /** Background media — required */
  media: MediaWithArtDirection;
  /** Optional video source */
  video?: ResponsiveVideo;
  /** Hero heading — main model name */
  heading: React.ReactNode;
  /** Model identifier below heading */
  subheading?: React.ReactNode;
  /** Tagline / eyebrow text */
  tagline?: string;
  /** Call to action area */
  cta?: React.ReactNode;
  /** Overlay darkness (0–100) */
  overlayOpacity?: number;
  /** Minimum height variant */
  size?: "full" | "large" | "medium";
  /** Whether background is light (affects text color) */
  lightBackground?: boolean;
}

function getCutoutStyle(
  settings: PresentationSettings | undefined,
  breakpoint: BreakpointKey,
  focalX = 50,
  focalY = 50,
  bboxHPct?: number,
): React.CSSProperties {
  const effective = resolveBreakpointSettings(settings ?? {}, breakpoint, focalX, focalY, bboxHPct)
  const cutout = effective.cutout
  // Use objectFit:contain so the cutout PNG renders without cropping.
  // translate+scale transform positions it within the hero container.
  // Auto scale computed from bbox so vehicle fills frame per breakpoint.
  return {
    objectFit: "contain",
    objectPosition: "50% 50%",
    transform: cutoutTransformToCSS(cutout.position_x, cutout.position_y, cutout.scale),
    transformOrigin: "50% 50%",
  }
}

export function LayeredHero({
  media,
  video,
  heading,
  subheading,
  tagline,
  cta,
  overlayOpacity = 30,
  size = "full",
  lightBackground = false,
}: LayeredHeroProps) {
  const { image, art_direction } = media;
  const presentationSettings = media.presentation_settings;
  const cutoutPresentationSettings = media.cutout_presentation_settings ?? presentationSettings;
  const cutoutFocalX = media.cutout_focal_x ?? media.focal_x ?? 50;
  const cutoutFocalY = media.cutout_focal_y ?? media.focal_y ?? 50;

  // Build object-position from presentation_settings (source of truth from Visual Editor).
  // Falls back to art_direction for legacy assets that have not been through the editor.
  const getObjectPosition = (breakpoint: "desktop" | "tablet" | "mobile" | "small_mobile") => {
    // Map LayeredHero breakpoint names to BreakpointKey
    const bpKey = breakpoint === "small_mobile" ? "small_mobile" as const
                : breakpoint === "mobile"       ? "mobile"       as const
                : breakpoint === "tablet"       ? "tablet"       as const
                :                                 "desktop"      as const

    // If presentation_settings exist and has a custom/auto setting for this breakpoint, use it
    if (presentationSettings) {
      const resolved = resolveBreakpointSettings(
        presentationSettings,
        bpKey,
        media.focal_x ?? 50,
        media.focal_y ?? 50,
      )
      // position_x/y in presentation_settings = object-position %
      return `${resolved.position_x}% ${resolved.position_y}%`
    }

    // Legacy fallback: art_direction JSONB field
    const dir = art_direction?.[breakpoint as "desktop" | "tablet" | "mobile"];
    if (!dir) return "center center";
    if (dir.mode === "custom" && dir.x && dir.y) {
      return `${dir.x} ${dir.y}`;
    }
    const fx = dir.focal_x ?? 50;
    const fy = dir.focal_y ?? 50;
    return `${fx}% ${fy}%`;
  };

  // Extract cutout bbox from presentation_settings._meta for auto-scale
  const cutoutMeta = (cutoutPresentationSettings as (PresentationSettings & { _meta?: PresentationMeta }) | undefined)?._meta
  const cutoutBboxHPct = cutoutMeta?.cutout_bbox?.h_pct

  const hasCutout = !!image.cutout;

  return (
    <section
      className={[
        styles.hero,
        styles[`hero--${size}`],
        lightBackground ? styles.heroLight : styles.heroDark,
      ].join(" ")}
      aria-label="Hero section"
      data-hero-media-asset-id={media.media_asset_id}
      data-hero-cutout-media-id={media.cutout_media_id}
    >
      {/* ── Background layer ── */}
      <div className={styles.bg} aria-hidden="true">
        {video ? (
          /* Video background with image fallback */
          <VideoBackground video={video} />
        ) : (
          /* Responsive image background */
          <div className={styles.bgImages}>
            {/* Small Mobile — applies at narrowest breakpoint */}
            {image.small_mobile && (
              <div className={styles.bgImageSmallMobile}>
                <Image
                  src={image.small_mobile}
                  alt=""
                  fill
                  priority
                  quality={90}
                  style={{ objectPosition: getObjectPosition("small_mobile") }}
                  className={styles.bgImg}
                  sizes="100vw"
                />
              </div>
            )}
            {/* Mobile */}
            {image.mobile && (
              <div className={styles.bgImageMobile}>
                <Image
                  src={image.mobile}
                  alt=""
                  fill
                  priority
                  quality={90}
                  style={{ objectPosition: getObjectPosition("mobile") }}
                  className={styles.bgImg}
                  sizes="100vw"
                />
              </div>
            )}
            {/* Tablet */}
            {image.tablet && (
              <div className={styles.bgImageTablet}>
                <Image
                  src={image.tablet}
                  alt=""
                  fill
                  priority
                  quality={90}
                  style={{ objectPosition: getObjectPosition("tablet") }}
                  className={styles.bgImg}
                  sizes="100vw"
                />
              </div>
            )}
            {/* Desktop */}
            {image.desktop && (
              <div className={styles.bgImageDesktop}>
                <Image
                  src={image.desktop}
                  alt=""
                  fill
                  priority
                  quality={90}
                  style={{ objectPosition: getObjectPosition("desktop") }}
                  className={styles.bgImg}
                  sizes="100vw"
                />
              </div>
            )}
            {/* Fallback placeholder when no images provided */}
            {!image.desktop && !image.mobile && (
              <div className={styles.bgPlaceholder} />
            )}
          </div>
        )}

        {/* Overlay */}
        <div
          className={styles.overlay}
          style={{ "--overlay-opacity": overlayOpacity / 100 } as React.CSSProperties}
          aria-hidden="true"
        />
      </div>

      {/* ── Typography layer ── */}
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {tagline && (
            <p className={styles.tagline}>{tagline}</p>
          )}

          <div className={styles.headingBlock}>
            <h1 className={styles.heading}>{heading}</h1>
            {subheading && (
              <p className={styles.subheading}>{subheading}</p>
            )}
          </div>

          {cta && (
            <div className={styles.cta}>{cta}</div>
          )}
        </div>
      </div>

      {/* ── Vehicle cutout layer (foreground) ── */}
      {hasCutout && (
        <div className={styles.cutout} aria-hidden="true" data-cutout-layer>
          {BREAKPOINT_ORDER.map((breakpoint) => (
            <Image
              key={breakpoint}
              src={image.cutout!}
              alt={image.alt}
              fill
              priority
              className={`${styles.cutoutImg} ${styles[`cutoutImg--${breakpoint}`]}`}
              style={getCutoutStyle(cutoutPresentationSettings, breakpoint, cutoutFocalX, cutoutFocalY, cutoutBboxHPct)}
              data-cutout-breakpoint={breakpoint}
              data-cutout-mode={resolveBreakpointSettings(cutoutPresentationSettings ?? {}, breakpoint, cutoutFocalX, cutoutFocalY).mode}
              data-cutout-position-x={resolveBreakpointSettings(cutoutPresentationSettings ?? {}, breakpoint, cutoutFocalX, cutoutFocalY).cutout.position_x}
              data-cutout-position-y={resolveBreakpointSettings(cutoutPresentationSettings ?? {}, breakpoint, cutoutFocalX, cutoutFocalY).cutout.position_y}
              data-cutout-scale={resolveBreakpointSettings(cutoutPresentationSettings ?? {}, breakpoint, cutoutFocalX, cutoutFocalY).cutout.scale}
              sizes="100vw"
            />
          ))}
        </div>
      )}

      {/* Screen-reader alt for hero image */}
      <span className="sr-only">{image.alt}</span>
    </section>
  );
}

/* ── Video Background sub-component ── */

function VideoBackground({ video }: { video: ResponsiveVideo }) {
  return (
    <div className={styles.videoBg}>
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        poster={video.poster}
        aria-hidden="true"
      >
        {video.mobile && (
          <source
            src={video.mobile}
            media="(max-width: 767px)"
            type="video/mp4"
          />
        )}
        {video.desktop && (
          <source src={video.desktop} type="video/mp4" />
        )}
      </video>
      {/* Poster fallback image */}
      <Image
        src={video.poster}
        alt={video.alt}
        fill
        priority
        className={[styles.bgImg, styles.videoPoster].join(" ")}
        sizes="100vw"
      />
    </div>
  );
}
