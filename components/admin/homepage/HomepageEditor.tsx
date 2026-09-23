/**
 * JAECOO Palembang — Homepage Editor (Client Component)
 *
 * FIX 2026-09-21: Full data flow — Visual Editor → Preview = Live Website
 *
 * Perubahan kunci:
 * - SectionData sekarang menyimpan `image` (full ResponsiveImage) setelah media dipilih
 * - SectionPreview meneruskan `image` ke SectionRenderData → resolveImage() pakai yang lengkap
 * - handleMediaSelect: setelah save ke content_media, fetch ulang ResponsiveImage lengkap
 *   (dengan presentation_settings) dan simpan sebagai `data.image`
 * - Untuk section hero: heroMediaAsset tetap diisi agar resolveHeroMedia() bisa pakai
 *   variants object (1920/1440/etc) yang lebih lengkap dari asset MediaAsset langsung
 *
 * ARSITEKTUR PREVIEW:
 *   Editor state.image (ResponsiveImage) → SectionPreview → HomepagePreviewFrame (iframe)
 *     → HomepagePreviewClient → HomepageSectionRenderer (mode=preview)
 *     = komponen yang sama persis dengan live website
 *
 * KRITIS: InlineMediaTrigger WAJIB dideklarasikan DI LUAR HomepageEditor
 * agar tidak remount saat parent state berubah (fix keyboard iPhone).
 */
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import AIReadyField from '@/components/admin/ai/AIReadyField'
import type { MediaAsset } from '@/lib/types/media-asset'
import type { ResponsiveImage } from '@/lib/types/media'
import type { HomepageContent } from '@/types/homepage-content'
import type { SectionId as SharedSectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import { HomepagePreviewFrame } from './HomepagePreviewFrame'
import styles from './homepage.module.css'

// ─── Section Config ────────────────────────────────────────────

const SECTIONS = [
  { id: 'hero'           as const, label: 'Hero',       hasHeadline: true,  hasEyebrow: true,  hasCta: true  },
  { id: 'experience'     as const, label: 'Experience', hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'technology'     as const, label: 'Teknologi',  hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'about'          as const, label: 'About',      hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'dealer_location'as const, label: 'Dealer',     hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'final_cta'      as const, label: 'Final CTA',  hasHeadline: false, hasEyebrow: false, hasCta: true  },
]

type SectionId = typeof SECTIONS[number]['id']

// SectionData menyimpan teks + visual (image = full ResponsiveImage)
type SectionData = Record<string, unknown>

// ─── Sub-komponen: InlineMediaTrigger ─────────────────────────

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
// Shell yang meneruskan data ke HomepagePreviewFrame (iframe).
// KRITIS: dideklarasikan di luar HomepageEditor (mencegah remount).

interface SectionPreviewProps {
  data: SectionData
  sectionId: SectionId
  device: 'desktop' | 'mobile'
  /** Saat true: user sedang di area Edit Text — badge TEXT PREVIEW muncul di iframe */
  textEditMode?: boolean
}

function SectionPreview({ data, sectionId, device, textEditMode = false }: SectionPreviewProps) {
  const renderData: SectionRenderData = {
    // FIX: teruskan full ResponsiveImage (membawa presentation_settings)
    // Priority 1: data.image = full object yang disimpan setelah media dipilih
    image: (data.image as ResponsiveImage | undefined) ?? undefined,
    // Fallback URL strings (untuk thumbnail + inisialisasi awal)
    desktop_image: data.desktop_image as string | undefined,
    mobile_image:  data.mobile_image  as string | undefined,
    // Content
    eyebrow:     data.eyebrow     as string | undefined,
    headline:    data.headline    as string | undefined,
    title:       data.title       as string | undefined,
    description: data.description as string | undefined,
    ctaText:     data.ctaText     as string | undefined,
    ctaUrl:      data.ctaUrl      as string | undefined,
    address:     data.address     as string | undefined,
    // Hero editor: full MediaAsset untuk resolveHeroMedia() di renderer
    heroMediaAsset: (data.heroMediaAsset as MediaAsset | undefined) ?? null,
  }

  const hasContent =
    renderData.image ||
    renderData.desktop_image ||
    renderData.mobile_image ||
    renderData.eyebrow ||
    renderData.headline ||
    renderData.title ||
    renderData.description

  if (!hasContent) {
    return (
      <div className={styles.previewEmpty}>
        <span className={styles.pEmptyIcon}>⬜</span>
        <span className={styles.pEmptyLabel}>Belum ada konten</span>
        <span className={styles.pEmptyHint}>Pilih gambar atau isi teks untuk preview</span>
      </div>
    )
  }

  return <HomepagePreviewFrame sectionId={sectionId as SharedSectionId} data={renderData} device={device} textEditMode={textEditMode} />
}

// ─── Helper: build ResponsiveImage dari MediaAsset ─────────────
// Digunakan setelah media dipilih untuk mengisi data.image dengan struktur
// yang identik dengan apa yang dikembalikan getHomeMedia() dari Supabase.
function mediaAssetToResponsiveImage(asset: MediaAsset): ResponsiveImage {
  const variants = asset.variants ?? {}
  const base = asset.public_url ?? undefined
  return {
    desktop:      variants['1920'] ?? variants['1440'] ?? base,
    tablet:       variants['1024'] ?? variants['768']  ?? base,
    mobile:       variants['768']  ?? variants['480']  ?? base,
    small_mobile: variants['480']  ?? base,
    alt:          asset.alt_text ?? asset.filename ?? '',
    width:        asset.width    ?? undefined,
    height:       asset.height   ?? undefined,
    focal_x:      asset.focal_x  ?? 50,
    focal_y:      asset.focal_y  ?? 50,
    cutout:       asset.cutout_url ?? undefined,
    presentation_settings: asset.presentation_settings,
  }
}

// ─── Main Component ───────────────────────────────────────────

interface HomepageEditorProps {
  initialData: HomepageContent
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function HomepageEditor({ initialData }: HomepageEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  // ── Contextual Text Preview ───────────────────────────────────
  // textEditMode = true ketika user aktif di salah satu field teks
  // (onFocus field), false ketika semua field blur.
  // Pendekatan explicit focus lebih reliable daripada IntersectionObserver
  // yang bergantung pada layout/scroll timing.
  const [textEditMode, setTextEditMode] = useState(false)
  const textFocusCountRef = useRef(0) // track berapa field yang sedang focused

  // Local state per section
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

  // ── Contextual Text Preview: reset saat section berubah ──────
  useEffect(() => {
    textFocusCountRef.current = 0
    setTextEditMode(false)
  }, [activeSection])

  // ── Contextual Text Preview: focus/blur handlers ──────────────
  // Dipanggil oleh onFocus/onBlur pada wrapper div "3. Konten Teks".
  // Menggunakan counter agar nested field tidak race (blur A → focus B).
  const handleTextGroupFocus = useCallback(() => {
    textFocusCountRef.current += 1
    setTextEditMode(true)
  }, [])

  const handleTextGroupBlur = useCallback(() => {
    // Delay agar focus berpindah antar field tidak trigger false negative
    setTimeout(() => {
      textFocusCountRef.current = Math.max(0, textFocusCountRef.current - 1)
      if (textFocusCountRef.current === 0) {
        setTextEditMode(false)
      }
    }, 100)
  }, [])

  // Update string field — hanya local state, ZERO network
  const updateField = useCallback((sectionId: SectionId, field: string, value: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }))
    setDirty(prev => ({ ...prev, [sectionId]: true }))
  }, [])

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

    // 1. Build ResponsiveImage lengkap dari asset (identik dengan getHomeMedia() output)
    const responsiveImage = mediaAssetToResponsiveImage(asset)

    // 2. Update local state secara atomik:
    //    - URL fields (untuk thumbnail InlineMediaTrigger)
    //    - image: full ResponsiveImage dengan presentation_settings
    //    - heroMediaAsset: full MediaAsset dengan variants object (hero only)
    setSectionStates(prev => {
      const current = prev[sectionId] ?? {}

      // Untuk desktop: ganti seluruh image object (karena desktop = primary)
      // Untuk mobile: update hanya mobile field di image, pertahankan desktop
      let updatedImage: ResponsiveImage
      if (field === 'desktop_image') {
        updatedImage = responsiveImage
      } else {
        // mobile: gabungkan dengan image yang sudah ada
        const existingImage = current.image as ResponsiveImage | undefined
        updatedImage = {
          ...(existingImage ?? {}),
          mobile:       responsiveImage.mobile ?? responsiveImage.desktop,
          small_mobile: responsiveImage.small_mobile ?? responsiveImage.mobile,
          // Mobile presentation_settings (jika ada) disimpan terpisah
          presentation_settings_mobile: responsiveImage.presentation_settings,
        } as ResponsiveImage
      }

      return {
        ...prev,
        [sectionId]: {
          ...current,
          [field]: url,
          image: updatedImage,
          // Hero: simpan full MediaAsset untuk resolveHeroMedia() variants lookup
          ...(sectionId === 'hero' && field === 'desktop_image'
            ? { heroMediaAsset: asset }
            : {}),
        },
      }
    })
    setDirty(prev => ({ ...prev, [sectionId]: true }))

    // 3. Persist ke content_media (Supabase)
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
          media_asset_id: asset.id ?? null,
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
      // Ekstrak hanya field teks untuk dikirim ke API (bukan image objects)
      const state = sectionStates[sectionId]
      const textPayload: Record<string, unknown> = {}
      const TEXT_FIELDS = ['eyebrow', 'headline', 'title', 'description', 'ctaText', 'ctaUrl', 'address']
      for (const field of TEXT_FIELDS) {
        if (field in state) textPayload[field] = state[field]
      }

      const res = await fetch('/api/admin/homepage-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [sectionId]: textPayload }),
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
  const section  = SECTIONS.find(s => s.id === activeSection)!
  const data     = sectionStates[activeSection]
  const status   = saveStatus[activeSection]
  const isDirty  = dirty[activeSection]
  const aiCtx    = { pageType: 'homepage', sectionType: activeSection, purpose: '' }

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

          {/* Form Content */}
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

            {/* ── 2. Layout ───────────────────────────────────── */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>2. Layout Visual</p>
              <p className={styles.layoutNote}>
                Posisi gambar, scale, typography, dan responsive settings dikontrol melalui
                Visual Media Editor saat memilih atau mengedit gambar di Media Library.
                Perubahan tersebut tersimpan di Supabase dan langsung muncul di Live Website setelah Save.
              </p>
            </div>

            {/* ── 3. Konten Teks ────────────────────────────── */}
            {/* onFocus/onBlur: aktifkan textEditMode saat user fokus ke field teks */}
            {/* Pendekatan ini reliable, tidak bergantung pada scroll/IntersectionObserver */}
            <div
              className={styles.controlGroup}
              onFocus={handleTextGroupFocus}
              onBlur={handleTextGroupBlur}
            >
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
              {textEditMode
                ? <>✏️ Text Preview — {section.label}</>
                : <>Live Preview — {section.label}</>
              }
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
              <SectionPreview data={data} sectionId={activeSection} device={previewDevice} textEditMode={textEditMode} />
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
        previewHeading={(sectionStates[activeSection]?.headline as string) || (sectionStates[activeSection]?.title as string) || 'JAECOO J5'}
        previewSubheading={(sectionStates[activeSection]?.description as string) || 'THIS IS THE REAL SUV.'}
        previewTagline={(sectionStates[activeSection]?.eyebrow as string) || section.label.toUpperCase()}
      />
    </>
  )
}
