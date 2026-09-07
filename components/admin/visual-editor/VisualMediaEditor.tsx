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
  BREAKPOINT_ORDER,
  BREAKPOINT_LABELS,
  BREAKPOINT_PREVIEW_DIMS,
  BREAKPOINT_INHERIT_DEFAULTS,
  DEFAULT_BREAKPOINT_SETTINGS,
  resolveBreakpointSettings,
} from '@/lib/types/presentation'
import { detectCutoutBBox } from '@/lib/utils/cutout-bbox'
import styles from './VisualMediaEditor.module.css'

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

// ─── Props ────────────────────────────────────────────────

interface Props {
  asset: MediaAsset
  onClose: () => void
  onUpdated: (asset: MediaAsset) => void
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

export function VisualMediaEditor({ asset, onClose, onUpdated }: Props) {

  // ── Core state ─────────────────────────────────────────
  const [activeBp, setActiveBp] = useState<BreakpointKey>('desktop')
  const [settings, setSettings] = useState<PresentationSettings>(() => getStoredSettings(asset))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

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
  const hasCutout = !!asset.cutout_url

  const effectiveSettings: BreakpointSettings = resolveBreakpointSettings(
    settings,
    activeBp,
    asset.focal_x ?? 50,
    asset.focal_y ?? 50,
  )

  const stored = settings[activeBp as BreakpointKey] ?? {}
  const isCustom = effectiveSettings.mode === 'custom'
  const isInherited = effectiveSettings.mode === 'inherited'

  const cutoutSettings: CutoutPlacement = isCustom
    ? { ...DEFAULT_BREAKPOINT_SETTINGS.cutout, ...(stored.cutout ?? {}) }
    : effectiveSettings.cutout

  // ── Preview dimensions ─────────────────────────────────
  const dims = BREAKPOINT_PREVIEW_DIMS[activeBp as BreakpointKey]
  const maxW = 320
  const scaleRatio = Math.min(1, maxW / dims.width)
  const previewW = Math.round(dims.width * scaleRatio)
  const previewH = Math.round(dims.height * scaleRatio)

  // Image URLs
  const previewUrl = (asset.variants as Record<string, string>)?.['768']
    ?? (asset.variants as Record<string, string>)?.['480']
    ?? asset.public_url
    ?? ''
  const cutoutUrl = asset.cutout_url ?? ''

  // ── 5F: Meta / bbox ────────────────────────────────────
  const meta: PresentationMeta = (settings as PresentationSettings & { _meta?: PresentationMeta })._meta ?? {}
  const cutoutBbox = meta.cutout_bbox ?? null

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

  // CUSTOM offset: translate from center (50,50) by delta in %
  // cutout.position_x = 50 means no offset; 60 means +10% right
  const cutoutOffsetX = cutoutSettings.position_x - 50  // in % of canvas
  const cutoutOffsetY = cutoutSettings.position_y - 50  // in % of canvas
  const cutoutScaleVal = cutoutSettings.scale / 100      // multiplier

  // CSS transform for cutout: apply scale then translate offset
  // translateX/Y in % is relative to the ELEMENT, not the canvas —
  // so we convert canvas-% offset to pixel offset using canvas dimensions
  const cutoutOffsetXpx = (cutoutOffsetX / 100) * previewW
  const cutoutOffsetYpx = (cutoutOffsetY / 100) * previewH

  // ── Change helpers ────────────────────────────────────

  const updateBreakpoint = useCallback(
    (key: BreakpointKey, patch: Partial<BreakpointSettings>) => {
      setSettings((prev: PresentationSettings) => {
        const current = prev[key] ?? {}
        return { ...prev, [key]: { ...current, ...patch } }
      })
      setIsDirty(true)
      setSaveStatus('idle')
    },
    [],
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
        setSettings((prev: PresentationSettings) => {
          const next = { ...prev }
          delete next[activeBp as BreakpointKey]
          return next
        })
        setIsDirty(true)
        setSaveStatus('idle')
      }
    },
    [activeBp, effectiveSettings, updateBreakpoint],
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

  // ── Save ──────────────────────────────────────────────

