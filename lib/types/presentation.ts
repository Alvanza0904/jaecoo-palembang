/**
 * JAECOO Palembang — Presentation Settings Types
 * STEP 5E: Visual Media Editor
 * STEP 6H: Unified rendering helpers — single source of truth for
 *           Editor Preview AND Public Hero geometry calculations.
 * STEP 6I: Typography fix — correct preview font scaling + font_family support.
 *
 * ALL geometry/typography calculations live here.
 * LayeredHero.tsx and VisualMediaEditor.tsx both import from this file.
 * There must be NO duplicate formulas in consumer files.
 */

export type BreakpointKey = 'desktop' | 'tablet' | 'mobile' | 'small_mobile'
export type PresentationMode = 'auto' | 'custom' | 'inherited'
export type ObjectFit = 'cover' | 'contain'
export type InheritSource = 'desktop' | 'tablet' | 'mobile' | null

/**
 * Curated premium automotive font families.
 * All are available via next/font/google with variable weights.
 * Only geometric/grotesque/humanist sans — no decorative or serif.
 */
export type TypographyFontFamily =
  | 'Manrope'
  | 'Montserrat'
  | 'Outfit'
  | 'Plus Jakarta Sans'
  | 'Space Grotesk'
  | 'IBM Plex Sans'
  | 'Exo 2'

/** Default font family — matches the site's global --font-sans */
export const TYPOGRAPHY_DEFAULT_FONT: TypographyFontFamily = 'Manrope'

/** All available font choices for the typography dropdown */
export const TYPOGRAPHY_FONT_OPTIONS: TypographyFontFamily[] = [
  'Manrope',
  'Montserrat',
  'Outfit',
  'Plus Jakarta Sans',
  'Space Grotesk',
  'IBM Plex Sans',
  'Exo 2',
]

/**
 * Typography placement readiness.
 * STEP 6I: Added font_family field (optional, backwards-compatible).
 */
export interface TypographyPlacement {
  /** Horizontal position 0–100 */
  x: number
  /** Vertical position 0–100 */
  y: number
  /** Text block width as % of container */
  width: number
  /** Text alignment */
  alignment: 'left' | 'center' | 'right'
  /** Font size multiplier (100 = base) */
  font_size: number
  /** Font weight */
  font_weight: number
  /** Letter spacing in em (0 = normal) */
  letter_spacing: number
  /**
   * Font family — optional for backwards compatibility.
   * Defaults to TYPOGRAPHY_DEFAULT_FONT ('Manrope') when absent.
   */
  font_family?: TypographyFontFamily
}

/**
 * Cutout positioning per breakpoint.
 */
export interface CutoutPlacement {
  /** Horizontal position 0–100 */
  position_x: number
  /** Vertical position 0–100 */
  position_y: number
  /** Scale % (100 = original) */
  scale: number
}

/**
 * Per-breakpoint presentation settings.
 */
export interface BreakpointSettings {
  mode: PresentationMode
  inherit_from?: InheritSource
  position_x: number
  position_y: number
  scale: number
  object_fit: ObjectFit
  focal_x: number
  focal_y: number
  cutout: CutoutPlacement
  typography: TypographyPlacement
}

/**
 * STEP 5F: Cutout bounding box metadata.
 */
export interface PresentationMeta {
  cutout_bbox?: {
    x_pct: number
    y_pct: number
    w_pct: number
    h_pct: number
  }
  bbox_computed_at?: string
  bbox_anomaly?: boolean
  bbox_anomaly_reason?: string
}

/**
 * Full presentation settings object stored in media_assets.presentation_settings
 */
export interface PresentationSettings {
  _meta?: PresentationMeta
  desktop?: Partial<BreakpointSettings>
  tablet?: Partial<BreakpointSettings>
  mobile?: Partial<BreakpointSettings>
  small_mobile?: Partial<BreakpointSettings>
}

// ─── Typography Constants (SINGLE SOURCE OF TRUTH) ────────────────────────
//
// These values define the Live Hero typography scale.
// Editor Preview uses these exact same constants — no duplication.
//
// Live Hero: heading font-size = (TYPOGRAPHY_BASE_REM × font_size/100) rem
//            at root 16px  →  100% = 4rem = 64px
//
// Live Hero: subheading font-size = (SUBHEADING_BASE_REM × subMult/100) rem
//            subMult = clamp(70, font_size, 130)
//            at root 16px  →  100% ≈ 1.375rem ≈ 22px

/** Heading base font-size in rem. 100% multiplier → 4rem = 64px at 16px root. */
export const TYPOGRAPHY_BASE_REM = 4

