/**
 * JAECOO Palembang — Visual Media Editor
 * STEP 5E.1: Unified Background + Cutout canvas editor
 * STEP 5F: AUTO Cutout Coordinate Mapping + Alpha BBox
 *
 * STEP 5F changes:
 * - Cutout rendering rewritten: uses object-fit:cover + object-position
 *   matching the background layer's coordinate system, eliminating
 *   letterbox mismatch across breakpoints with different aspect ratios.
 * - CUSTOM cutout offsets applied via additional CSS transform on top
 *   of the base cover alignment.
 * - Alpha bounding box detection: computed once per asset, cached in
 *   _meta.cutout_bbox within presentation_settings.
 * - Anomaly warning if bbox indicates unusually small vehicle area.
 * - Drag rewritten to work in cover coordinate space.
 * - All 5E/5E.1 features preserved.
 */

'use client'

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { MediaAsset } from '@/lib/types/media-asset'
import {
  type BreakpointKey,
  type PresentationMode,
  type PresentationSettings,
  type BreakpointSettings,
  type CutoutPlacement,
  type PresentationMeta,
  type TypographyFontFamily,
  BREAKPOINT_ORDER,
  BREAKPOINT_LABELS,
  BREAKPOINT_PREVIEW_DIMS,
  BREAKPOINT_ASPECT_RATIO,
  BREAKPOINT_INHERIT_DEFAULTS,
  TYPOGRAPHY_FONT_OPTIONS,
  CTA_SAFE_AREA_FRACTION,
  computeAutoScale,
  resolveBreakpointSettings,
  getBackgroundStyleFromResolved,
  getCutoutLayerStyle,
  getTypographyContainerStyle,
  getHeadingStyle,
  getSubheadingStyle,
  getHeadingFontSizeRem,
  getSubheadingFontSizeRem,
  getTypographyPreviewCoordinateSpace,
  getTypographyPreviewScale,
  resolveTypographyFontFamily,
} from '@/lib/types/presentation'
import { detectCutoutBBox } from '@/lib/utils/cutout-bbox'
import styles from './VisualMediaEditor.module.css'
import heroStyles from '@/components/hero/LayeredHero.module.css'

// ─── Types ───────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type ActiveLayer = 'background' | 'cutout'
type PreviewMode = 'overlay' | 'bg' | 'cutout'

// ─── Constants ───────────────────────────────────────────

const BP_ICONS: Record<BreakpointKey, string> = {
  desktop:      '🖥',
  tablet:       '📱',
  mobile:       '📲',
  small_mobile: '📟',
}

// Checkerboard pattern sebagai data URL (untuk preview cutout)
const CHECKER_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' width='8' height='8' fill='%23eee'/%3E%3Crect y='8' width='8' height='8' fill='%23eee'/%3E%3C/svg%3E")`

// Typography helpers are imported from @/lib/types/presentation.
// DO NOT duplicate them here — single source of truth.

// ─── Props ────────────────────────────────────────────────

interface Props {
  /** Hero/background asset. */
  asset: MediaAsset
  /** Separate cutout asset when the model uses cutout_media_id. */
  cutoutAsset?: MediaAsset | null
  onClose: () => void
  onUpdated: (asset: MediaAsset) => void
  /** Preview text for the typography preview (e.g. model tagline) */
  previewHeading?: string
  /** Preview subtext for the typography preview (e.g. model name) */
  previewSubheading?: string
  /** Preview eyebrow/tagline rendered exactly like the public Hero. */
  previewTagline?: string
}

// ─── Helpers ─────────────────────────────────────────────

function getStoredSettings(asset: MediaAsset): PresentationSettings {
  return (asset as MediaAsset & { presentation_settings?: PresentationSettings })
    .presentation_settings ?? {}
}

function modeLabel(mode: PresentationMode): string {
  if (mode === 'auto') return 'AUTO'
  if (mode === 'inherited') return 'INHERIT'
  return 'CUSTOM'
}

function modeBadgeClass(mode: PresentationMode, s: typeof styles): string {
  if (mode === 'auto') return `${s.modeBadge} ${s.modeBadgeAuto}`
  if (mode === 'inherited') return `${s.modeBadge} ${s.modeBadgeInherited}`
  return `${s.modeBadge} ${s.modeBadgeCustom}`
}

function tabModeClass(mode: PresentationMode, s: typeof styles): string {
  if (mode === 'auto') return s.bpTabModeAuto
  if (mode === 'inherited') return s.bpTabModeInherited
  return s.bpTabModeCustom
}

// ─── Component ───────────────────────────────────────────

