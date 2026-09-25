/**
 * JAECOO Palembang — Layered Hero
 *
 * Architecture:
 *   BACKGROUND MEDIA (image/video)
 *     ↓
 *   TYPOGRAPHY LAYER (Step 6G: positioned via presentation_settings.typography)
 *     ↓
 *   VEHICLE CUTOUT (foreground — overlaps typography)
 *     ↓
 *   CTA LAYER (Step 6G: fixed bottom, independent of typography)
 *
 * Step 6H — Single Source of Truth:
 *   ALL geometry calculations come from presentation.ts helpers.
 *   VisualMediaEditor uses the SAME helpers — no duplicate formulas.
 *
 * Supports: desktop / tablet / mobile / small_mobile
 */

import Image from "next/image";
import type { MediaWithArtDirection, ResponsiveVideo } from "@/lib/types/media";
import { CmsVideo } from "@/components/media/CmsVideo";
import { isVideoSource, readVideoSettings } from "@/lib/types/video";
import {
  BREAKPOINT_ORDER,
  resolveBreakpointSettings,
  getBackgroundLayerStyle,
  getCutoutLayerStyle,
  getTypographyContainerStyle,
  getHeadingStyle,
  getSubheadingStyle,
  type BreakpointKey,
  type PresentationSettings,
  type PresentationMeta,
  type TypographyPlacement,
  DEFAULT_BREAKPOINT_SETTINGS,
} from "@/lib/types/presentation";
import styles from "./LayeredHero.module.css";