/** Subheading base font-size in rem. Maps to --text-lg = 1.375rem. */
export const SUBHEADING_BASE_REM = 1.375

/**
 * Canonical aspect ratios for each breakpoint preview canvas.
 * These define the W:H ratio of the preview container in the editor.
 */
export const BREAKPOINT_ASPECT_RATIO: Record<BreakpointKey, number> = {
  desktop:      16 / 9,
  tablet:       4 / 3,
  mobile:       9 / 16,
  small_mobile: 9 / 18,
}

/**
 * Design coordinate width used ONLY by the Editor typography miniature.
 *
 * This is not a device-width assumption and is not used by the Public Hero.
 * The Editor renders the real Hero typography at this coordinate width and
 * scales the whole coordinate space down to its preview canvas.
 */
export const BREAKPOINT_DESIGN_WIDTH: Record<BreakpointKey, number> = {
  desktop:      1440,
  tablet:        768,
  mobile:        390,
  small_mobile:  375,
}

/** Preview container dimensions (px) — used for sizing only, ratio is canonical above. */
export const BREAKPOINT_PREVIEW_DIMS: Record<BreakpointKey, { width: number; height: number }> = {
  desktop:      { width: 320, height: 180 },
  tablet:       { width: 240, height: 180 },
  mobile:       { width: 160, height: 284 },  // STEP 6I: fixed 160/(9/16)=284 (was 240)
  small_mobile: { width: 130, height: 260 },  // STEP 6I: fixed 130/(9/18)=260 (was 220)
}

/** Default auto settings per breakpoint */
export const DEFAULT_BREAKPOINT_SETTINGS: BreakpointSettings = {
  mode: 'auto',
  inherit_from: null,
  position_x: 50,
  position_y: 50,
  scale: 100,
  object_fit: 'cover',
  focal_x: 50,
  focal_y: 50,
  cutout: {
    position_x: 50,
    position_y: 50,
    scale: 100,
  },
  typography: {
    x: 8,
    y: 50,
    width: 44,
    alignment: 'left',
    font_size: 100,
    font_weight: 700,
    letter_spacing: 0,
    font_family: TYPOGRAPHY_DEFAULT_FONT,
  },
}

/** Default inherit sources for each breakpoint */
export const BREAKPOINT_INHERIT_DEFAULTS: Record<BreakpointKey, InheritSource> = {
  desktop: null,
  tablet: 'desktop',
  mobile: null,
  small_mobile: 'mobile',
}

/** Display labels */
export const BREAKPOINT_LABELS: Record<BreakpointKey, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
  small_mobile: 'Small Mobile',
}

/** All breakpoints in display order */
export const BREAKPOINT_ORDER: BreakpointKey[] = ['desktop', 'tablet', 'mobile', 'small_mobile']

// ─── AUTO mode fill targets ───────────────────────────────────────────────

export const BREAKPOINT_AUTO_FILL_TARGET: Record<BreakpointKey, number> = {
  desktop:      0.70,
  tablet:       0.80,
  mobile:       0.90,
  small_mobile: 0.95,
}

export function computeAutoScale(bboxHPct: number, breakpoint: BreakpointKey): number {
  if (!bboxHPct || bboxHPct <= 0) return 100
  const fillTarget = BREAKPOINT_AUTO_FILL_TARGET[breakpoint]
  const scale = Math.round((fillTarget / (bboxHPct / 100)) * 100)
  return Math.max(50, Math.min(400, scale))
}

// ─── Breakpoint resolver ─────────────────────────────────────────────────

export function resolveBreakpointSettings(
  settings: PresentationSettings,
  key: BreakpointKey,
  assetFocalX = 50,
  assetFocalY = 50,
  cutoutBboxHPct?: number,
): BreakpointSettings {
  const raw = settings[key] ?? {}
  const mode: PresentationMode = raw.mode ?? 'auto'

  if (mode === 'inherited' && raw.inherit_from) {
    const parent = resolveBreakpointSettings(settings, raw.inherit_from, assetFocalX, assetFocalY)
    return { ...parent, mode: 'inherited', inherit_from: raw.inherit_from }
  }

  if (mode === 'auto') {
    const autoScale = cutoutBboxHPct && cutoutBboxHPct > 0
      ? computeAutoScale(cutoutBboxHPct, key)
      : DEFAULT_BREAKPOINT_SETTINGS.cutout.scale
    return {
      ...DEFAULT_BREAKPOINT_SETTINGS,
      focal_x: assetFocalX,
      focal_y: assetFocalY,
      position_x: assetFocalX,
      position_y: assetFocalY,
      mode: 'auto',
      cutout: {
        ...DEFAULT_BREAKPOINT_SETTINGS.cutout,
        scale: autoScale,
      },
    }
  }

  // custom — merge with defaults
  return {
    ...DEFAULT_BREAKPOINT_SETTINGS,
    focal_x: assetFocalX,
    focal_y: assetFocalY,
    ...raw,
    mode: 'custom',
    cutout: {
      ...DEFAULT_BREAKPOINT_SETTINGS.cutout,
      ...(raw.cutout ?? {}),
    },
    typography: {
      ...DEFAULT_BREAKPOINT_SETTINGS.typography,
      ...(raw.typography ?? {}),
    },
  }
}

