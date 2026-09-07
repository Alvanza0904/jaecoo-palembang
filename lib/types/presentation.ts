/**
 * JAECOO Palembang — Presentation Settings Types
 * STEP 5E: Visual Media Editor
 *
 * Defines per-breakpoint visual presentation data for media assets.
 * Used by the Visual Media Editor and consumed by Hero/section renderers.
 */

export type BreakpointKey = 'desktop' | 'tablet' | 'mobile' | 'small_mobile'
export type PresentationMode = 'auto' | 'custom' | 'inherited'
export type ObjectFit = 'cover' | 'contain'
export type InheritSource = 'desktop' | 'tablet' | 'mobile' | null

/**
 * Typography placement readiness.
 * Values are stored but not yet used for rendering — Hero Editor (next step).
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
}

/**
 * Cutout positioning per breakpoint.
 * Used when media has a vehicle cutout (transparent PNG/WebP).
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
  /** 
   * auto: system defaults based on focal point
   * custom: admin-defined overrides
   * inherited: copies from a parent breakpoint
   */
  mode: PresentationMode

  /** Which breakpoint to inherit from (only used when mode = 'inherited') */
  inherit_from?: InheritSource

  /** Horizontal position 0–100 (maps to object-position X%) */
  position_x: number

  /** Vertical position 0–100 (maps to object-position Y%) */
  position_y: number

  /** Scale % — 100 = default, 110 = 10% zoom in */
  scale: number

  /** CSS object-fit */
  object_fit: ObjectFit

  /** Focal point X 0–100 — used by 'auto' mode */
  focal_x: number

  /** Focal point Y 0–100 — used by 'auto' mode */
  focal_y: number

  /** Cutout positioning (only relevant if asset has cutout_url) */
  cutout: CutoutPlacement

  /** Typography placement readiness (for Hero Editor next step) */
  typography: TypographyPlacement
}

/**
 * STEP 5F: Cutout bounding box metadata.
 * Stored under _meta key in PresentationSettings.
 * Computed client-side once per asset via Canvas API alpha scan.
 */
export interface PresentationMeta {
  cutout_bbox?: {
    /** Left edge of vehicle, as % of cutout canvas width */
    x_pct: number
    /** Top edge of vehicle, as % of cutout canvas height */
    y_pct: number
    /** Vehicle width, as % of cutout canvas width */
    w_pct: number
    /** Vehicle height, as % of cutout canvas height */
    h_pct: number
  }
  /** ISO timestamp when bbox was last computed */
  bbox_computed_at?: string
  /** True if bbox indicates a processing anomaly */
  bbox_anomaly?: boolean
  /** Description of anomaly if present */
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

/** Preview container dimensions (px) */
export const BREAKPOINT_PREVIEW_DIMS: Record<BreakpointKey, { width: number; height: number }> = {
  desktop:      { width: 320, height: 180 },  // 16:9 landscape
  tablet:       { width: 240, height: 180 },  // 4:3
  mobile:       { width: 160, height: 240 },  // 9:16 portrait
  small_mobile: { width: 130, height: 220 },  // narrow portrait
}

/**
 * AUTO mode: target fill ratio for the vehicle per breakpoint.
 * Defines how much of the hero height the vehicle should fill.
 * These are tuned so the car looks "right-sized" at each breakpoint
 * without manual adjustment.
 *
 * desktop: vehicle fills ~70% of hero height (dramatic, wide canvas)
 * tablet:  vehicle fills ~80% (slightly tighter)
 * mobile:  vehicle fills ~90% (portrait — more vertical space)
 * small_mobile: vehicle fills ~95% (very tight portrait)
 */
export const BREAKPOINT_AUTO_FILL_TARGET: Record<BreakpointKey, number> = {
  desktop:      0.70,
  tablet:       0.80,
  mobile:       0.90,
  small_mobile: 0.95,
}

/**
 * Compute the AUTO scale % for a cutout based on its bbox and the target
 * breakpoint. Returns a scale value (100 = image natural size) such that
 * the vehicle occupies approximately BREAKPOINT_AUTO_FILL_TARGET of the
 * hero height.
 *
 * @param bboxHPct   - vehicle height as % of cutout canvas (from cutout_bbox.h_pct)
 * @param breakpoint - target breakpoint
 * @returns scale as integer percentage (e.g. 140 = 140%)
 */
export function computeAutoScale(bboxHPct: number, breakpoint: BreakpointKey): number {
  if (!bboxHPct || bboxHPct <= 0) return 100
  const fillTarget = BREAKPOINT_AUTO_FILL_TARGET[breakpoint]
  // cutout canvas fills the hero (100% height). vehicle occupies bboxHPct% of that.
  // We want vehicle to fill fillTarget of hero height.
  // So: scale = fillTarget / (bboxHPct / 100)
  const scale = Math.round((fillTarget / (bboxHPct / 100)) * 100)
  // Clamp to reasonable range
  return Math.max(50, Math.min(400, scale))
}

/** All breakpoints in display order */
export const BREAKPOINT_ORDER: BreakpointKey[] = ['desktop', 'tablet', 'mobile', 'small_mobile']

/**
 * Resolve effective settings for a breakpoint.
 * Handles inheritance chain: inherited → parent → auto defaults.
 */
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
    // Resolve from parent
    const parent = resolveBreakpointSettings(settings, raw.inherit_from, assetFocalX, assetFocalY)
    return { ...parent, mode: 'inherited', inherit_from: raw.inherit_from }
  }

  if (mode === 'auto') {
    // Compute auto-scale from bbox if available so vehicle fills the frame naturally
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

/**
 * Convert presentation settings position (0–100) to CSS object-position string.
 */
export function positionToCSS(x: number, y: number): string {
  return `${x}% ${y}%`
}

/**
 * Convert scale % to CSS transform.
 */
export function scaleToCSS(scale: number): string {
  return `scale(${scale / 100})`
}

/**
 * Convert 0–100 Cutout coordinates to CSS transform for LayeredHero and
 * VisualMediaEditor canvas.
 *
 * COORDINATE SYSTEM:
 *   - 50/50 = neutral center (no movement)
 *   - 0/0   = move cutout to top-left corner
 *   - 100/100 = move cutout to bottom-right corner
 *
 * IMPLEMENTATION:
 *   We apply scale() first from center (50% 50%), then translate using
 *   percentage units. CSS translate(X%, Y%) references the element's own
 *   size — since the cutout element fills the hero (100vw / 100vh approx),
 *   each 1% ≈ 1% of hero width/height.
 *
 *   Neutral offset = 50 (maps to 0% shift).
 *   Max range: -50% to +50% from center.
 *
 *   translateX = (positionX - 50)%  →  range -50% to +50%
 *   translateY = (positionY - 50)%  →  range -50% to +50%
 *
 *   Scale is applied AFTER translate so the position is scale-independent
 *   (translate first, then scale from center).
 */
export function cutoutTransformToCSS(
  positionX: number,
  positionY: number,
  scale: number,
): string {
  const safeScale = scale > 0 ? scale / 100 : 1
  // Each unit of offset from 50 = 1% of the element's own size (which fills the hero)
  const tX = positionX - 50  // -50 to +50
  const tY = positionY - 50  // -50 to +50
  // Apply translate then scale (not nested) so both are independent
  return `translate(${tX}%, ${tY}%) scale(${safeScale})`
}
