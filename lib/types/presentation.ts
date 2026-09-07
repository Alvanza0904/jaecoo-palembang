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
  small_mobile: 'S. Mobile',
}

/** Preview container dimensions (px) */
export const BREAKPOINT_PREVIEW_DIMS: Record<BreakpointKey, { width: number; height: number }> = {
  desktop:      { width: 320, height: 180 },  // 16:9 landscape
  tablet:       { width: 240, height: 180 },  // 4:3
  mobile:       { width: 160, height: 240 },  // 9:16 portrait
  small_mobile: { width: 130, height: 220 },  // narrow portrait
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
): BreakpointSettings {
  const raw = settings[key] ?? {}
  const mode: PresentationMode = raw.mode ?? 'auto'

  if (mode === 'inherited' && raw.inherit_from) {
    // Resolve from parent
    const parent = resolveBreakpointSettings(settings, raw.inherit_from, assetFocalX, assetFocalY)
    return { ...parent, mode: 'inherited', inherit_from: raw.inherit_from }
  }

  if (mode === 'auto') {
    return {
      ...DEFAULT_BREAKPOINT_SETTINGS,
      focal_x: assetFocalX,
      focal_y: assetFocalY,
      position_x: assetFocalX,
      position_y: assetFocalY,
      mode: 'auto',
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
