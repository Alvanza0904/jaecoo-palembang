/**
 * JAECOO Palembang — Homepage Editor (Client Component)
 *
 * Preview sekarang menggunakan HomepageSectionRenderer — komponen
 * yang sama persis dengan live website. TIDAK ada custom preview renderer.
 *
 * SINGLE SOURCE OF TRUTH:
 *   Live Website ──┐
 *                  ├── HomepageSectionRenderer ── CSS Module live
 *   Editor Preview ┘
 *
 * KRITIS: InlineMediaTrigger WAJIB dideklarasikan DI LUAR HomepageEditor
 * agar tidak remount saat parent state berubah (fix keyboard iPhone).
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import AIReadyField from '@/components/admin/ai/AIReadyField'
import type { MediaAsset } from '@/lib/types/media-asset'
import type { HomepageContent } from '@/types/homepage-content'
import type { SectionId as SharedSectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import { HomepagePreviewFrame } from './HomepagePreviewFrame'
import styles from './homepage.module.css'

// ─── Section Config ────────────────────────────────────────────

const SECTIONS = [
  { id: 'hero'           as const, label: 'Hero',          hasHeadline: true,  hasEyebrow: true,  hasCta: true  },
  { id: 'experience'     as const, label: 'Experience',    hasHeadline: false, hasEyebrow: false, hasCta: false },
  { id: 'technology'     as const, label: 'Teknologi',    hasHeadline: false, hasEyebrow: false, hasCta: false },
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
// Wrapper tipis di sekitar HomepageSectionRenderer (komponen live website).
// WAJIB dideklarasikan di luar HomepageEditor (mencegah remount).
//
// PERUBAHAN ARSITEKTUR:
// Sebelumnya: SectionPreview = komponen custom dengan CSS preview sendiri
// Sekarang:   SectionPreview = shell yang merender HomepageSectionRenderer
//             → Preview Editor = Live Website secara visual.

interface SectionPreviewProps {
  data: SectionData
  sectionId: SectionId
  device: 'desktop' | 'mobile'
}

function SectionPreview({ data, sectionId, device }: SectionPreviewProps) {
  const renderData: SectionRenderData = {
    desktop_image: data.desktop_image as string | undefined,
    mobile_image: data.mobile_image as string | undefined,
    eyebrow: data.eyebrow as string | undefined,
    headline: data.headline as string | undefined,
    title: data.title as string | undefined,
    description: data.description as string | undefined,
    ctaText: data.ctaText as string | undefined,
    ctaUrl: data.ctaUrl as string | undefined,
    address: data.address as string | undefined,
    // FIX PREVIEW SYNC: pass full MediaAsset → HomepageSectionRenderer render
    // LayeredHero dengan presentation_settings identik live website.
    heroMediaAsset: (data.heroMediaAsset as import('@/lib/types/media-asset').MediaAsset | undefined) ?? null,
  }

  const hasContent =
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

  return <HomepagePreviewFrame sectionId={sectionId as SharedSectionId} data={renderData} device={device} />
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
    // FIX PREVIEW SYNC: untuk hero desktop, simpan full MediaAsset agar
    // HomepageSectionRenderer bisa merender LayeredHero dengan
    // presentation_settings yang identik dengan live website.
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: url,
        // Simpan asset lengkap untuk section hero agar preview = live
        ...(sectionId === 'hero' && field === 'desktop_image'
          ? { heroMediaAsset: asset }
          : {}),
      },
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
  const aiCtx          = { pageType: 'homepage', sectionType: activeSection, purpose: '' }

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

            {/* ── 2. Layout ───────────────────────────────────── */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>2. Layout Preview</p>
              <p className={styles.layoutNote}>
                Tata letak, posisi gambar, typography, spacing, dan responsive mengikuti
                renderer visual website. Editor ini hanya mengubah konten yang memang diedit.
              </p>
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