// ── Typography helpers ──────────────────────────────────────────────────────

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
  const presentationSettings = media.presentation_settings ?? image.presentation_settings;
  const mobilePresentation = image.presentation_settings_mobile;
  const cutoutPresentationSettings =
    media.cutout_presentation_settings ??
    image.cutout_presentation_settings ??
    presentationSettings;
  const focalX = media.focal_x ?? image.focal_x ?? 50;
  const focalY = media.focal_y ?? image.focal_y ?? 50;
  const cutoutFocalX = media.cutout_focal_x ?? image.cutout_focal_x ?? focalX;
  const cutoutFocalY = media.cutout_focal_y ?? image.cutout_focal_y ?? focalY;

  const settingsFor = (breakpoint: BreakpointKey): PresentationSettings | undefined => {
    if ((breakpoint === "mobile" || breakpoint === "small_mobile") && mobilePresentation) {
      return mobilePresentation;
    }
    return presentationSettings;
  };

  // Background style — uses getBackgroundLayerStyle() shared helper from presentation.ts
  const getBackgroundStyle = (breakpoint: BreakpointKey): React.CSSProperties => {
    const settings = settingsFor(breakpoint);
    if (settings) {
      return getBackgroundLayerStyle(settings, breakpoint, focalX, focalY);
    }

    // Legacy fallback for assets without presentation_settings
    const dir = art_direction?.[breakpoint];
    if (!dir) {
      return {
        objectFit: "cover",
        objectPosition: "50% 50%",
        transform: "scale(1)",
        transformOrigin: "50% 50%",
      };
    }
    const x = dir.mode === "custom" && dir.x ? dir.x : `${dir.focal_x ?? 50}%`;
    const y = dir.mode === "custom" && dir.y ? dir.y : `${dir.focal_y ?? 50}%`;
    const scale = typeof dir.scale === "number" && dir.scale > 0 ? dir.scale : 100;
    const objectPosition = `${x} ${y}`;
    return {
      objectFit: "cover",
      objectPosition,
      transform: `scale(${scale / 100})`,
      transformOrigin: objectPosition,
    };
  };

  // Cutout bbox for auto-scale
  const cutoutMeta = (cutoutPresentationSettings as (PresentationSettings & { _meta?: PresentationMeta }) | undefined)?._meta;
  const cutoutBboxHPct = cutoutMeta?.cutout_bbox?.h_pct;

  const hasCutout = !!image.cutout && !isVideoSource(image.mime_type, image.desktop);
  const playback = readVideoSettings(presentationSettings);
  const assetIsVideo = isVideoSource(image.mime_type, image.desktop || image.mobile);

  function cutoutVars(): React.CSSProperties {
    const styleFor = (breakpoint: BreakpointKey) => {
      const effective = resolveBreakpointSettings(
        cutoutPresentationSettings ?? {},
        breakpoint,
        cutoutFocalX,
        cutoutFocalY,
        cutoutBboxHPct,
      );
      return getCutoutLayerStyle(effective.cutout);
    };
    return {
      "--cutout-transform": styleFor("mobile").transform,
      "--cutout-sm-transform": styleFor("small_mobile").transform,
      "--cutout-tablet-transform": styleFor("tablet").transform,
      "--cutout-desktop-transform": styleFor("desktop").transform,
    } as React.CSSProperties;
  }

  return (
    <section
      className={[
        styles.hero,
        styles[`hero--${size}`],
        lightBackground ? styles.heroLight : styles.heroDark,
      ].join(" ")}
      data-contrast={lightBackground ? "light" : "dark"}
      aria-label="Hero section"
      data-hero-media-asset-id={media.media_asset_id}
      data-hero-cutout-media-id={media.cutout_media_id}
    >
      {/* ── Background layer ── */}
      <div className={styles.bg} aria-hidden="true">
        {assetIsVideo ? (
          <CmsVideo
            src={image.desktop || image.mobile}
            poster={image.poster || playback.poster_url}
            settings={playback}
            priority
            label={image.alt}
            className={styles.videoFill}
          />
        ) : video ? (
          <VideoBackground video={video} />
        ) : (
          <picture className={styles.bgPicture}>
            {image.desktop && (
              <source media="(min-width: 1024px)" srcSet={image.desktop} />
            )}
            {image.tablet && (
              <source media="(min-width: 768px)" srcSet={image.tablet} />
            )}
            {image.small_mobile && image.small_mobile !== (image.mobile || image.desktop) && (
              <source media="(max-width: 389px)" srcSet={image.small_mobile} />
            )}
            {/* One request. Breakpoint crop still comes from presentation_settings. */}
            <img
              src={image.mobile || image.tablet || image.desktop || ""}
              alt=""
              className={`${styles.bgImg} ${styles.bgPictureImg}`}
              fetchPriority="high"
              decoding="async"
              style={{
                "--hero-fit": getBackgroundStyle("mobile").objectFit,
                "--hero-pos": getBackgroundStyle("mobile").objectPosition,
                "--hero-transform": getBackgroundStyle("mobile").transform,
                "--hero-origin": getBackgroundStyle("mobile").transformOrigin,
                "--hero-sm-fit": getBackgroundStyle("small_mobile").objectFit,
                "--hero-sm-pos": getBackgroundStyle("small_mobile").objectPosition,
                "--hero-sm-transform": getBackgroundStyle("small_mobile").transform,
                "--hero-sm-origin": getBackgroundStyle("small_mobile").transformOrigin,
                "--hero-tablet-fit": getBackgroundStyle("tablet").objectFit,
                "--hero-tablet-pos": getBackgroundStyle("tablet").objectPosition,
                "--hero-tablet-transform": getBackgroundStyle("tablet").transform,
                "--hero-tablet-origin": getBackgroundStyle("tablet").transformOrigin,
                "--hero-desktop-fit": getBackgroundStyle("desktop").objectFit,
                "--hero-desktop-pos": getBackgroundStyle("desktop").objectPosition,
                "--hero-desktop-transform": getBackgroundStyle("desktop").transform,
                "--hero-desktop-origin": getBackgroundStyle("desktop").transformOrigin,
              } as React.CSSProperties}
            />
          </picture>
        )}
        <div
          className={styles.overlay}
          style={{ "--overlay-opacity": overlayOpacity / 100 } as React.CSSProperties}
          aria-hidden="true"
        />
      </div>

      {/* ── Typography layer ── */}
      {(presentationSettings || mobilePresentation) ? (
        <>
          <div className={styles.typographyLayer} aria-hidden="false">
            {BREAKPOINT_ORDER.map((breakpoint) => {
              const typo = resolveTypography(
                settingsFor(breakpoint) ?? {},
                breakpoint,
                focalX,
                focalY,
              );
              // Uses shared helpers from presentation.ts — same as Editor Preview
              return (
                <div
                  key={breakpoint}
                  className={`${styles.typographyContainer} ${styles[`typographyContainer--${breakpoint}`]}`}
                  style={getTypographyContainerStyle(typo)}
                >
                  {tagline && <p className={styles.tagline}>{tagline}</p>}
                  <div className={styles.headingBlock}>
                    <h1 className={styles.heading} style={getHeadingStyle(typo)}>
                      {heading}
                    </h1>
                    {subheading && (
                      <p className={styles.subheading} style={getSubheadingStyle(typo)}>
                        {subheading}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* ── CTA layer — fixed bottom, independent of typography position ── */}
          {cta && (
            <div className={styles.ctaLayer} aria-label="Hero call to action">
              <div className={styles.ctaInner}>{cta}</div>
            </div>
          )}
        </>
      ) : (
        /* Fallback: default flow-layout (no presentation_settings) */
        <div className={styles.content}>
          <div className={styles.contentInner}>
            {tagline && <p className={styles.tagline}>{tagline}</p>}
            <div className={styles.headingBlock}>
              <h1 className={styles.heading}>{heading}</h1>
              {subheading && <p className={styles.subheading}>{subheading}</p>}
            </div>
            {cta && <div className={styles.cta}>{cta}</div>}
          </div>
        </div>
      )}

      {/* ── Vehicle cutout layer (foreground) ── */}
      {hasCutout && (
        <div className={styles.cutout} aria-hidden="true" data-cutout-layer>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.cutout}
            alt={image.alt}
            className={styles.cutoutSingle}
            decoding="async"
            style={cutoutVars()}
          />
        </div>
      )}

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
        preload="metadata"
        aria-hidden="true"
      >
        {video.mobile && (
          <source src={video.mobile} media="(max-width: 767px)" type="video/mp4" />
        )}
        {video.desktop && <source src={video.desktop} type="video/mp4" />}
      </video>
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