export function VisualMediaEditor({ asset, cutoutAsset, onClose, onUpdated, previewHeading, previewSubheading, previewTagline = 'OVERVIEW' }: Props) {

  // ── Core state ─────────────────────────────────────────
  const [activeBp, setActiveBp] = useState<BreakpointKey>('desktop')
  const [settings, setSettings] = useState<PresentationSettings>(() => getStoredSettings(asset))
  const [cutoutAssetSettings, setCutoutAssetSettings] = useState<PresentationSettings>(() =>
    getStoredSettings(cutoutAsset ?? asset),
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirtyBackground, setDirtyBackground] = useState(false)
  const [dirtyCutout, setDirtyCutout] = useState(false)
  const isDirty = dirtyBackground || dirtyCutout

  // ── 5E.1: Unified editor state ─────────────────────────
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('background')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('overlay')
  const [cutoutOpacity, setCutoutOpacity] = useState(100)
  const [showTypography, setShowTypography] = useState(false)

  // ── 5F: Bbox state ─────────────────────────────────────
  const [bboxComputing, setBboxComputing] = useState(false)
  const bboxComputedRef = useRef(false)

  // ── Refs ───────────────────────────────────────────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const focalGridRef = useRef<HTMLDivElement | null>(null)

  // ── Derived ────────────────────────────────────────────
  const separateCutoutAsset = !!cutoutAsset && cutoutAsset.id !== asset.id
  const cutoutSourceAsset = cutoutAsset ?? asset
  const hasCutout = !!cutoutSourceAsset.cutout_url

  const activeSettings = activeLayer === 'cutout' && separateCutoutAsset
    ? cutoutAssetSettings
    : settings
  const activeFocalX = activeLayer === 'cutout' && separateCutoutAsset
    ? cutoutSourceAsset.focal_x ?? 50
    : asset.focal_x ?? 50
  const activeFocalY = activeLayer === 'cutout' && separateCutoutAsset
    ? cutoutSourceAsset.focal_y ?? 50
    : asset.focal_y ?? 50

  const effectiveSettings: BreakpointSettings = resolveBreakpointSettings(
    activeSettings,
    activeBp,
    activeFocalX,
    activeFocalY,
  )

  const stored = activeSettings[activeBp as BreakpointKey] ?? {}
  const isCustom = effectiveSettings.mode === 'custom'
  const isInherited = effectiveSettings.mode === 'inherited'

  // ── Preview dimensions ─────────────────────────────────
  // The canvas keeps the exact Hero aspect ratio. Typography itself is not
  // re-calculated for this small canvas; it is rendered in a breakpoint design
  // coordinate space and the whole typography world is scaled down as one unit.
  const dims = BREAKPOINT_PREVIEW_DIMS[activeBp as BreakpointKey]
  const canonicalRatio = BREAKPOINT_ASPECT_RATIO[activeBp as BreakpointKey]

  // Canvas width = BREAKPOINT_PREVIEW_DIMS[bp].width (sudah cocok live viewport).
  // FIX v3: mobile=390px, small_mobile=375px, desktop=480px, tablet=360px.
  const maxW = dims.width
  const previewW = Math.min(dims.width, maxW)
  const previewH = Math.round(previewW / canonicalRatio)

  // Image URLs — dipilih berdasarkan activeBp agar preview editor
  // cocok dengan image yang benar-benar dirender di live per breakpoint.
  // Sama dengan logika di queries.ts → mapModel() → heroImage.
  const variants = asset.variants as Record<string, string> | null | undefined
  const previewUrl = (() => {
    if (activeBp === 'desktop') {
      return variants?.['1920'] ?? variants?.['1440'] ?? asset.public_url ?? ''
    }
    if (activeBp === 'tablet') {
      return variants?.['1024'] ?? variants?.['768'] ?? asset.public_url ?? ''
    }
    if (activeBp === 'mobile') {
      return variants?.['768'] ?? variants?.['480'] ?? asset.public_url ?? ''
    }
    // small_mobile
    return variants?.['480'] ?? asset.public_url ?? ''
  })()
  const cutoutUrl = cutoutSourceAsset.cutout_url ?? ''

  // ── 5F: Meta / bbox — MUST be declared before cutoutEffectiveSettings ─
  const meta: PresentationMeta = (
    (separateCutoutAsset ? cutoutAssetSettings : settings) as PresentationSettings & { _meta?: PresentationMeta }
  )._meta ?? {}
  const cutoutBbox = meta.cutout_bbox ?? null

  // Pass bbox h_pct so auto mode uses correct per-breakpoint scale
  const cutoutEffectiveSettings = resolveBreakpointSettings(
    separateCutoutAsset ? cutoutAssetSettings : settings,
    activeBp,
    cutoutSourceAsset.focal_x ?? 50,
    cutoutSourceAsset.focal_y ?? 50,
    cutoutBbox?.h_pct,
  )
  const cutoutSettings: CutoutPlacement = cutoutEffectiveSettings.cutout

  // ── 5F: Cutout rendering — cover-aligned coordinate system ────────────
  //
  // KEY INSIGHT: The cutout was generated from the same original image
  // without any crop or resize, so vehicle coordinates in the cutout are
  // pixel-identical to the original. To maintain correct overlay:
  //
  //   Both background AND cutout must use the same mapping:
  //   object-fit: cover  +  object-position: X% Y%
  //
  // In AUTO mode (scale=100, pos=50/50): cutout is rendered exactly like
  // the background layer — perfect overlap regardless of canvas aspect ratio.
  //
  // In CUSTOM mode: user offsets are applied via CSS translate() on top of
  // the base cover alignment, so the coordinate system stays consistent.
  //
  // This replaces the old left/top/width/height approach which caused
  // letterbox mismatch when canvas and image aspect ratios differed.

  // ── Change helpers ────────────────────────────────────

  const updateBreakpoint = useCallback(
    (key: BreakpointKey, patch: Partial<BreakpointSettings>) => {
      if (activeLayer === 'cutout' && separateCutoutAsset) {
        setCutoutAssetSettings((prev: PresentationSettings) => {
          const current = prev[key] ?? {}
          return { ...prev, [key]: { ...current, ...patch } }
        })
        setDirtyCutout(true)
      } else {
        setSettings((prev: PresentationSettings) => {
          const current = prev[key] ?? {}
          return { ...prev, [key]: { ...current, ...patch } }
        })
        setDirtyBackground(true)
      }
      setSaveStatus('idle')
    },
    [activeLayer, separateCutoutAsset],
  )

  const setMode = useCallback(
    (mode: PresentationMode) => {
      if (mode === 'custom') {
        const eff = effectiveSettings
        updateBreakpoint(activeBp, {
          mode: 'custom',
          position_x: eff.position_x,
          position_y: eff.position_y,
          scale: eff.scale,
          object_fit: eff.object_fit,
          focal_x: eff.focal_x,
          focal_y: eff.focal_y,
          cutout: { ...eff.cutout },
          typography: { ...eff.typography },
        })
      } else if (mode === 'inherited') {
        const defaultParent = BREAKPOINT_INHERIT_DEFAULTS[activeBp as BreakpointKey]
        updateBreakpoint(activeBp, { mode: 'inherited', inherit_from: defaultParent })
      } else {
        if (activeLayer === 'cutout' && separateCutoutAsset) {
          setCutoutAssetSettings((prev: PresentationSettings) => {
            const next = { ...prev }
            delete next[activeBp as BreakpointKey]
            return next
          })
          setDirtyCutout(true)
        } else {
          setSettings((prev: PresentationSettings) => {
            const next = { ...prev }
            delete next[activeBp as BreakpointKey]
            return next
          })
          setDirtyBackground(true)
        }
        setSaveStatus('idle')
      }
    },
    [activeBp, activeLayer, effectiveSettings, separateCutoutAsset, updateBreakpoint],
  )

  // ── Drag state ────────────────────────────────────────

  const dragRef = useRef<{
    layer: ActiveLayer
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    w: number
    h: number
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isCustom) return
      e.currentTarget.setPointerCapture(e.pointerId)

      const startPosX = activeLayer === 'background'
        ? effectiveSettings.position_x
        : cutoutSettings.position_x
      const startPosY = activeLayer === 'background'
        ? effectiveSettings.position_y
        : cutoutSettings.position_y

      dragRef.current = {
        layer: activeLayer,
        startX: e.clientX,
        startY: e.clientY,
        startPosX,
        startPosY,
        w: previewW,
        h: previewH,
      }
      setIsDragging(true)
    },
    [isCustom, activeLayer, effectiveSettings, cutoutSettings, previewW, previewH],
  )

  const handleCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || !isCustom) return
      const d = dragRef.current
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY

      // Convert px delta to % delta
      const dxPct = Math.round((dx / d.w) * 100)
      const dyPct = Math.round((dy / d.h) * 100)

      const newX = Math.max(0, Math.min(100, d.startPosX + dxPct))
      const newY = Math.max(0, Math.min(100, d.startPosY + dyPct))

      if (d.layer === 'background') {
        updateBreakpoint(activeBp, { position_x: newX, position_y: newY })
      } else {
        updateBreakpoint(activeBp, {
          cutout: { ...cutoutSettings, position_x: newX, position_y: newY },
        })
      }
    },
    [isCustom, activeBp, updateBreakpoint, cutoutSettings],
  )

  const handleCanvasPointerUp = useCallback(() => {
    dragRef.current = null
    setIsDragging(false)
  }, [])

  // ── Focal point drag (pada grid di bawah, bukan canvas utama) ───

  const [isDraggingFocal, setIsDraggingFocal] = useState(false)

  const handleFocalPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isCustom) return
      e.currentTarget.setPointerCapture(e.pointerId)
      setIsDraggingFocal(true)
    },
    [isCustom],
  )

  const handleFocalPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDraggingFocal || !isCustom) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)))
      const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)))
      updateBreakpoint(activeBp, { focal_x: x, focal_y: y, position_x: x, position_y: y })
    },
    [isDraggingFocal, isCustom, activeBp, updateBreakpoint],
  )

  const handleFocalPointerUp = useCallback(() => setIsDraggingFocal(false), [])

  // ── Typography Drag (on typo preview canvas) ──────────
  // Drag moves X/Y of typography placement directly.
  // Only X and Y are affected — font_size/weight/etc. are not changed.

  const typoDragRef = useRef<{
    startX: number
    startY: number
    startTypoX: number
    startTypoY: number
    w: number
    h: number
  } | null>(null)
  const [isDraggingTypo, setIsDraggingTypo] = useState(false)

  const handleTypoCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isCustom) return
      e.currentTarget.setPointerCapture(e.pointerId)
      const typo = effectiveSettings.typography
      typoDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTypoX: typo.x,
        startTypoY: typo.y,
        w: previewW,
        h: previewH,
      }
      setIsDraggingTypo(true)
    },
    [isCustom, effectiveSettings.typography, previewW, previewH],
  )

  const handleTypoCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!typoDragRef.current || !isCustom) return
      const d = typoDragRef.current
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      // Convert px delta to % of canvas
      const dxPct = (dx / d.w) * 100
      const dyPct = (dy / d.h) * 100
      const newX = Math.round(Math.max(0, Math.min(80, d.startTypoX + dxPct)))
      const newY = Math.round(Math.max(0, Math.min(90, d.startTypoY + dyPct)))
      const typo = effectiveSettings.typography
      updateBreakpoint(activeBp, { typography: { ...typo, x: newX, y: newY } })
    },
    [isCustom, activeBp, updateBreakpoint, effectiveSettings.typography],
  )

  const handleTypoCanvasPointerUp = useCallback(() => {
    typoDragRef.current = null
    setIsDraggingTypo(false)
  }, [])

  // ── Save ──────────────────────────────────────────────

  const savePresentation = useCallback(async (mediaId: string, nextSettings: PresentationSettings) => {
    const res = await fetch('/api/admin/media/presentation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, settings: nextSettings }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
    return json.asset as MediaAsset
  }, [])

  const doSave = useCallback(async (): Promise<boolean> => {
    if (saveStatus === 'saving') return true
    if (!isDirty) return true
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const updates: Promise<MediaAsset>[] = []
      if (dirtyBackground) updates.push(savePresentation(asset.id, settings))
      if (dirtyCutout && separateCutoutAsset && cutoutAsset) {
        updates.push(savePresentation(cutoutAsset.id, cutoutAssetSettings))
      }
      const updatedAssets = await Promise.all(updates)
      updatedAssets.forEach((updated) => onUpdated(updated))
      setDirtyBackground(false)
      setDirtyCutout(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
      return true
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err instanceof Error ? err.message : String(err))
      return false
    }
  }, [
    asset.id, cutoutAsset, cutoutAssetSettings, dirtyBackground, dirtyCutout, isDirty,
    onUpdated, savePresentation, saveStatus, separateCutoutAsset, settings,
  ])

  // Autosave debounced 1.5s
  useEffect(() => {
    if (!isDirty) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => { void doSave() }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [cutoutAssetSettings, doSave, isDirty, settings])

  // ── 5F: Bbox detection — runs once per asset open (or after reset) ────
  //
  // Computes alpha bounding box of the cutout image and stores it in
  // settings._meta. Only runs if:
  //   - Asset has a cutout_url
  //   - _meta.cutout_bbox is not already present
  //   - Not already computing
  //
  // Performa: pixel scan runs on a 512px-wide offscreen canvas, once only.
  // Never runs on every render or during drag.

  useEffect(() => {
    if (!hasCutout || !cutoutUrl) return
    if (bboxComputedRef.current) return  // already done this session

    const bboxSettings = separateCutoutAsset ? cutoutAssetSettings : settings
    const existingMeta = (bboxSettings as PresentationSettings & { _meta?: PresentationMeta })._meta
    if (existingMeta?.cutout_bbox) {
      // Already have bbox from a previous session — no need to recompute
      bboxComputedRef.current = true
      return
    }

    // Compute bbox asynchronously, once
    bboxComputedRef.current = true
    setBboxComputing(true)

    detectCutoutBBox(cutoutUrl).then((result) => {
      setBboxComputing(false)
      if (!result) return

      const newMeta: PresentationMeta = {
        ...existingMeta,
        cutout_bbox: result.bbox,
        bbox_computed_at: result.computed_at,
        bbox_anomaly: result.anomaly,
        bbox_anomaly_reason: result.anomaly_reason,
      }

      if (separateCutoutAsset) {
        setCutoutAssetSettings((prev) => ({ ...prev, _meta: newMeta }))
        setDirtyCutout(true)
      } else {
        setSettings((prev) => ({ ...prev, _meta: newMeta }))
        setDirtyBackground(true)
      }
    }).catch(() => {
      setBboxComputing(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCutout, cutoutUrl])

  // ── Reset ─────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (activeLayer === 'cutout' && separateCutoutAsset) {
      setCutoutAssetSettings((prev: PresentationSettings) => {
        const next = { ...prev }
        delete next[activeBp as BreakpointKey]
        return next
      })
      setDirtyCutout(true)
    } else {
      setSettings((prev: PresentationSettings) => {
        const next = { ...prev }
        delete next[activeBp as BreakpointKey]
        return next
      })
      setDirtyBackground(true)
    }
    bboxComputedRef.current = false
    setSaveStatus('idle')
  }, [activeBp, activeLayer, separateCutoutAsset])

  const handleClose = useCallback(async () => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
      autosaveTimer.current = null
    }
    if (isDirty && saveStatus !== 'saving') {
      const saved = await doSave()
      if (!saved) return
    }
    onClose()
  }, [doSave, isDirty, onClose, saveStatus])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        void handleClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [handleClose])

  // ── Canvas cursor ─────────────────────────────────────
  const canvasCursor = !isCustom ? 'default' : isDragging ? 'grabbing' : 'grab'

  // ─── Render ──────────────────────────────────────────

  return (
    <div
      className={styles.overlay}
      onClick={(e: { target: EventTarget | null; currentTarget: EventTarget | null }) => {
        if (e.target === e.currentTarget) void handleClose()
      }}
    >
      <div className={styles.panel} role="dialog" aria-label="Visual Media Editor">

        {/* ── Header ──────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerTitle} title={asset.filename}>
            🎨 Visual Editor
          </div>
          <div className={styles.headerActions}>
            <button className={styles.backBtn} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleClose() }}>← Kembali</button>
            <div className={styles.saveStatusWrap}>
              {saveStatus === 'saving' && <span className={styles.saveStatusSaving}>Menyimpan…</span>}
              {saveStatus === 'saved'  && <span className={styles.saveStatusSaved}>✓ Tersimpan</span>}
              {saveStatus === 'error'  && <span className={styles.saveStatusError} title={saveError ?? ''}>⚠ Error</span>}
              {saveStatus === 'idle' && isDirty && <span className={styles.saveStatusDirty}>● Belum simpan</span>}
            </div>
            <button className={styles.closeBtn} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleClose() }} aria-label="Tutup">✕</button>
          </div>
        </div>

        {/* ── Breakpoint Mode Status Tabs (juga sebagai selector sekunder) ── */}
        <div className={styles.breakpointTabs} role="tablist">
          {BREAKPOINT_ORDER.map((bp) => {
            const bpMode: PresentationMode = (activeLayer === 'cutout' && separateCutoutAsset
              ? cutoutAssetSettings[bp]?.mode
              : settings[bp]?.mode) ?? 'auto'
            const isActive = bp === activeBp
            return (
              <button
                key={bp}
                role="tab"
                aria-selected={isActive}
                className={`${styles.bpTab} ${isActive ? styles.bpTabActive : ''}`}
                onClick={() => setActiveBp(bp)}
              >
                <span className={styles.bpTabIcon}>{BP_ICONS[bp]}</span>
                <span className={styles.bpTabLabel}>{BREAKPOINT_LABELS[bp]}</span>
                <span className={`${styles.bpTabMode} ${tabModeClass(bpMode, styles)}`}>
                  {modeLabel(bpMode)}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Device Preview Selector ──────────────────── */}
        <div className={styles.devicePreviewBar}>
          <span className={styles.devicePreviewLabel}>PREVIEW</span>
          <div className={styles.devicePreviewBtns} role="group" aria-label="Device preview">
            {BREAKPOINT_ORDER.map((bp) => (
              <button
                key={bp}
                className={`${styles.devicePreviewBtn} ${activeBp === bp ? styles.devicePreviewBtnActive : ''}`}
                onClick={() => setActiveBp(bp)}
                title={BREAKPOINT_LABELS[bp]}
                aria-pressed={activeBp === bp}
              >
                <span className={styles.devicePreviewBtnIcon}>{BP_ICONS[bp]}</span>
                <span className={styles.devicePreviewBtnLabel}>{BREAKPOINT_LABELS[bp]}</span>
              </button>
            ))}
          </div>
          <span className={styles.devicePreviewEditing} aria-live="polite">
            Editing: <strong>{BREAKPOINT_LABELS[activeBp as BreakpointKey]}</strong>
          </span>
        </div>

        {/* ── Layer Selector (BG / CUTOUT) ─────────────── */}
        {hasCutout && (
          <div className={styles.layerBar}>
            <span className={styles.layerBarLabel}>Edit:</span>
            <button
              className={`${styles.layerBtn} ${activeLayer === 'background' ? styles.layerBtnActive : ''}`}
              onClick={() => setActiveLayer('background')}
            >
              🖼 Background
            </button>
            <button
              className={`${styles.layerBtn} ${activeLayer === 'cutout' ? styles.layerBtnActiveCutout : ''}`}
              onClick={() => setActiveLayer('cutout')}
            >
              🚗 Cutout
            </button>
          </div>
        )}

        {/* ── Unified Canvas ───────────────────────────── */}
        <div className={styles.canvasArea}>

          {/* Preview mode pills */}
          <div className={styles.previewModeRow}>
            {(['overlay', 'bg', 'cutout'] as PreviewMode[]).map((pm) => (
              <button
                key={pm}
                className={`${styles.previewModeBtn} ${previewMode === pm ? styles.previewModeBtnActive : ''}`}
                onClick={() => setPreviewMode(pm)}
              >
                {pm === 'overlay' ? 'Overlay' : pm === 'bg' ? 'BG' : 'Cutout'}
              </button>
            ))}
            <span className={styles.canvasDims}>{dims.width}×{dims.height}</span>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{
              width: previewW,
              height: previewH,
              cursor: canvasCursor,
              background: previewMode === 'cutout' ? CHECKER_BG : '#1a1a1a',
            }}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
          >
            {/* Background layer */}
            {previewUrl && previewMode !== 'cutout' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.canvasBg}
                src={previewUrl}
                alt={asset.alt_text ?? asset.filename}
                draggable={false}
                style={{
                  // Uses shared getBackgroundStyleFromResolved() — same as Live Hero
                  ...getBackgroundStyleFromResolved(effectiveSettings),
                  // Dim BG slightly saat layer cutout aktif
                  opacity: hasCutout && activeLayer === 'cutout' ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              />
            )}

            {/* Cutout layer — cover-aligned to match background coordinate system.
                STEP 5F: Uses object-fit:cover + object-position identical to background
                so that vehicle pixels overlay exactly, regardless of canvas aspect ratio.
                CUSTOM offsets applied via CSS transform translate+scale on top. */}
            {hasCutout && cutoutUrl && previewMode !== 'bg' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.canvasCutout}
                src={cutoutUrl}
                alt="Cutout kendaraan"
                draggable={false}
                data-visual-asset-id={cutoutSourceAsset.id}
                data-visual-breakpoint={activeBp}
                data-visual-mode={cutoutEffectiveSettings.mode}
                data-visual-position-x={cutoutSettings.position_x}
                data-visual-position-y={cutoutSettings.position_y}
                data-visual-scale={cutoutSettings.scale}
                style={{
                  // Uses shared getCutoutLayerStyle() — same formula as Live Hero
                  ...getCutoutLayerStyle(cutoutSettings),
                  opacity: cutoutOpacity / 100,
                  // Highlight border saat layer cutout aktif
                  outline: activeLayer === 'cutout' && cutoutEffectiveSettings.mode === 'custom'
                    ? '2px dashed rgba(200,169,110,0.7)'
                    : 'none',
                  outlineOffset: '2px',
                  transition: 'outline 0.15s',
                }}
              />
            )}

            {/* Focal marker — hanya saat BG aktif dan custom */}
            {isCustom && activeLayer === 'background' && (
              <div
                className={styles.focalMarker}
                style={{
                  left: `${effectiveSettings.focal_x}%`,
                  top: `${effectiveSettings.focal_y}%`,
                }}
              >
                <div className={styles.focalMarkerInner} />
              </div>
            )}

            {/* Drag hint overlay saat tidak custom */}
            {!isCustom && (
              <div className={styles.canvasLockHint}>
                Pilih CUSTOM untuk drag
              </div>
            )}
          </div>

          {/* Cutout opacity slider — di bawah canvas, hanya saat hasCutout */}
          {hasCutout && (
            <div className={styles.opacityRow}>
              <span className={styles.opacityLabel}>Opacity cutout</span>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={cutoutOpacity}
                className={styles.opacitySlider}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCutoutOpacity(Number(e.target.value))
                }
              />
              <span className={styles.opacityValue}>{cutoutOpacity}%</span>
            </div>
          )}

          {/* Info saat belum ada cutout */}
          {!hasCutout && (
            <div className={styles.noCutoutNote}>
              ℹ️ Cutout belum tersedia untuk gambar ini. Proses cutout di Media Library terlebih dahulu.
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* ── Controls ─────────────────────────────────── */}
        <div className={styles.controls}>

          {/* ── Mode Selector ──────────────────────────── */}
          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeader}>
              <div className={styles.controlSectionTitle}>Mode</div>
              <div className={modeBadgeClass(effectiveSettings.mode, styles)}>
                {modeLabel(effectiveSettings.mode)}
              </div>
            </div>
            <div className={styles.modeSelector}>
              {(['auto', 'custom', 'inherited'] as PresentationMode[]).map((m) => (
                <button
                  key={m}
                  className={`${styles.modeBtn} ${effectiveSettings.mode === m ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode(m)}
                  disabled={m === 'inherited' && activeBp === 'desktop'}
                >
                  {m === 'auto' ? 'AUTO' : m === 'custom' ? 'CUSTOM' : 'INHERIT'}
                </button>
              ))}
            </div>

            {effectiveSettings.mode === 'inherited' && (
              <select
                className={styles.inheritSelect}
                value={stored.inherit_from ?? BREAKPOINT_INHERIT_DEFAULTS[activeBp as BreakpointKey] ?? 'desktop'}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  updateBreakpoint(activeBp, {
                    inherit_from: e.target.value as 'desktop' | 'tablet' | 'mobile',
                  })
                }
              >
                {BREAKPOINT_ORDER
                  .filter((bp) => bp !== activeBp)
                  .map((bp) => (
                    <option key={bp} value={bp}>{BREAKPOINT_LABELS[bp]}</option>
                  ))}
              </select>
            )}

            {isInherited && (
              <div className={styles.sliderDisabledNote}>
                Menggunakan setting dari breakpoint di atas. Pilih CUSTOM untuk override.
              </div>
            )}
          </div>

          <div className={styles.divider} />

          {/* ── Background Controls ─────────────────────── */}
          {(activeLayer === 'background' || !hasCutout) && (
            <>
              <div className={styles.controlSection}>
                <div className={styles.controlSectionTitle}>
                  🖼 Background — Posisi
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Position X</span>
                    <span className={styles.sliderValue}>{effectiveSettings.position_x}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={effectiveSettings.position_x}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { position_x: Number(e.target.value) })
                    }
                  />
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Position Y</span>
                    <span className={styles.sliderValue}>{effectiveSettings.position_y}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={effectiveSettings.position_y}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { position_y: Number(e.target.value) })
                    }
                  />
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Scale</span>
                    <span className={styles.sliderValue}>{effectiveSettings.scale}%</span>
                  </div>
                  <input
                    type="range" min={10} max={300} step={1}
                    value={effectiveSettings.scale}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { scale: Number(e.target.value) })
                    }
                  />
                </div>

                {!isCustom && (
                  <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk drag atau geser slider</div>
                )}
              </div>

              <div className={styles.divider} />

              {/* Object Fit */}
              <div className={styles.controlSection}>
                <div className={styles.controlSectionTitle}>Crop / Object Fit</div>
                <div className={styles.fitSelector}>
                  {(['cover', 'contain'] as const).map((fit) => (
                    <button
                      key={fit}
                      className={`${styles.fitBtn} ${effectiveSettings.object_fit === fit ? styles.fitBtnActive : ''}`}
                      onClick={() => { if (isCustom) updateBreakpoint(activeBp, { object_fit: fit }) }}
                      disabled={!isCustom}
                    >
                      {fit === 'cover' ? '⊡ Cover' : '⬜ Contain'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* Focal Point */}
              <div className={styles.controlSection}>
                <div className={styles.controlSectionTitle}>Focal Point</div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Focal X</span>
                    <span className={styles.sliderValue}>{effectiveSettings.focal_x}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={effectiveSettings.focal_x}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { focal_x: Number(e.target.value) })
                    }
                  />
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Focal Y</span>
                    <span className={styles.sliderValue}>{effectiveSettings.focal_y}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={effectiveSettings.focal_y}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { focal_y: Number(e.target.value) })
                    }
                  />
                </div>

                {isCustom && previewUrl && (
                  <>
                    <div className={styles.controlSectionTitle} style={{ marginTop: 4 }}>
                      Klik / drag untuk pilih focal point
                    </div>
                    <div
                      ref={focalGridRef}
                      className={styles.focalGrid}
                      onPointerDown={handleFocalPointerDown}
                      onPointerMove={handleFocalPointerMove}
                      onPointerUp={handleFocalPointerUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="focal" className={styles.focalGridImg} draggable={false} />
                      <div
                        className={styles.focalGridMarker}
                        style={{ left: `${effectiveSettings.focal_x}%`, top: `${effectiveSettings.focal_y}%` }}
                      />
                      <div className={styles.focalGridHint}>Seret untuk atur titik fokus</div>
                    </div>
                  </>
                )}

                {!isCustom && (
                  <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur focal point</div>
                )}
              </div>
            </>
          )}

          {/* ── Cutout Controls ─────────────────────────── */}
          {hasCutout && activeLayer === 'cutout' && (
            <div className={styles.controlSection}>
              <div className={styles.controlSectionTitle}>
                🚗 Cutout — Posisi &amp; Scale
              </div>
              <div className={styles.sliderDisabledNote} style={{ marginBottom: 8, fontStyle: 'normal', color: 'var(--color-ink-muted-dark)' }}>
                Drag langsung di canvas atau gunakan slider di bawah.
              </div>

              <div className={styles.sliderRow}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Position X</span>
                  <span className={styles.sliderValue}>{cutoutSettings.position_x}%</span>
                </div>
                <input
                  type="range" min={0} max={100} step={1}
                  value={cutoutSettings.position_x}
                  disabled={!isCustom}
                  className={styles.slider}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateBreakpoint(activeBp, {
                      cutout: { ...cutoutSettings, position_x: Number(e.target.value) },
                    })
                  }
                />
              </div>

              <div className={styles.sliderRow}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Position Y</span>
                  <span className={styles.sliderValue}>{cutoutSettings.position_y}%</span>
                </div>
                <input
                  type="range" min={0} max={100} step={1}
                  value={cutoutSettings.position_y}
                  disabled={!isCustom}
                  className={styles.slider}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateBreakpoint(activeBp, {
                      cutout: { ...cutoutSettings, position_y: Number(e.target.value) },
                    })
                  }
                />
              </div>

              <div className={styles.sliderRow}>
                <div className={styles.sliderLabel}>
                  <span className={styles.sliderLabelText}>Scale</span>
                  <span className={styles.sliderValue}>{cutoutSettings.scale}%</span>
                </div>
                <input
                  type="range" min={10} max={300} step={1}
                  value={cutoutSettings.scale}
                  disabled={!isCustom}
                  className={styles.slider}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateBreakpoint(activeBp, {
                      cutout: { ...cutoutSettings, scale: Number(e.target.value) },
                    })
                  }
                />
              </div>

              {!isCustom && (
                <div className={styles.sliderDisabledNote}>
                  AUTO: Scale dihitung otomatis dari bbox cutout.
                  {cutoutBbox ? (
                    <span style={{ display: 'block', marginTop: 4, color: 'rgba(200,169,110,0.85)', fontStyle: 'normal', fontWeight: 600 }}>
                      Auto Scale {activeBp}: {computeAutoScale(cutoutBbox.h_pct, activeBp)}%
                      <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>(vehicle {cutoutBbox.h_pct}% tinggi canvas)</span>
                    </span>
                  ) : (
                    <span style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,0.35)' }}>
                      Bbox belum tersedia — scale default 100%
                    </span>
                  )}
                  <span style={{ display: 'block', marginTop: 6 }}>Pilih CUSTOM untuk override manual.</span>
                </div>
              )}
            </div>
          )}

          {/* ── 5F: Bbox Info Panel ─────────────────────── */}
          {hasCutout && (
            <div className={styles.controlSection}>
              <div className={styles.controlSectionTitle}>
                📐 Cutout Analysis
              </div>

              {bboxComputing && (
                <div className={styles.sliderDisabledNote}>
                  Menghitung bounding box…
                </div>
              )}

              {!bboxComputing && !cutoutBbox && (
                <div className={styles.sliderDisabledNote}>
                  Bounding box belum tersedia.
                </div>
              )}

              {!bboxComputing && cutoutBbox && (
                <div className={styles.bboxInfo}>
                  <div className={styles.bboxRow}>
                    <span className={styles.bboxLabel}>Vehicle area</span>
                    <span className={styles.bboxValue}>
                      {cutoutBbox.w_pct}% × {cutoutBbox.h_pct}%
                    </span>
                  </div>
                  <div className={styles.bboxRow}>
                    <span className={styles.bboxLabel}>Position</span>
                    <span className={styles.bboxValue}>
                      x:{cutoutBbox.x_pct}% y:{cutoutBbox.y_pct}%
                    </span>
                  </div>
                  {/* Auto scale per breakpoint — ditampilkan agar user tahu nilai otomatis */}
                  <div className={styles.bboxRow} style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 6 }}>
                    <span className={styles.bboxLabel}>Auto scale per device</span>
                  </div>
                  {BREAKPOINT_ORDER.map((bp) => (
                    <div key={bp} className={styles.bboxRow} style={{ paddingLeft: 8 }}>
                      <span className={styles.bboxLabel} style={{ color: bp === activeBp ? 'rgba(200,169,110,0.9)' : undefined }}>
                        {BREAKPOINT_LABELS[bp]}
                      </span>
                      <span className={styles.bboxValue} style={{ color: bp === activeBp ? 'rgba(200,169,110,0.9)' : undefined }}>
                        {computeAutoScale(cutoutBbox.h_pct, bp)}%
                      </span>
                    </div>
                  ))}
                  {meta.bbox_anomaly && (
                    <div className={styles.bboxWarning}>
                      ⚠ Cutout object area appears unusually small.
                      {meta.bbox_anomaly_reason && (
                        <span> {meta.bbox_anomaly_reason}</span>
                      )}
                    </div>
                  )}
                  {!meta.bbox_anomaly && (
                    <div className={styles.bboxOk}>
                      ✓ Cutout looks normal — auto scale aktif
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Typography Placement ────────────────────── */}
          <div className={styles.divider} />
          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeader}>
              <div className={styles.controlSectionTitle}>Typography Placement</div>
              <button
                className={styles.sectionCollapse}
                onClick={() => setShowTypography((v: boolean) => !v)}
              >
                {showTypography ? '▲' : '▼'}
              </button>
            </div>

            {showTypography && (
              <>
                {/* ── Typography Preview (Step 6H: uses shared helpers from presentation.ts) */}
                {(() => {
                  const typo = effectiveSettings.typography
                  const bp = activeBp as BreakpointKey

                  // Typography is rendered in the SAME coordinate space as the
                  // public Hero, not recreated with a second px/font-size formula.
                  // The coordinate space is then scaled as one unit to the editor canvas.
                  const typoSpace = getTypographyPreviewCoordinateSpace(bp)
                  const typoScale = getTypographyPreviewScale(bp, previewW)
                  const ctaSafeAreaPx = Math.round(previewH * CTA_SAFE_AREA_FRACTION)

                  // Use the real Hero text flow to estimate CTA overlap. The actual
                  // text DOM below is the same structure/classes as LayeredHero.
                  const headingStyle = getHeadingStyle(typo)
                  const subheadingStyle = getSubheadingStyle(typo)
                  const estimatedHeadingPx = getHeadingFontSizeRem(typo.font_size) * 16
                  const estimatedSubPx = getSubheadingFontSizeRem(typo.font_size) * 16
                  const estimatedTypoHeight = (previewTagline ? 16 * 1.2 + 12 : 0) +
                    estimatedHeadingPx * 1.1 + 12 + estimatedSubPx * 1.4
                  const estimatedTypoHeightPct = (estimatedTypoHeight / typoSpace.height) * 100
                  const typoBottomPct = typo.y + estimatedTypoHeightPct
                  const ctaSafeTopPct = 100 - CTA_SAFE_AREA_FRACTION * 100
                  const hasOverlap = typoBottomPct > ctaSafeTopPct

                  const bgStyle = getBackgroundStyleFromResolved(effectiveSettings)
                  const cutoutStyle = getCutoutLayerStyle(cutoutSettings)
                  const typoContainerStyle = getTypographyContainerStyle(typo)

                  return (
                    <>
                      <div className={styles.typoPreviewWrap}>
                        <div className={styles.typoPreviewLabel}>
                          📐 Preview Komposit — {BREAKPOINT_LABELS[bp]}
                          {isCustom && <span className={styles.typoPreviewDragHint}> · Drag text untuk pindah</span>}
                        </div>

                        {/* Composite canvas: BG + Cutout + Typography + CTA Safe Area
                            All styles computed by the SAME helpers as LayeredHero (Live).
                            Canvas is smaller but % coordinates are identical. */}
                        <div
                          className={styles.typoCanvas}
                          style={{
                            width: previewW,
                            height: previewH,
                            cursor: isCustom ? (isDraggingTypo ? 'grabbing' : 'grab') : 'default',
                          }}
                          onPointerDown={handleTypoCanvasPointerDown}
                          onPointerMove={handleTypoCanvasPointerMove}
                          onPointerUp={handleTypoCanvasPointerUp}
                          onPointerLeave={handleTypoCanvasPointerUp}
                        >
                          {/* Background — getBackgroundStyleFromResolved() shared with Live */}
                          {previewUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className={styles.typoCanvasBg}
                              src={previewUrl}
                              alt=""
                              draggable={false}
                              style={bgStyle}
                            />
                          )}

                          {/* Dark overlay — matches public hero overlayOpacity=30 */}
                          <div className={styles.typoCanvasOverlay} />

                          {/* Cutout — getCutoutLayerStyle() shared with Live */}
                          {hasCutout && cutoutUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className={styles.typoCanvasCutout}
                              src={cutoutUrl}
                              alt=""
                              draggable={false}
                              style={cutoutStyle}
                            />
                          )}

                          {/* Typography — exact LayeredHero structure rendered at the
                              breakpoint design width, then scaled as one unit. */}
                          <div
                            className={styles.typoCanvasWorld}
                            style={{
                              width: typoSpace.width,
                              height: typoSpace.height,
                              transform: `scale(${typoScale})`,
                            }}
                          >
                            <div
                              className={`${heroStyles.typographyContainer} ${styles.typoCanvasText} ${hasOverlap ? styles.typoCanvasTextOverlap : ''}`}
                              style={{
                                ...typoContainerStyle,
                                display: 'flex',
                                cursor: isCustom ? (isDraggingTypo ? 'grabbing' : 'grab') : 'default',
                              }}
                            >
                              {previewTagline && <p className={heroStyles.tagline}>{previewTagline}</p>}
                              <div className={heroStyles.headingBlock}>
                                <h1 className={heroStyles.heading} style={headingStyle}>
                                  {previewHeading ?? 'JAECOO J8'}
                                </h1>
                                {previewSubheading && (
                                  <p className={heroStyles.subheading} style={subheadingStyle}>
                                    {previewSubheading}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* CTA Safe Area — CTA_SAFE_AREA_FRACTION from presentation.ts */}
                          <div
                            className={`${styles.typoCanvasCtaSafe} ${hasOverlap ? styles.typoCanvasCtaSafeWarning : ''}`}
                            style={{ height: ctaSafeAreaPx }}
                          >
                            <span className={styles.typoCanvasCtaLabel}>CTA SAFE AREA</span>
                            <div className={styles.typoCanvasCtaButtons}>
                              <span className={styles.typoCanvasCtaBtn}>Chat dengan Alvan →</span>
                              <span className={styles.typoCanvasCtaBtnGhost}>Spesifikasi</span>
                            </div>
                          </div>

                          {!isCustom && (
                            <div className={styles.typoCanvasLockHint}>
                              Pilih CUSTOM untuk drag
                            </div>
                          )}
                        </div>

                        {hasOverlap && (
                          <div className={styles.typoOverlapWarning}>
                            ⚠ Typography kemungkinan overlap area CTA
                          </div>
                        )}

                        <div className={styles.typoPreviewHint}>
                          Preview realtime · rasio {Math.round(BREAKPOINT_ASPECT_RATIO[bp] * 100) / 100}
                          {' · '}{resolveTypographyFontFamily(typo)}
                        </div>
                      </div>

                      <div className={styles.divider} style={{ marginTop: 8, marginBottom: 8 }} />

                      <div className={styles.sliderDisabledNote}>
                        Positioning typography pada Public Hero. Aktifkan mode CUSTOM untuk mengedit.
                      </div>

                      {/* Text X — slider + numeric input */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Text X</span>
                          <input
                            type="number" min={0} max={80} step={1}
                            value={typo.x}
                            disabled={!isCustom}
                            className={styles.numericInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const v = Math.max(0, Math.min(80, Number(e.target.value)))
                              updateBreakpoint(activeBp, { typography: { ...typo, x: v } })
                            }}
                          />
                          <span className={styles.numericInputUnit}>%</span>
                        </div>
                        <input type="range" min={0} max={80} step={1}
                          value={typo.x} disabled={!isCustom}
                          className={styles.slider}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateBreakpoint(activeBp, { typography: { ...typo, x: Number(e.target.value) } })
                          }
                        />
                      </div>

                      {/* Text Y — slider + numeric input */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Text Y</span>
                          <input
                            type="number" min={0} max={90} step={1}
                            value={typo.y}
                            disabled={!isCustom}
                            className={styles.numericInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const v = Math.max(0, Math.min(90, Number(e.target.value)))
                              updateBreakpoint(activeBp, { typography: { ...typo, y: v } })
                            }}
                          />
                          <span className={styles.numericInputUnit}>%</span>
                        </div>
                        <input type="range" min={0} max={90} step={1}
                          value={typo.y} disabled={!isCustom}
                          className={styles.slider}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateBreakpoint(activeBp, { typography: { ...typo, y: Number(e.target.value) } })
                          }
                        />
                      </div>

                      {/* Width */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Width</span>
                          <input
                            type="number" min={10} max={100} step={1}
                            value={typo.width}
                            disabled={!isCustom}
                            className={styles.numericInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const v = Math.max(10, Math.min(100, Number(e.target.value)))
                              updateBreakpoint(activeBp, { typography: { ...typo, width: v } })
                            }}
                          />
                          <span className={styles.numericInputUnit}>%</span>
                        </div>
                        <input type="range" min={10} max={100} step={1}
                          value={typo.width} disabled={!isCustom}
                          className={styles.slider}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateBreakpoint(activeBp, { typography: { ...typo, width: Number(e.target.value) } })
                          }
                        />
                      </div>

                      {/* Alignment */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Alignment</span>
                          <span className={styles.sliderValue}>{typo.alignment}</span>
                        </div>
                        <div className={styles.alignBtns}>
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              className={`${styles.alignBtn} ${typo.alignment === align ? styles.alignBtnActive : ''}`}
                              disabled={!isCustom}
                              onClick={() =>
                                updateBreakpoint(activeBp, { typography: { ...typo, alignment: align } })
                              }
                            >
                              {align === 'left' ? '⬛◻◻' : align === 'center' ? '◻⬛◻' : '◻◻⬛'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size — 25–300% with numeric input */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Font Size</span>
                          <input
                            type="number" min={25} max={300} step={1}
                            value={typo.font_size}
                            disabled={!isCustom}
                            className={styles.numericInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const v = Math.max(25, Math.min(300, Number(e.target.value)))
                              if (!isNaN(v)) updateBreakpoint(activeBp, { typography: { ...typo, font_size: v } })
                            }}
                          />
                          <span className={styles.numericInputUnit}>%</span>
                        </div>
                        <input type="range" min={25} max={300} step={1}
                          value={typo.font_size} disabled={!isCustom}
                          className={styles.slider}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateBreakpoint(activeBp, { typography: { ...typo, font_size: Number(e.target.value) } })
                          }
                        />
                      </div>
                      <div className={styles.sliderDisabledNote} style={{ marginTop: -4, marginBottom: 4 }}>
                        100% = 4rem (64px) · Live heading: {Math.round((4 * effectiveSettings.typography.font_size / 100) * 16)}px
                      </div>

                      {/* Font Weight */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Font Weight</span>
                          <span className={styles.sliderValue}>{typo.font_weight}</span>
                        </div>
                        <div className={styles.alignBtns}>
                          {([300, 400, 500, 600, 700, 800] as const).map((w) => (
                            <button
                              key={w}
                              className={`${styles.alignBtn} ${typo.font_weight === w ? styles.alignBtnActive : ''}`}
                              disabled={!isCustom}
                              onClick={() =>
                                updateBreakpoint(activeBp, { typography: { ...typo, font_weight: w } })
                              }
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Letter Spacing */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Letter Spacing</span>
                          <span className={styles.sliderValue}>{typo.letter_spacing}em</span>
                        </div>
                        <input type="range" min={-0.05} max={0.2} step={0.005}
                          value={typo.letter_spacing} disabled={!isCustom}
                          className={styles.slider}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateBreakpoint(activeBp, { typography: { ...typo, letter_spacing: parseFloat(Number(e.target.value).toFixed(3)) } })
                          }
                        />
                      </div>

                      {/* Font Family — STEP 6I */}
                      <div className={styles.sliderRow}>
                        <div className={styles.sliderLabel}>
                          <span className={styles.sliderLabelText}>Font Family</span>
                          <span className={styles.sliderValue} style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {resolveTypographyFontFamily(typo)}
                          </span>
                        </div>
                        <select
                          className={styles.inheritSelect}
                          value={resolveTypographyFontFamily(typo)}
                          disabled={!isCustom}
                          style={{ marginTop: 4, width: '100%' }}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateBreakpoint(activeBp, {
                              typography: { ...typo, font_family: e.target.value as TypographyFontFamily },
                            })
                          }
                        >
                          {TYPOGRAPHY_FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      {!isCustom && (
                        <div className={styles.sliderDisabledNote} style={{ marginTop: 4 }}>
                          Aktifkan CUSTOM untuk mengedit typography positioning.
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            )}
          </div>

        </div>

        {/* ── Sticky Action Bar ─────────────────────────── */}
        <div className={styles.actionBar}>
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            title={`Reset ${BREAKPOINT_LABELS[activeBp as BreakpointKey]} ke AUTO`}
          >
            Reset AUTO
          </button>
          <button
            className={styles.saveBtn}
            onClick={doSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>

      </div>
    </div>
  )
}
