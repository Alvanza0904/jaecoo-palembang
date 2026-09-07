/**
 * JAECOO Palembang — Visual Media Editor
 * STEP 5E: Breakpoint presentation editor for media assets
 *
 * Features:
 * - Per-breakpoint settings (desktop / tablet / mobile / small mobile)
 * - Live preview with focal point drag
 * - Position X/Y sliders
 * - Scale / zoom
 * - Object fit (cover / contain)
 * - Focal point picker
 * - AUTO / CUSTOM / INHERITED modes
 * - Responsive inheritance
 * - Cutout positioning (if asset has cutout)
 * - Typography placement readiness (data only)
 * - Save / autosave
 * - Mobile-first UX (44px touch targets)
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
  BREAKPOINT_ORDER,
  BREAKPOINT_LABELS,
  BREAKPOINT_PREVIEW_DIMS,
  BREAKPOINT_INHERIT_DEFAULTS,
  DEFAULT_BREAKPOINT_SETTINGS,
  resolveBreakpointSettings,
} from '@/lib/types/presentation'
import styles from './VisualMediaEditor.module.css'

// ─── Breakpoint icons ────────────────────────────────────

const BP_ICONS: Record<BreakpointKey, string> = {
  desktop:      '🖥',
  tablet:       '📱',
  mobile:       '📲',
  small_mobile: '📟',
}

// ─── Save status ─────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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
  // ── State ──────────────────────────────────────────────
  const [activeBp, setActiveBp] = useState<BreakpointKey>('desktop')
  const [settings, setSettings] = useState<PresentationSettings>(() => getStoredSettings(asset))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [cutoutView, setCutoutView] = useState<'background' | 'cutout'>('background')
  const [showTypography, setShowTypography] = useState(false)

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focalRef = useRef<HTMLDivElement | null>(null)

  const hasCutout = !!asset.cutout_url

  // ── Resolve effective settings for current bp ──────────
  const effectiveSettings: BreakpointSettings = resolveBreakpointSettings(
    settings,
    activeBp,
    asset.focal_x ?? 50,
    asset.focal_y ?? 50,
  )

  // Stored (may be partial/undefined)
  const stored = settings[activeBp as BreakpointKey] ?? {}

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
        // Copy current effective settings into custom, so Admin starts from current view
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
        updateBreakpoint(activeBp, {
          mode: 'inherited',
          inherit_from: defaultParent,
        })
      } else {
        // auto — clear custom settings for this bp
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

  const isCustom = effectiveSettings.mode === 'custom'
  const isInherited = effectiveSettings.mode === 'inherited'

  // ── Focal point drag on preview ───────────────────────

  const focalGridRef = useRef<HTMLDivElement | null>(null)
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

  const handleFocalPointerUp = useCallback(() => {
    setIsDraggingFocal(false)
  }, [])

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
      if (json.asset) {
        onUpdated(json.asset as MediaAsset)
      }
      // Auto-clear saved badge
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(String(err))
    }
  }, [asset.id, settings, saveStatus, onUpdated])

  // Autosave on change (debounced 1.5s)
  useEffect(() => {
    if (!isDirty) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      doSave()
    }, 1500)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, isDirty])

  // ── Reset breakpoint to auto ─────────────────────────

  const handleReset = useCallback(() => {
    setSettings((prev: PresentationSettings) => {
      const next = { ...prev }
      delete next[activeBp as BreakpointKey]
      return next
    })
    setIsDirty(true)
    setSaveStatus('idle')
  }, [activeBp])

  // ── Preview size ──────────────────────────────────────

  const dims = BREAKPOINT_PREVIEW_DIMS[activeBp as BreakpointKey]
  // Scale preview to max 320px width
  const maxW = 300
  const scale = Math.min(1, maxW / dims.width)
  const previewW = Math.round(dims.width * scale)
  const previewH = Math.round(dims.height * scale)

  // Image URL — use best variant for preview
  const previewUrl = (asset.variants as Record<string, string>)?.['768']
    ?? (asset.variants as Record<string, string>)?.['480']
    ?? asset.public_url
    ?? ''

  const cutoutUrl = asset.cutout_url ?? ''

  // ── Cutout computed style ─────────────────────────────

  const cutoutSettings: CutoutPlacement = isCustom
    ? { ...(DEFAULT_BREAKPOINT_SETTINGS.cutout), ...(stored.cutout ?? {}) }
    : effectiveSettings.cutout

  const cutoutLeft = (cutoutSettings.position_x / 100) * previewW
  const cutoutTop  = (cutoutSettings.position_y / 100) * previewH
  const cutoutSize = (cutoutSettings.scale / 100) * previewW

  // ─── Render ──────────────────────────────────────────

  return (
    <div className={styles.overlay} onClick={(e: { target: EventTarget | null; currentTarget: EventTarget | null }) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel} role="dialog" aria-label="Visual Media Editor">

        {/* ── Header ──────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerTitle} title={asset.filename}>
            🎨 Visual Editor
          </div>
          <div className={styles.headerActions}>
            <div className={styles.saveStatus}>
              {saveStatus === 'saving' && <span className={styles.saveStatusSaving}>Menyimpan…</span>}
              {saveStatus === 'saved' && <span className={styles.saveStatusSaved}>✓ Tersimpan</span>}
              {saveStatus === 'error' && (
                <span className={styles.saveStatusError} title={saveError ?? ''}>⚠ Error</span>
              )}
              {saveStatus === 'idle' && isDirty && (
                <span className={styles.saveStatus}>● Belum simpan</span>
              )}
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">✕</button>
          </div>
        </div>

        {/* ── Breakpoint Tabs ──────────────────────────── */}
        <div className={styles.breakpointTabs} role="tablist">
          {BREAKPOINT_ORDER.map((bp) => {
            const bpStored = settings[bp]
            const bpMode: PresentationMode = bpStored?.mode ?? 'auto'
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

        {/* ── Preview Area ─────────────────────────────── */}
        <div className={styles.previewArea}>
          <div className={styles.previewLabel}>
            Preview — {BREAKPOINT_LABELS[activeBp as BreakpointKey]}
          </div>

          {/* Preview stage */}
          <div
            className={styles.previewStage}
            style={{ width: previewW, height: previewH }}
          >
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.previewImg}
                src={cutoutView === 'background' ? previewUrl : ''}
                alt={asset.alt_text ?? asset.filename}
                style={{
                  objectFit: effectiveSettings.object_fit,
                  objectPosition: `${effectiveSettings.position_x}% ${effectiveSettings.position_y}%`,
                  transform: `scale(${effectiveSettings.scale / 100})`,
                  transformOrigin: `${effectiveSettings.position_x}% ${effectiveSettings.position_y}%`,
                }}
              />
            )}

            {/* Cutout overlay */}
            {hasCutout && cutoutView === 'cutout' && (
              <div
                className={styles.previewCutout}
                style={{
                  left: cutoutLeft - cutoutSize / 2,
                  top:  cutoutTop - cutoutSize / 2,
                  width: cutoutSize,
                  height: cutoutSize,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.previewCutoutImg}
                  src={cutoutUrl}
                  alt="Cutout"
                />
              </div>
            )}

            {/* Focal marker */}
            {isCustom && (
              <div
                className={styles.focalMarker}
                style={{
                  left: `${effectiveSettings.focal_x}%`,
                  top:  `${effectiveSettings.focal_y}%`,
                }}
              >
                <div className={styles.focalMarkerInner} />
              </div>
            )}
          </div>

          <div className={styles.previewDims}>
            {dims.width}×{dims.height}px
          </div>
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
                  title={
                    m === 'inherited' && activeBp === 'desktop'
                      ? 'Desktop tidak bisa inherit'
                      : undefined
                  }
                >
                  {m === 'auto' ? 'AUTO' : m === 'custom' ? 'CUSTOM' : 'INHERIT'}
                </button>
              ))}
            </div>

            {/* Inherit source picker */}
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

          {/* ── Position ───────────────────────────────── */}
          <div className={styles.controlSection}>
            <div className={styles.controlSectionTitle}>Posisi Gambar</div>

            {/* Position X */}
            <div className={styles.sliderRow}>
              <div className={styles.sliderLabel}>
                <span className={styles.sliderLabelText}>Position X</span>
                <span className={styles.sliderValue}>{effectiveSettings.position_x}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={effectiveSettings.position_x}
                disabled={!isCustom}
                className={styles.slider}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateBreakpoint(activeBp, { position_x: Number(e.target.value) })
                }
              />
            </div>

            {/* Position Y */}
            <div className={styles.sliderRow}>
              <div className={styles.sliderLabel}>
                <span className={styles.sliderLabelText}>Position Y</span>
                <span className={styles.sliderValue}>{effectiveSettings.position_y}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={effectiveSettings.position_y}
                disabled={!isCustom}
                className={styles.slider}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateBreakpoint(activeBp, { position_y: Number(e.target.value) })
                }
              />
            </div>

            {!isCustom && (
              <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur posisi</div>
            )}
          </div>

          <div className={styles.divider} />

          {/* ── Scale ──────────────────────────────────── */}
          <div className={styles.controlSection}>
            <div className={styles.controlSectionTitle}>Zoom / Scale</div>
            <div className={styles.sliderRow}>
              <div className={styles.sliderLabel}>
                <span className={styles.sliderLabelText}>Scale</span>
                <span className={styles.sliderValue}>{effectiveSettings.scale}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={150}
                step={1}
                value={effectiveSettings.scale}
                disabled={!isCustom}
                className={styles.slider}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateBreakpoint(activeBp, { scale: Number(e.target.value) })
                }
              />
            </div>
            {!isCustom && (
              <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur zoom</div>
            )}
          </div>

          <div className={styles.divider} />

          {/* ── Object Fit ─────────────────────────────── */}
          <div className={styles.controlSection}>
            <div className={styles.controlSectionTitle}>Crop / Object Fit</div>
            <div className={styles.fitSelector}>
              {(['cover', 'contain'] as const).map((fit) => (
                <button
                  key={fit}
                  className={`${styles.fitBtn} ${effectiveSettings.object_fit === fit ? styles.fitBtnActive : ''}`}
                  onClick={() => {
                    if (!isCustom) return
                    updateBreakpoint(activeBp, { object_fit: fit })
                  }}
                  disabled={!isCustom}
                >
                  {fit === 'cover' ? '⊡ Cover' : '⬜ Contain'}
                </button>
              ))}
            </div>
            {!isCustom && (
              <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur crop</div>
            )}
          </div>

          <div className={styles.divider} />

          {/* ── Focal Point ────────────────────────────── */}
          <div className={styles.controlSection}>
            <div className={styles.controlSectionTitle}>Focal Point</div>
            <div className={styles.sliderRow}>
              <div className={styles.sliderLabel}>
                <span className={styles.sliderLabelText}>Focal X</span>
                <span className={styles.sliderValue}>{effectiveSettings.focal_x}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
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
                type="range"
                min={0}
                max={100}
                step={1}
                value={effectiveSettings.focal_y}
                disabled={!isCustom}
                className={styles.slider}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateBreakpoint(activeBp, { focal_y: Number(e.target.value) })
                }
              />
            </div>

            {/* Focal Grid — drag to pick focal point */}
            {isCustom && previewUrl && (
              <>
                <div className={styles.controlSectionTitle} style={{ marginTop: 4 }}>
                  Klik / drag gambar untuk pilih focal point
                </div>
                <div
                  ref={focalGridRef}
                  className={styles.focalGrid}
                  onPointerDown={handleFocalPointerDown}
                  onPointerMove={handleFocalPointerMove}
                  onPointerUp={handleFocalPointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Focal picker"
                    className={styles.focalGridImg}
                    draggable={false}
                  />
                  <div
                    className={styles.focalGridMarker}
                    style={{
                      left: `${effectiveSettings.focal_x}%`,
                      top:  `${effectiveSettings.focal_y}%`,
                    }}
                  />
                  <div className={styles.focalGridHint}>Seret untuk atur titik fokus</div>
                </div>
              </>
            )}

            {!isCustom && (
              <div className={styles.sliderDisabledNote}>Aktifkan CUSTOM untuk mengatur focal point</div>
            )}
          </div>

          {/* ── Cutout Settings ─────────────────────────── */}
          {hasCutout && (
            <>
              <div className={styles.divider} />
              <div className={styles.controlSection}>
                <div className={styles.controlSectionHeader}>
                  <div className={styles.controlSectionTitle}>Cutout / Kendaraan</div>
                  <div className={styles.cutoutTabs}>
                    <button
                      className={`${styles.cutoutTab} ${cutoutView === 'background' ? styles.cutoutTabActive : ''}`}
                      onClick={() => setCutoutView('background')}
                    >
                      BG
                    </button>
                    <button
                      className={`${styles.cutoutTab} ${cutoutView === 'cutout' ? styles.cutoutTabActive : ''}`}
                      onClick={() => setCutoutView('cutout')}
                    >
                      Cutout
                    </button>
                  </div>
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Cutout Position X</span>
                    <span className={styles.sliderValue}>{cutoutSettings.position_x}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
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
                    <span className={styles.sliderLabelText}>Cutout Position Y</span>
                    <span className={styles.sliderValue}>{cutoutSettings.position_y}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
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
                    <span className={styles.sliderLabelText}>Cutout Scale</span>
                    <span className={styles.sliderValue}>{cutoutSettings.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={160}
                    step={1}
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
            </>
          )}

          {/* ── Typography Readiness ────────────────────── */}
          <div className={styles.divider} />
          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeader}>
              <div className={styles.controlSectionTitle}>Typography Placement</div>
              <button
                className={styles.sectionCollapse}
                onClick={() => setShowTypography((v: boolean) => !v)}
                aria-label={showTypography ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showTypography ? '▲ Sembunyikan' : '▼ Tampilkan'}
              </button>
            </div>

            {showTypography && (
              <>
                <div className={styles.sliderDisabledNote}>
                  Data posisi typography disimpan untuk Hero Editor (tahap berikutnya). Belum dirender di website.
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Text X</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.x}%</span>
                  </div>
                  <input
                    type="range" min={0} max={80} step={1}
                    value={effectiveSettings.typography.x}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, {
                        typography: { ...effectiveSettings.typography, x: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Text Y</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.y}%</span>
                  </div>
                  <input
                    type="range" min={0} max={90} step={1}
                    value={effectiveSettings.typography.y}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, {
                        typography: { ...effectiveSettings.typography, y: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderLabel}>
                    <span className={styles.sliderLabelText}>Text Width</span>
                    <span className={styles.sliderValue}>{effectiveSettings.typography.width}%</span>
                  </div>
                  <input
                    type="range" min={20} max={90} step={1}
                    value={effectiveSettings.typography.width}
                    disabled={!isCustom}
                    className={styles.slider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBreakpoint(activeBp, {
                        typography: { ...effectiveSettings.typography, width: Number(e.target.value) },
                      })
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
