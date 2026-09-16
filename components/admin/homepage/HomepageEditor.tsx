/**
 * JAECOO Palembang — Homepage Editor (Client Component)
 * Step 8.7 — Single-page editor:
 *   - Local state per section (FIX keyboard iPhone — tidak ada parent remount)
 *   - Image picker via content_media (arsitektur existing)
 *   - Live Preview per section (desktop/mobile toggle)
 *   - Save per section ke /api/admin/homepage-content (PATCH)
 *   - AIReadyField untuk semua text field
 *
 * KRITIS: InlineMediaTrigger & SectionPreview WAJIB dideklarasikan
 * DI LUAR HomepageEditor agar tidak remount saat parent state berubah.
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import AIReadyField from '@/components/admin/ai/AIReadyField'
import type { MediaAsset } from '@/lib/types/media-asset'
import type { HomepageContent } from '@/types/homepage-content'
import styles from './homepage.module.css'

// ─── Section Config ────────────────────────────────────────────

const SECTIONS = [
  { id: 'hero'           as const, label: 'Hero',          hasHeadline: true,  hasEyebrow: true,  hasCta: true  },
  { id: 'experience'     as const, label: 'Experience',    hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'technology'     as const, label: 'Technology',    hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'about'          as const, label: 'About',         hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'dealer_location'as const, label: 'Dealer',        hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'final_cta'      as const, label: 'Final CTA',     hasHeadline: false, hasEyebrow: false, hasCta: true  },
]

type SectionId = typeof SECTIONS[number]['id']

// Tipe fleksibel per section: teks string + visual object
type SectionData = Record<string, unknown>

// ─── Sub-komponen: InlineMediaTrigger ─────────────────────────
// WAJIB di luar HomepageEditor untuk mencegah remount + keyboard iPhone close

interface InlineMediaTriggerProps {
  label: string
  url: string | undefined
  onOpen: () => void
}

function InlineMediaTrigger({ label, url, onOpen }: InlineMediaTriggerProps) {
  return (
    <div className={styles.mediaField}>
      <span className={styles.mediaLabel}>{label}</span>
      <button
        type="button"
        className={styles.mediaTrigger}
        onClick={onOpen}
        aria-label={`Pilih ${label}`}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className={styles.mediaThumb} />
            <div className={styles.mediaOverlay}>
              <span className={styles.mediaOverlayLabel}>Ganti</span>
            </div>
          </>
        ) : (
          <div className={styles.mediaEmpty}>
            <span className={styles.mediaEmptyIcon}>🖼</span>
            <span className={styles.mediaEmptyLabel}>Pilih Gambar</span>
          </div>
        )}
      </button>
    </div>
  )
}

// ─── Sub-komponen: SectionPreview ──────────────────────────────
// WAJIB di luar HomepageEditor untuk mencegah remount

interface SectionPreviewProps {
  data: SectionData
  sectionId: SectionId
  device: 'desktop' | 'mobile'
}

function SectionPreview({ data, sectionId, device }: SectionPreviewProps) {
  const bgImage = device === 'mobile'
    ? ((data.mobile_image as string | undefined) || (data.desktop_image as string | undefined))
    : (data.desktop_image as string | undefined)

  const posMode = data.text_position_mode as string | undefined
  const isAuto = !posMode || posMode === 'auto'

  let flexJustify = 'flex-start'
  let flexAlign = 'center'
  let textAlign: 'left' | 'center' | 'right' = 'left'

  if (isAuto) {
    if (device === 'desktop') {
      if (sectionId === 'experience') { flexJustify = 'flex-end'; textAlign = 'right' }
      else                            { flexJustify = 'flex-start'; textAlign = 'left' }
      flexAlign = 'center'
    } else {
      flexJustify = 'center'; flexAlign = 'flex-end'; textAlign = 'center'
    }
  } else {
    const pos = device === 'desktop'
      ? (data.desktop_position as Record<string,string> | undefined)
      : (data.mobile_position  as Record<string,string> | undefined)
    if (pos) {
      if (pos.horizontal === 'left')   { flexJustify = 'flex-start'; textAlign = 'left' }
      if (pos.horizontal === 'center') { flexJustify = 'center';     textAlign = 'center' }
      if (pos.horizontal === 'right')  { flexJustify = 'flex-end';   textAlign = 'right' }
      if (pos.vertical   === 'top')    flexAlign = 'flex-start'
      if (pos.vertical   === 'center') flexAlign = 'center'
      if (pos.vertical   === 'bottom') flexAlign = 'flex-end'
    }
  }

  let overlay = 'none'
  if (bgImage) {
    if      (flexAlign   === 'flex-end')   overlay = 'linear-gradient(to top,  rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 65%)'
    else if (flexJustify === 'flex-start') overlay = 'linear-gradient(to right,rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 65%)'
    else if (flexJustify === 'flex-end')   overlay = 'linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 65%)'
    else                                   overlay = 'linear-gradient(to bottom,rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)'
  }

  const headline = (data.headline as string) || (data.title as string) || ''
  const desc     = (data.description as string) || ''
  const eyebrow  = (data.eyebrow    as string) || ''
  const ctaText  = (data.ctaText    as string) || ''

  if (!bgImage && !headline && !desc) {
    return (
      <div className={styles.previewEmpty}>
        <span className={styles.pEmptyIcon}>⬜</span>
        <span className={styles.pEmptyLabel}>Belum ada konten</span>
        <span className={styles.pEmptyHint}>Pilih gambar atau isi teks untuk preview</span>
      </div>
    )
  }

  return (
    <div
      className={styles.previewSection}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundColor: bgImage ? undefined : '#1a1a2e',
        alignItems: flexAlign,
        justifyContent: flexJustify,
      }}
    >
      <div className={styles.premiumOverlay} style={{ background: overlay }} />
      <div className={styles.previewContent} style={{ textAlign }}>
        {eyebrow  && <span className={styles.pEyebrow}>{eyebrow}</span>}
        {headline && <h2   className={styles.pHeadline}>{headline}</h2>}
        {desc     && <p    className={styles.pDesc}>{desc}</p>}
        {ctaText  && <span className={styles.pBtn}>{ctaText}</span>}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

interface HomepageEditorProps {
  initialData: HomepageContent
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function HomepageEditor({ initialData }: HomepageEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  // Local state per section — FIX: tidak ada parent re-render saat onChange
  const [sectionStates, setSectionStates] = useState<Record<SectionId, SectionData>>(() => {
    const init = {} as Record<SectionId, SectionData>
    for (const s of SECTIONS) {
      const raw = initialData[s.id as keyof HomepageContent]
      init[s.id] = (raw ?? {}) as SectionData
    }
    return init
  })

  // Picker state — satu MediaPicker global, di-mount sekali
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<{
    sectionId: SectionId
    field: 'desktop_image' | 'mobile_image'
  } | null>(null)

  // Save & dirty state per section
  const [saveStatus, setSaveStatus] = useState<Record<SectionId, SaveStatus>>({
    hero: 'idle', experience: 'idle', technology: 'idle',
    about: 'idle', dealer_location: 'idle', final_cta: 'idle',
  })
  const [dirty, setDirty] = useState<Record<SectionId, boolean>>({
    hero: false, experience: false, technology: false,
    about: false, dealer_location: false, final_cta: false,
  })

  // Browser warning saat ada unsaved changes
  useEffect(() => {
    const hasDirty = Object.values(dirty).some(Boolean)
    function handler(e: BeforeUnloadEvent) { e.preventDefault(); e.returnValue = '' }
    if (hasDirty) window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Update string field — hanya local state, ZERO network
  const updateField = useCallback((sectionId: SectionId, field: string, value: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }))
    setDirty(prev => ({ ...prev, [sectionId]: true }))
  }, [])

  // Update object field (desktop_position, mobile_position)
  const updatePositionField = useCallback((
    sectionId: SectionId,
    posField: 'desktop_position' | 'mobile_position',
    key: 'horizontal' | 'vertical',
    value: string
  ) => {
    setSectionStates(prev => {
      const cur = prev[sectionId]
      const existing = (cur[posField] as Record<string,string> | undefined) ?? {}
      return {
        ...prev,
        [sectionId]: { ...cur, [posField]: { ...existing, [key]: value } },
      }
    })
    setDirty(prev => ({ ...prev, [sectionId]: true }))
  }, [])

  // Buka picker
  const openPicker = useCallback((sectionId: SectionId, field: 'desktop_image' | 'mobile_image') => {
    setPickerTarget({ sectionId, field })
    setPickerOpen(true)
  }, [])

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false)
    setPickerTarget(null)
  }, [])

  // Pilih gambar → simpan ke local state + content_media
  const handleMediaSelect = useCallback(async (asset: MediaAsset) => {
    setPickerOpen(false)
    if (!pickerTarget) return
    const { sectionId, field } = pickerTarget
    const url = asset.public_url ?? undefined

    // 1. Local state segera (live preview instant)
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: url },
    }))
    setDirty(prev => ({ ...prev, [sectionId]: true }))

    // 2. Persist ke content_media (arsitektur existing — UUID valid, bukan "fallback-id")
    const breakpoint = field === 'desktop_image' ? 'desktop' : 'mobile'
    try {
      await fetch('/api/admin/content-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: 'home',
          content_key: 'home',
          slot_key: sectionId,
          breakpoint,
          media_asset_id: asset.id ?? null, // FIX UUID: null, bukan "fallback-id"
        }),
      })
    } catch {
      // Image sudah ada di local state → preview tetap berjalan
    }
    setPickerTarget(null)
  }, [pickerTarget])

  // Save section text ke homepage_content
  const saveSection = useCallback(async (sectionId: SectionId) => {
    setSaveStatus(prev => ({ ...prev, [sectionId]: 'saving' }))
    try {
      const res = await fetch('/api/admin/homepage-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [sectionId]: sectionStates[sectionId] }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error || 'Gagal menyimpan.')
      }
      setSaveStatus(prev => ({ ...prev, [sectionId]: 'saved' }))
      setDirty(prev => ({ ...prev, [sectionId]: false }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [sectionId]: 'idle' })), 2500)
    } catch {
      setSaveStatus(prev => ({ ...prev, [sectionId]: 'error' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [sectionId]: 'idle' })), 3000)
    }
  }, [sectionStates])

  // ── Derived ──────────────────────────────────────────────────
  const section        = SECTIONS.find(s => s.id === activeSection)!
  const data           = sectionStates[activeSection]
  const status         = saveStatus[activeSection]
  const isDirty        = dirty[activeSection]
  const posMode        = (data.text_position_mode as string) || 'auto'
  const desktopPos     = (data.desktop_position as Record<string,string> | undefined) ?? {}
  const mobilePos      = (data.mobile_position  as Record<string,string> | undefined) ?? {}
  const aiCtx          = { contentType: 'homepage', contentKey: activeSection, purpose: '' }

  const saveBtnLabel =
    status === 'saving' ? 'Menyimpan…'
    : status === 'saved' ? 'Tersimpan ✓'
    : status === 'error' ? 'Gagal ✕'
    : 'Simpan'

  return (
    <>
      <div className={styles.editorLayout}>

        {/* ══ CONTROLS PANEL ══════════════════════════════════ */}
        <div className={styles.controlsPanel}>

          {/* Panel Header */}
          <div className={styles.panelHeader}>
            <a href="/admin" className={styles.btnBack}>← Admin</a>
            <span className={styles.panelTitle}>Homepage Editor</span>
            <button
              type="button"
              className={styles.btnSave}
              onClick={() => saveSection(activeSection)}
              disabled={status === 'saving' || !isDirty}
            >
              {saveBtnLabel}
            </button>
          </div>

          {/* Section Tab Nav */}
          <nav className={styles.sectionNav} aria-label="Homepage sections">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                className={activeSection === s.id ? styles.navTabActive : styles.navTab}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
                {dirty[s.id] && <span className={styles.dirtyDot} aria-label="unsaved" />}
              </button>
            ))}
          </nav>

          {/* Form Content — scroll area */}
          <div className={styles.formContent}>

            {/* ── 1. Gambar ─────────────────────────────────── */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>1. Gambar Section</p>
              <div className={styles.mediaGrid}>
                <InlineMediaTrigger
                  label="Desktop"
                  url={data.desktop_image as string | undefined}
                  onOpen={() => openPicker(activeSection, 'desktop_image')}
                />
                <InlineMediaTrigger
                  label="Mobile (opsional)"
                  url={data.mobile_image as string | undefined}
                  onOpen={() => openPicker(activeSection, 'mobile_image')}
                />
              </div>
            </div>

            {/* ── 2. Posisi Teks ────────────────────────────── */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>2. Posisi Teks</p>
              <div className={styles.fieldRow}>
                <label>Mode</label>
                <select
                  value={posMode}
                  onChange={e => updateField(activeSection, 'text_position_mode', e.target.value)}
                >
                  <option value="auto">AUTO — Optimal per device</option>
                  <option value="manual">MANUAL — Override</option>
                </select>
              </div>

              {posMode === 'manual' && (
                <div className={styles.manualControls}>
                  <div className={styles.manualDevice}>
                    <h4>Desktop</h4>
                    <select
                      value={desktopPos.horizontal || 'left'}
                      onChange={e => updatePositionField(activeSection, 'desktop_position', 'horizontal', e.target.value)}
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                    <select
                      value={desktopPos.vertical || 'center'}
                      onChange={e => updatePositionField(activeSection, 'desktop_position', 'vertical', e.target.value)}
                    >
                      <option value="top">Atas</option>
                      <option value="center">Tengah</option>
                      <option value="bottom">Bawah</option>
                    </select>
                  </div>
                  <div className={styles.manualDevice}>
                    <h4>Mobile</h4>
                    <select
                      value={mobilePos.horizontal || 'center'}
                      onChange={e => updatePositionField(activeSection, 'mobile_position', 'horizontal', e.target.value)}
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                    <select
                      value={mobilePos.vertical || 'bottom'}
                      onChange={e => updatePositionField(activeSection, 'mobile_position', 'vertical', e.target.value)}
                    >
                      <option value="top">Atas</option>
                      <option value="center">Tengah</option>
                      <option value="bottom">Bawah</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Konten Teks ────────────────────────────── */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>3. Konten Teks</p>

              {section.hasEyebrow && (
                <AIReadyField
                  label="Eyebrow (Teks Kecil Atas)"
                  field="eyebrow"
                  value={(data.eyebrow as string) || ''}
                  onChange={val => updateField(activeSection, 'eyebrow', val)}
                  context={{ ...aiCtx, purpose: 'Eyebrow label atas headline' }}
                />
              )}

              {section.hasHeadline ? (
                <AIReadyField
                  label="Headline (Judul Utama)"
                  field="headline"
                  value={(data.headline as string) || ''}
                  onChange={val => updateField(activeSection, 'headline', val)}
                  context={{ ...aiCtx, purpose: 'Main impact headline' }}
                />
              ) : (
                <AIReadyField
                  label="Judul Section"
                  field="title"
                  value={(data.title as string) || ''}
                  onChange={val => updateField(activeSection, 'title', val)}
                  context={{ ...aiCtx, purpose: 'Section title' }}
                />
              )}

              <AIReadyField
                label="Deskripsi"
                field="description"
                isTextArea
                rows={3}
                value={(data.description as string) || ''}
                onChange={val => updateField(activeSection, 'description', val)}
                context={{ ...aiCtx, purpose: 'Supporting description text' }}
              />

              {activeSection === 'dealer_location' && (
                <AIReadyField
                  label="Alamat"
                  field="address"
                  isTextArea
                  rows={2}
                  value={(data.address as string) || ''}
                  onChange={val => updateField(activeSection, 'address', val)}
                  context={{ ...aiCtx, purpose: 'Dealer address' }}
                />
              )}

              {section.hasCta && (
                <>
                  <AIReadyField
                    label="CTA Label (Tombol)"
                    field="ctaText"
                    value={(data.ctaText as string) || ''}
                    onChange={val => updateField(activeSection, 'ctaText', val)}
                    context={{ ...aiCtx, purpose: 'Call-to-action button label' }}
                  />
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                      CTA URL (Link Tombol)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: /model/j7 atau https://wa.me/..."
                      value={(data.ctaUrl as string) || ''}
                      onChange={e => updateField(activeSection, 'ctaUrl', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #d1d5db)',
                        background: 'var(--color-surface, #ffffff)',
                        color: 'var(--color-ink, #111827)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Save feedback */}
            {status === 'error'  && <div className={styles.saveFeedbackError}>⚠ Gagal menyimpan. Periksa koneksi dan coba lagi.</div>}
            {status === 'saved'  && <div className={styles.saveFeedbackSuccess}>✓ Perubahan tersimpan</div>}

            <button
              type="button"
              className={styles.btnSaveBottom}
              onClick={() => saveSection(activeSection)}
              disabled={status === 'saving' || !isDirty}
            >
              {status === 'saving' ? 'Menyimpan…' : 'Simpan Perubahan'}
            </button>

          </div>
        </div>

        {/* ══ PREVIEW CANVAS ══════════════════════════════════ */}
        <div className={styles.previewCanvas}>
          <div className={styles.previewToolbar}>
            <span className={styles.previewTitle}>
              Live Preview — {section.label}
              {isDirty && <span className={styles.dirtyBadge}> • Belum disimpan</span>}
            </span>
            <div className={styles.deviceToggle}>
              <button
                type="button"
                className={previewDevice === 'desktop' ? styles.deviceBtnActive : styles.deviceBtn}
                onClick={() => setPreviewDevice('desktop')}
              >Desktop</button>
              <button
                type="button"
                className={previewDevice === 'mobile' ? styles.deviceBtnActive : styles.deviceBtn}
                onClick={() => setPreviewDevice('mobile')}
              >Mobile</button>
            </div>
          </div>
          <div className={styles.previewWrapper}>
            <div className={`${styles.previewScreen} ${previewDevice === 'desktop' ? styles.screenDesktop : styles.screenMobile}`}>
              <SectionPreview data={data} sectionId={activeSection} device={previewDevice} />
            </div>
          </div>
        </div>

      </div>

      {/* MediaPicker — di luar layout, z-index tidak conflict, mount sekali */}
      <MediaPicker
        open={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handleMediaSelect}
        title={`Pilih Gambar — ${section.label} (${pickerTarget?.field === 'mobile_image' ? 'Mobile' : 'Desktop'})`}
      />
    </>
  )
}
