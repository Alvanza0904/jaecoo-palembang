/**
 * JAECOO Palembang — Layered Hero
 *
 * Architecture:
 *   BACKGROUND MEDIA (image/video)
 *     ↓
 *   TYPOGRAPHY LAYER (Step 6G: positioned via presentation_settings.typography)
 *     ↓
 *   VEHICLE CUTOUT (foreground — overlaps typography)
 *
 * Supports: desktop / tablet / mobile / small_mobile
 * Art direction: focal_x, focal_y, mode (auto | custom)
 * Video: muted autoplay loop with poster fallback
 *
 * Step 6G — Typography Positioning:
 *   - Reads presentation_settings.typography per breakpoint
 *   - Uses resolveBreakpointSettings() for inheritance
 *   - Typography containers positioned absolutely per breakpoint
 *   - Show/hide via CSS breakpoint classes (same pattern as cutout)
 *   - Fallback to default CSS if presentation_settings not available
 */

import Image from "next/image";
import type { MediaWithArtDirection, ResponsiveVideo } from "@/lib/types/media";
import {
  BREAKPOINT_ORDER,
  resolveBreakpointSettings,
  cutoutTransformToCSS,
  getBackgroundLayerStyle,
  type BreakpointKey,
  type PresentationSettings,
  type PresentationMeta,
  type TypographyPlacement,
  DEFAULT_BREAKPOINT_SETTINGS,
} from "@/lib/types/presentation";
import styles from "./LayeredHero.module.css";

// ── Typography helpers ──────────────────────────────────────────────────────

/**
 * Base font size in rem for the heading.
 * font_size multiplier 100 = this value.
 * Maps to --text-4xl (4rem = 64px at 16px root).
 */
const TYPOGRAPHY_BASE_REM = 4; // rem

/**
 * Subheading base font size in rem.
 * Maps to --text-lg (1.375rem).
 */
const SUBHEADING_BASE_REM = 1.375; // rem

/**
 * Resolve typography for a breakpoint from presentation_settings.
 * Falls back to DEFAULT_BREAKPOINT_SETTINGS.typography if not set.
 */
function resolveTypography(
  presentationSettings: PresentationSettings | undefined,
  breakpoint: BreakpointKey,
  focalX = 50,
  focalY = 50,
): TypographyPlacement {
  if (!presentationSettings) return DEFAULT_BREAKPOINT_SETTINGS.typography;
  const effective = resolveBreakpointSettings(
    presentationSettings,
    breakpoint,
    focalX,
    focalY,
  );
  return effective.typography;
}

/**
 * Build CSS properties for a typography container from TypographyPlacement.
 *
 * COORDINATE SEMANTICS:
 *   x = left edge of text block, as % of hero container (0 = left edge, 80 = far right)
 *   y = top edge of text block, as % of hero container (0 = top, 90 = near bottom)
 *   width = text block width as % of hero container
 *   alignment = CSS text-align
 *   font_size = multiplier (100 = base rem), applied to heading
 *   font_weight = CSS font-weight for heading
 *   letter_spacing = em units (0 = normal)
 */
function getTypographyContainerStyle(typo: TypographyPlacement): React.CSSProperties {
  return {
    position: "absolute",
    left: `${typo.x}%`,
    top: `${typo.y}%`,
    width: `${typo.width}%`,
    textAlign: typo.alignment,
  };
}

function getHeadingTypographyStyle(typo: TypographyPlacement): React.CSSProperties {
  const fontSizeRem = (TYPOGRAPHY_BASE_REM * typo.font_size) / 100;
  return {
    fontSize: `${fontSizeRem}rem`,
    fontWeight: typo.font_weight,
    letterSpacing: `${typo.letter_spacing}em`,
    lineHeight: 1.1,
  };
}

function getSubheadingTypographyStyle(typo: TypographyPlacement): React.CSSProperties {
  // Subheading scales at half the rate of the heading multiplier, clamped to readable range
  const subMult = Math.max(70, Math.min(typo.font_size, 130));
  const fontSizeRem = (SUBHEADING_BASE_REM * subMult) / 100;
  return {
    fontSize: `${fontSizeRem}rem`,
    fontWeight: typo.font_weight >= 600 ? Math.max(400, typo.font_weight - 100) : typo.font_weight,
    letterSpacing: typo.letter_spacing !== 0 ? `${typo.letter_spacing * 0.5}em` : undefined,
    lineHeight: 1.4,
  };
}

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
  const getBackgroundStyle = (breakpoint: BreakpointKey): React.CSSProperties => {
    if (presentationSettings) {
      return getBackgroundLayerStyle(
        presentationSettings,
        breakpoint,
        media.focal_x ?? 50,
        media.focal_y ?? 50,
      )
    }

    const dir = art_direction?.[breakpoint]
    if (!dir) {
      return {
        objectFit: 'cover',
        objectPosition: '50% 50%',
        transform: 'scale(1)',
        transformOrigin: '50% 50%',
      }
    }

    const x = dir.mode === 'custom' && dir.x ? dir.x : `${dir.focal_x ?? 50}%`
    const y = dir.mode === 'custom' && dir.y ? dir.y : `${dir.focal_y ?? 50}%`
    const scale = typeof dir.scale === 'number' && dir.scale > 0 ? dir.scale : 100
    const objectPosition = `${x} ${y}`
    return {
      objectFit: 'cover',
      objectPosition,
      transform: `scale(${scale / 100})`,
      transformOrigin: objectPosition,
    }
  }

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
                  style={getBackgroundStyle("small_mobile")}
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
                  style={getBackgroundStyle("mobile")}
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
                  style={getBackgroundStyle("tablet")}
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
                  style={getBackgroundStyle("desktop")}
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
      {/*
        Step 6G: When presentation_settings.typography is available, render
        per-breakpoint absolutely-positioned containers. Each breakpoint's
        container is shown/hidden via CSS media queries (same pattern as cutout).
        When presentation_settings is NOT available, fall back to the default
        flow-layout content block so the page never goes blank.
      */}
      {presentationSettings ? (
        /* Positioned typography — reads from presentation_settings per breakpoint */
        <div className={styles.typographyLayer} aria-hidden="false">
          {BREAKPOINT_ORDER.map((breakpoint) => {
            const typo = resolveTypography(
              presentationSettings,
              breakpoint,
              media.focal_x ?? 50,
              media.focal_y ?? 50,
            );
            return (
              <div
                key={breakpoint}
                className={`${styles.typographyContainer} ${styles[`typographyContainer--${breakpoint}`]}`}
                style={getTypographyContainerStyle(typo)}
              >
                {tagline && (
                  <p className={styles.tagline}>{tagline}</p>
                )}
                <div className={styles.headingBlock}>
                  <h1
                    className={styles.heading}
                    style={getHeadingTypographyStyle(typo)}
                  >
                    {heading}
                  </h1>
                  {subheading && (
                    <p
                      className={styles.subheading}
                      style={getSubheadingTypographyStyle(typo)}
                    >
                      {subheading}
                    </p>
                  )}
                </div>
                {cta && (
                  <div className={styles.cta}>{cta}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback: default flow-layout content block (no presentation_settings) */
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
      )}

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