// ─── Background rendering (shared: Live + Editor) ─────────────────────────

export interface PresentationLayerStyle {
  objectFit: ObjectFit
  objectPosition: string
  transform: string
  transformOrigin: string
}

/**
 * Compute background CSS style from presentation settings.
 * Used by BOTH LayeredHero (Live) and VisualMediaEditor (Preview).
 * Single source of truth — no duplication.
 */
export function getBackgroundLayerStyle(
  settings: PresentationSettings,
  breakpoint: BreakpointKey,
  focalX = 50,
  focalY = 50,
): PresentationLayerStyle {
  const effective = resolveBreakpointSettings(settings, breakpoint, focalX, focalY)
  const objectPosition = `${effective.position_x}% ${effective.position_y}%`
  return {
    objectFit: effective.object_fit,
    objectPosition,
    transform: `scale(${effective.scale / 100})`,
    transformOrigin: objectPosition,
  }
}

/**
 * Compute background CSS style from already-resolved BreakpointSettings.
 * Use this when settings are already resolved (editor has effectiveSettings).
 * Avoids double-resolving.
 */
export function getBackgroundStyleFromResolved(
  effective: BreakpointSettings,
): PresentationLayerStyle {
  const objectPosition = `${effective.position_x}% ${effective.position_y}%`
  return {
    objectFit: effective.object_fit,
    objectPosition,
    transform: `scale(${effective.scale / 100})`,
    transformOrigin: objectPosition,
  }
}

// ─── Cutout rendering (shared: Live + Editor) ─────────────────────────────

/**
 * Convert 0–100 Cutout coordinates to CSS transform.
 * Used by BOTH LayeredHero (Live) and VisualMediaEditor (Preview).
 */
export function cutoutTransformToCSS(
  positionX: number,
  positionY: number,
  scale: number,
): string {
  const safeScale = scale > 0 ? scale / 100 : 1
  const tX = positionX - 50
  const tY = positionY - 50
  return `translate(${tX}%, ${tY}%) scale(${safeScale})`
}

/**
 * Compute cutout CSS style from already-resolved CutoutPlacement.
 * Used by BOTH LayeredHero and VisualMediaEditor.
 */
export function getCutoutLayerStyle(cutout: CutoutPlacement): PresentationLayerStyle {
  return {
    objectFit: 'contain',
    objectPosition: '50% 50%',
    transform: cutoutTransformToCSS(cutout.position_x, cutout.position_y, cutout.scale),
    transformOrigin: '50% 50%',
  }
}

// ─── Typography rendering (shared: Live + Editor) ─────────────────────────

export interface TypographyHeadingStyle {
  fontSize: string
  fontWeight: number
  letterSpacing: string
  lineHeight: number
  fontFamily: string
}

export interface TypographySubheadingStyle {
  fontSize: string
  fontWeight: number
  letterSpacing?: string
  lineHeight: number
  fontFamily: string
}

export interface TypographyContainerStyle {
  position: 'absolute'
  left: string
  top: string
  width: string
  textAlign: 'left' | 'center' | 'right'
}

/**
 * Resolve the effective font family, falling back to the site default.
 * Used by both Live and Editor.
 */
export function resolveTypographyFontFamily(typo: TypographyPlacement): string {
  return typo.font_family ?? TYPOGRAPHY_DEFAULT_FONT
}

/**
 * Compute heading font-size in rem from font_size multiplier.
 * 100 = TYPOGRAPHY_BASE_REM rem = 4rem = 64px at 16px root.
 * Used by BOTH Live and Editor.
 */
export function getHeadingFontSizeRem(font_size: number): number {
  return (TYPOGRAPHY_BASE_REM * font_size) / 100
}

/**
 * Compute subheading font-size in rem.
 * subMult is clamped to [70, 130] to keep subheading readable.
 * Used by BOTH Live and Editor.
 */