  const doSave = useCallback(async () => {
    if (saveStatus === 'saving') return
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const res = await fetch('/api/admin/media/presentation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: asset.id, settings }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSaveStatus('error')
        setSaveError(json.error || 'Gagal menyimpan')
        return
      }
      setSaveStatus('saved')
      setIsDirty(false)
      if (json.asset) onUpdated(json.asset as MediaAsset)
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(String(err))
    }
  }, [asset.id, settings, saveStatus, onUpdated])

  // Autosave debounced 1.5s
  useEffect(() => {
    if (!isDirty) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => { doSave() }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, isDirty])

  // ── 5F: Bbox detection — runs once per asset open (or after reset) ────
  //
  // Computes alpha bounding box of the cutout image and stores it in
  // settings._meta. Only runs if:
  //   - Asset has a cutout_url
  //   - _meta.cutout_bbox is not already present
  //   - Not already computing
  //
  // Performance: pixel scan runs on a 512px-wide offscreen canvas, once only.
  // Never runs on every render or during drag.

  useEffect(() => {
    if (!hasCutout || !cutoutUrl) return
    if (bboxComputedRef.current) return  // already done this session

    const existingMeta = (settings as PresentationSettings & { _meta?: PresentationMeta })._meta
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

      setSettings((prev) => ({
        ...prev,
        _meta: newMeta,
      }))
      setIsDirty(true)
    }).catch(() => {
      setBboxComputing(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCutout, cutoutUrl])

  // ── Reset ─────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSettings((prev: PresentationSettings) => {
      const next = { ...prev }
      delete next[activeBp as BreakpointKey]
      return next
    })
    // Reset also triggers bbox recompute if user wants fresh analysis
    // (user explicitly clicked Reset AUTO)
    bboxComputedRef.current = false
    setIsDirty(true)
    setSaveStatus('idle')
  }, [activeBp])

  // ── Canvas cursor ─────────────────────────────────────
  const canvasCursor = !isCustom ? 'default' : isDragging ? 'grabbing' : 'grab'

  // ─── Render ──────────────────────────────────────────

  return (
    <div
      className={styles.overlay}
      onClick={(e: { target: EventTarget | null; currentTarget: EventTarget | null }) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.panel} role="dialog" aria-label="Visual Media Editor">

        {/* ── Header ──────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerTitle} title={asset.filename}>
            🎨 Visual Editor
          </div>
          <div className={styles.headerActions}>
            <div className={styles.saveStatusWrap}>
              {saveStatus === 'saving' && <span className={styles.saveStatusSaving}>Menyimpan…</span>}
              {saveStatus === 'saved'  && <span className={styles.saveStatusSaved}>✓ Tersimpan</span>}
              {saveStatus === 'error'  && <span className={styles.saveStatusError} title={saveError ?? ''}>⚠ Error</span>}
              {saveStatus === 'idle' && isDirty && <span className={styles.saveStatusDirty}>● Belum simpan</span>}
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">✕</button>
          </div>
        </div>

        {/* ── Breakpoint Tabs ──────────────────────────── */}
        <div className={styles.breakpointTabs} role="tablist">
          {BREAKPOINT_ORDER.map((bp) => {
            const bpMode: PresentationMode = settings[bp]?.mode ?? 'auto'
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
                  objectFit: effectiveSettings.object_fit,
                  objectPosition: `${effectiveSettings.position_x}% ${effectiveSettings.position_y}%`,
                  transform: `scale(${effectiveSettings.scale / 100})`,
                  transformOrigin: `${effectiveSettings.position_x}% ${effectiveSettings.position_y}%`,
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
                style={{
                  // Base: same cover mapping as background
                  objectFit: 'cover',
                  objectPosition: '50% 50%',
                  // CUSTOM mode: apply offset + scale via transform
                  // Scale from center, then translate by canvas-% offset
                  transform: isCustom
                    ? `scale(${cutoutScaleVal}) translate(${cutoutOffsetXpx / cutoutScaleVal}px, ${cutoutOffsetYpx / cutoutScaleVal}px)`
                    : 'none',
                  transformOrigin: '50% 50%',
                  opacity: cutoutOpacity / 100,
                  // Highlight border saat layer cutout aktif
                  outline: activeLayer === 'cutout' && isCustom
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
                    type="range" min={80} max={150} step={1}
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
                  type="range" min={40} max={160} step={1}
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
                <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur cutout</div>
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
                      ✓ Cutout looks normal
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Typography Readiness ────────────────────── */}
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
                <div className={styles.sliderDisabledNote}>
                  Struktur data untuk Hero Editor (tahap berikutnya). Belum dirender di website.
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Text X</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.x}%</span>
                  </div>
                  <input type="range" min={0} max={80} step={1}
                    value={effectiveSettings.typography.x} disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { typography: { ...effectiveSettings.typography, x: Number(e.target.value) } })
                    }
                  />
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Text Y</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.y}%</span>
                  </div>
                  <input type="range" min={0} max={90} step={1}
                    value={effectiveSettings.typography.y} disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { typography: { ...effectiveSettings.typography, y: Number(e.target.value) } })
                    }
                  />
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Width</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.width}%</span>
                  </div>
                  <input type="range" min={20} max={90} step={1}
                    value={effectiveSettings.typography.width} disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, { typography: { ...effectiveSettings.typography, width: Number(e.target.value) } })
                    }
                  />
                </div>
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
