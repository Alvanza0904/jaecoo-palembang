/**
 * JAECOO Palembang — Layered Hero
 *
 * The public hero consumes the same PresentationSettings written by the
 * Visual Media Editor. Cutout placement uses the editor's 0–100 coordinate
 * system and breakpoint inheritance resolver; there is no independent
 * public-hero positioning system.
 */

import Image from "next/image";
import type { MediaWithArtDirection, ResponsiveVideo } from "@/lib/types/media";
import {
  BREAKPOINT_ORDER,
  resolveBreakpointSettings,
  cutoutTransformToCSS,
  type BreakpointKey,
  type PresentationSettings,
} from "@/lib/types/presentation";
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

type CutoutBreakpoint = BreakpointKey;

function getCutoutStyle(
  settings: PresentationSettings | undefined,
  breakpoint: CutoutBreakpoint,
  assetFocalX = 50,
  assetFocalY = 50,
): React.CSSProperties {
  const effective = resolveBreakpointSettings(
    settings ?? {},
    breakpoint,
    assetFocalX,
    assetFocalY,
  );
  const cutout = effective.cutout;

  return {
    objectFit: "cover",
    objectPosition: "50% 50%",
    transform: cutoutTransformToCSS(
      cutout.position_x,
      cutout.position_y,
      cutout.scale,
    ),
    transformOrigin: "50% 50%",
  };
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
  const hasCutout = !!image.cutout;
  const assetFocalX = media.focal_x ?? 50;
  const assetFocalY = media.focal_y ?? 50;
  const cutoutFocalX = media.cutout_focal_x ?? assetFocalX;
  const cutoutFocalY = media.cutout_focal_y ?? assetFocalY;

  const getObjectPosition = (breakpoint: "desktop" | "tablet" | "mobile") => {
    const dir = art_direction?.[breakpoint];
    if (!dir) return "center center";
    if (dir.mode === "custom" && dir.x && dir.y) {
      return `${dir.x} ${dir.y}`;
    }
    const fx = dir.focal_x ?? 50;
    const fy = dir.focal_y ?? 50;
    return `${fx}% ${fy}%`;
  };

  return (
    <section
      className={[
        styles.hero,
        styles[`hero--${size}`],
        lightBackground ? styles.heroLight : styles.heroDark,
      ].join(" ")}
      aria-label="Hero section"
    >
      {/* ── Background layer ── */}
      <div className={styles.bg} aria-hidden="true">
        {video ? (
          <VideoBackground video={video} />
        ) : (
          <div className={styles.bgImages}>
            {(image.small_mobile || image.mobile) && (
              <div className={styles.bgImageMobile}>
                <Image
                  src={image.small_mobile ?? image.mobile ?? image.desktop ?? ""}
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
            {!image.desktop && !image.mobile && (
              <div className={styles.bgPlaceholder} />
            )}
          </div>
        )}

        <div
          className={styles.overlay}
          style={{ "--overlay-opacity": overlayOpacity / 100 } as React.CSSProperties}
          aria-hidden="true"
        />
      </div>

      {/* ── Typography layer ── */}
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

      {/* ── Vehicle cutout layer (foreground) ── */}
      {hasCutout && (
        <div className={styles.cutout} aria-hidden="true">
          {BREAKPOINT_ORDER.map((breakpoint) => (
            <Image
              key={breakpoint}
              src={image.cutout!}
              alt={image.alt}
              fill
              priority
              className={`${styles.cutoutImg} ${styles[`cutoutImg--${breakpoint}`]}`}
              style={getCutoutStyle(
                cutoutPresentationSettings,
                breakpoint,
                cutoutFocalX,
                cutoutFocalY,
              )}
              sizes="100vw"
            />
          ))}
        </div>
      )}

      <span className="sr-only">{image.alt}</span>
    </section>
  );
}

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