export function getSubheadingFontSizeRem(font_size: number): number {
  const subMult = Math.max(70, Math.min(font_size, 130))
  return (SUBHEADING_BASE_REM * subMult) / 100
}

/**
 * Heading CSS style from TypographyPlacement.
 * fontSize is in rem — identical in Live and Editor (browser resolves rem against root).
 * STEP 6I: includes fontFamily from typo.font_family.
 * Used by LayeredHero (Live).
 */
export function getHeadingStyle(typo: TypographyPlacement): TypographyHeadingStyle {
  return {
    fontSize: `${getHeadingFontSizeRem(typo.font_size)}rem`,
    fontWeight: typo.font_weight,
    letterSpacing: `${typo.letter_spacing}em`,
    lineHeight: 1.1,
    fontFamily: `'${resolveTypographyFontFamily(typo)}', var(--font-sans, 'Manrope', sans-serif)`,
  }
}

/**
 * Subheading CSS style from TypographyPlacement.
 * STEP 6I: includes fontFamily from typo.font_family.
 * Used by LayeredHero (Live).
 */
export function getSubheadingStyle(typo: TypographyPlacement): TypographySubheadingStyle {
  return {
    fontSize: `${getSubheadingFontSizeRem(typo.font_size)}rem`,
    fontWeight: typo.font_weight >= 600 ? Math.max(400, typo.font_weight - 100) : typo.font_weight,
    letterSpacing: typo.letter_spacing !== 0 ? `${typo.letter_spacing * 0.5}em` : undefined,
    lineHeight: 1.4,
    fontFamily: `'${resolveTypographyFontFamily(typo)}', var(--font-sans, 'Manrope', sans-serif)`,
  }
}

/**
 * Typography container positioning.
 * Identical for Live and Editor (% values are coordinate-system agnostic).
 */
export function getTypographyContainerStyle(typo: TypographyPlacement): TypographyContainerStyle {
  return {
    position: 'absolute',
    left: `${typo.x}%`,
    top: `${typo.y}%`,
    width: `${typo.width}%`,
    textAlign: typo.alignment,
  }
}

/**
 * Typography preview coordinate space.
 *
 * IMPORTANT: the editor does NOT recalculate typography into a second
 * font-size system. The preview creates a miniature Hero coordinate space
 * at the breakpoint design width, renders the exact same Hero typography CSS
 * inside it, then scales that whole coordinate space down to the editor canvas.
 *
 * This preserves browser text metrics, wrapping, line-height, letter-spacing,
 * font family, and the exact heading/subheading DOM flow used by LayeredHero.
 */
export function getTypographyPreviewCoordinateSpace(
  breakpoint: BreakpointKey,
): { width: number; height: number } {
  const width = BREAKPOINT_DESIGN_WIDTH[breakpoint]
  const height = width / BREAKPOINT_ASPECT_RATIO[breakpoint]
  return { width, height }
}

export function getTypographyPreviewScale(
  breakpoint: BreakpointKey,
  previewWidth: number,
): number {
  const { width } = getTypographyPreviewCoordinateSpace(breakpoint)
  return previewWidth / width
}

// Legacy preview font helpers are kept for compatibility with any external
// consumers, but the VisualMediaEditor no longer uses them for rendering.
// Rendering through a scaled coordinate space is the canonical preview path.
export function getHeadingFontSizePxForPreview(
  typo: TypographyPlacement,
  previewW: number,
  _previewH: number,
  breakpoint: BreakpointKey,
): number {
  const liveFontPx = getHeadingFontSizeRem(typo.font_size) * 16
  const { width } = getTypographyPreviewCoordinateSpace(breakpoint)
  return liveFontPx * (previewW / width)
}

export function getSubheadingFontSizePxForPreview(
  typo: TypographyPlacement,
  previewW: number,
  _previewH: number,
  breakpoint: BreakpointKey,
): number {
  const liveFontPx = getSubheadingFontSizeRem(typo.font_size) * 16
  const { width } = getTypographyPreviewCoordinateSpace(breakpoint)
  return liveFontPx * (previewW / width)
}

// ─── CTA safe area ────────────────────────────────────────────────────────

/**
 * CTA safe area height as a fraction of canvas height.
 * Matches ctaLayer in LayeredHero.module.css.
 */
export const CTA_SAFE_AREA_FRACTION = 0.18

// ─── Legacy helpers (kept for compatibility) ──────────────────────────────

export function positionToCSS(x: number, y: number): string {
  return `${x}% ${y}%`
}

export function scaleToCSS(scale: number): string {
  return `scale(${scale / 100})`
}
