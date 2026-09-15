'use client'

/**
 * JAECOO Palembang — Unified Visual Editor
 * Step 9: Menyatukan Image Editor, Text Editor, Positioning,
 *         dan Responsive Live Preview dalam SATU halaman.
 *
 * KRITIS: Semua sub-komponen (HomepageSectionPreview, InlineMediaTrigger)
 * WAJIB dideklarasikan DI LUAR fungsi UnifiedEditor untuk mencegah
 * bug keyboard iPhone (keyboard menutup tiap ketikan).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { saveHomepageContent } from './actions';
import { MediaPicker } from '@/components/admin/media/MediaPicker';
import AIReadyField from '@/components/admin/ai/AIReadyField';
import type { MediaAsset } from '@/lib/types/media-asset';
import styles from './unified-editor.module.css';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'hero',           label: 'Hero' },
  { id: 'experience',     label: 'Experience' },
  { id: 'technology',     label: 'Technology' },
  { id: 'about',          label: 'About' },
  { id: 'dealer_location',label: 'Dealer' },
  { id: 'final_cta',      label: 'Final CTA' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ─────────────────────────────────────────────────────────────
// SUB-KOMPONEN: Inline Media Trigger
// WAJIB di luar UnifiedEditor → mencegah bug keyboard iPhone
// ─────────────────────────────────────────────────────────────

interface InlineMediaTriggerProps {
  label: string;
  url: string;
  onOpen: () => void;
}

function InlineMediaTrigger({ label, url, onOpen }: InlineMediaTriggerProps) {
  return (
    <div className={styles.mediaField}>
      <label>{label}</label>
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
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-KOMPONEN: Live Preview Renderer
// WAJIB di luar UnifiedEditor → mencegah bug keyboard iPhone
// ─────────────────────────────────────────────────────────────

interface PreviewData {
  desktop_image?: string;
  mobile_image?: string;
  text_position_mode?: 'auto' | 'manual';
  desktop_position?: { horizontal?: string; vertical?: string };
  mobile_position?: { horizontal?: string; vertical?: string };
  eyebrow?: string;
  headline?: string;
  title?: string;
  description?: string;
  ctaText?: string;
}

interface HomepageSectionPreviewProps {
  data: PreviewData;
  section: SectionId;
  device: 'desktop' | 'mobile';
}

function HomepageSectionPreview({ data, section, device }: HomepageSectionPreviewProps) {
  const bgImage =
    device === 'mobile'
      ? (data.mobile_image || data.desktop_image)
      : data.desktop_image;

  const isAuto = !data.text_position_mode || data.text_position_mode === 'auto';

  // AUTO POSITION ALGORITHM — heuristik premium otomotif
  let flexJustify = 'flex-start'; // horizontal
  let flexAlign = 'center';       // vertical
  let textAlign: 'left' | 'center' | 'right' = 'left';

  if (isAuto) {
    if (device === 'desktop') {
      const rightSections: SectionId[] = ['experience'];
      if (rightSections.includes(section)) {
        flexJustify = 'flex-end';
        textAlign = 'right';
      } else {
        flexJustify = 'flex-start';
        textAlign = 'left';
      }
      flexAlign = 'center';
    } else {
      // Mobile: teks di bawah agar subjek (mobil) terlihat
      flexJustify = 'center';
      flexAlign = 'flex-end';
      textAlign = 'center';
    }
  } else {
    // MANUAL OVERRIDE
    const pos = device === 'desktop' ? data.desktop_position : data.mobile_position;
    if (pos) {
      if (pos.horizontal === 'left')   { flexJustify = 'flex-start'; textAlign = 'left'; }
      if (pos.horizontal === 'center') { flexJustify = 'center'; textAlign = 'center'; }
      if (pos.horizontal === 'right')  { flexJustify = 'flex-end'; textAlign = 'right'; }

      if (pos.vertical === 'top')    flexAlign = 'flex-start';
      if (pos.vertical === 'center') flexAlign = 'center';
      if (pos.vertical === 'bottom') flexAlign = 'flex-end';
    }
  }

  // Gradient overlay dinamis
  let overlayGradient = 'none';
  if (bgImage) {
    if (flexAlign === 'flex-end') {
      overlayGradient = 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 65%)';
    } else if (flexJustify === 'flex-start') {
      overlayGradient = 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 65%)';
    } else if (flexJustify === 'flex-end') {
      overlayGradient = 'linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 65%)';
    } else {
      overlayGradient = 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)';
    }
  }

  const displayHeadline = data.headline || data.title || '';

  if (!bgImage && !displayHeadline && !data.description) {
    return (
      <div className={styles.pEmptyState}>
        <span className={styles.pEmptyIcon}>🖼</span>
        <span className={styles.pEmptyLabel}>Preview Kosong</span>
        <span className={styles.pEmptyHint}>Pilih gambar atau isi teks di panel kiri</span>
      </div>
    );
  }

  return (
    <div
      className={styles.previewSection}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundColor: bgImage ? 'transparent' : '#1c1c1c',
        justifyContent: flexJustify,
        alignItems: flexAlign,
        textAlign,
      }}
    >
      <div className={styles.premiumOverlay} style={{ background: overlayGradient }} />

      <div className={styles.previewContent}>
        {data.eyebrow && <span className={styles.pEyebrow}>{data.eyebrow}</span>}
        {displayHeadline && <h1 className={styles.pHeadline}>{displayHeadline}</h1>}
        {data.description && <p className={styles.pDesc}>{data.description}</p>}
        {data.ctaText && <button className={styles.pBtn}>{data.ctaText}</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN: Unified Editor
// ─────────────────────────────────────────────────────────────

interface UnifiedEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: Record<string, any>;
}

export default function UnifiedEditor({ initialData }: UnifiedEditorProps) {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>>(initialData || {});
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk MediaPicker modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    section: SectionId;
    field: 'desktop_image' | 'mobile_image';
  } | null>(null);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Update field di dalam section
  const updateField = useCallback((section: string, field: string, value: unknown) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown> || {}),
        [field]: value,
      },
    }));
    setIsDirty(true);
  }, []);

  // Handler save
  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveHomepageContent(data.id, data);
    setIsSaving(false);
    if (res.success) {
      setIsDirty(false);
      alert('Perubahan berhasil disimpan!');
    } else {
      alert('Gagal menyimpan: ' + res.error);
    }
  };

  // Handler back
  const handleBack = () => {
    if (isDirty) {
      if (confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Buka picker untuk field tertentu
  const openPicker = useCallback((section: SectionId, field: 'desktop_image' | 'mobile_image') => {
    setPickerTarget({ section, field });
    setPickerOpen(true);
  }, []);

  // Handle hasil pick media
  const handleMediaSelect = useCallback((asset: MediaAsset) => {
    if (!pickerTarget) return;
    const url = asset.public_url || '';
    updateField(pickerTarget.section, pickerTarget.field, url);
    setPickerOpen(false);
    setPickerTarget(null);
  }, [pickerTarget, updateField]);

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
    setPickerTarget(null);
  }, []);

  const currentData = data[activeSection] || {};
  const aiCtx = { pageType: 'homepage', sectionType: activeSection, language: 'id' };

  // Cek apakah section ini pakai headline atau title
  const hasEyebrow = activeSection === 'hero';
  const hasHeadline = activeSection === 'hero';
  const hasTitle = !hasHeadline;
  const hasCta = ['hero', 'promo', 'final_cta'].includes(activeSection);

  return (
    <>
      <div className={styles.unifiedLayout}>

        {/* ══ CONTROLS PANEL ══════════════════════════════════ */}
        <div className={styles.controlsPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <button type="button" onClick={handleBack} className={styles.btnBack}>
              ← Kembali
            </button>
            <h2 className={styles.panelTitle}>Visual Editor</h2>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={styles.btnSave}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          {/* Section Navigation */}
          <nav className={styles.sectionNav} role="tablist">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
                className={activeSection === s.id ? styles.navTabActive : styles.navTab}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Form Content */}
          <div className={styles.formContent}>

            {/* 1 ─ Visual Media */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>1. Visual Media (Cinematic)</p>
              <div className={styles.mediaGrid}>
                <InlineMediaTrigger
                  label="Desktop Image"
                  url={currentData.desktop_image || ''}
                  onOpen={() => openPicker(activeSection, 'desktop_image')}
                />
                <InlineMediaTrigger
                  label="Mobile Image"
                  url={currentData.mobile_image || ''}
                  onOpen={() => openPicker(activeSection, 'mobile_image')}
                />
              </div>
            </div>

            {/* 2 ─ Text Positioning */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>2. Text Positioning</p>

              <div className={styles.fieldRow}>
                <label>Mode Posisi</label>
                <select
                  value={currentData.text_position_mode || 'auto'}
                  onChange={(e) => updateField(activeSection, 'text_position_mode', e.target.value)}
                >
                  <option value="auto">AUTO — Cerdas & Seimbang</option>
                  <option value="manual">MANUAL — Override Responsif</option>
                </select>
              </div>

              {currentData.text_position_mode === 'manual' && (
                <div className={styles.manualControls}>
                  <div className={styles.manualDevice}>
                    <h4>Desktop</h4>
                    <select
                      value={currentData.desktop_position?.horizontal || 'left'}
                      onChange={(e) =>
                        updateField(activeSection, 'desktop_position', {
                          ...currentData.desktop_position,
                          horizontal: e.target.value,
                        })
                      }
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                    <select
                      value={currentData.desktop_position?.vertical || 'center'}
                      onChange={(e) =>
                        updateField(activeSection, 'desktop_position', {
                          ...currentData.desktop_position,
                          vertical: e.target.value,
                        })
                      }
                    >
                      <option value="top">Atas</option>
                      <option value="center">Tengah</option>
                      <option value="bottom">Bawah</option>
                    </select>
                  </div>
                  <div className={styles.manualDevice}>
                    <h4>Mobile</h4>
                    <select
                      value={currentData.mobile_position?.horizontal || 'center'}
                      onChange={(e) =>
                        updateField(activeSection, 'mobile_position', {
                          ...currentData.mobile_position,
                          horizontal: e.target.value,
                        })
                      }
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                    <select
                      value={currentData.mobile_position?.vertical || 'bottom'}
                      onChange={(e) =>
                        updateField(activeSection, 'mobile_position', {
                          ...currentData.mobile_position,
                          vertical: e.target.value,
                        })
                      }
                    >
                      <option value="top">Atas</option>
                      <option value="center">Tengah</option>
                      <option value="bottom">Bawah</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3 ─ Typography / Content */}
            <div className={styles.controlGroup}>
              <p className={styles.groupTitle}>3. Konten Teks</p>

              {hasEyebrow && (
                <AIReadyField
                  label="Eyebrow (Teks Kecil Atas)"
                  field="eyebrow"
                  value={currentData.eyebrow || ''}
                  onChange={(val) => updateField(activeSection, 'eyebrow', val)}
                  context={{ ...aiCtx, purpose: 'Eyebrow label atas headline' }}
                />
              )}

              {hasHeadline && (
                <AIReadyField
                  label="Headline (Judul Utama)"
                  field="headline"
                  value={currentData.headline || ''}
                  onChange={(val) => updateField(activeSection, 'headline', val)}
                  context={{ ...aiCtx, purpose: 'Main impact headline' }}
                />
              )}

              {hasTitle && (
                <AIReadyField
                  label="Judul Section"
                  field="title"
                  value={currentData.title || ''}
                  onChange={(val) => updateField(activeSection, 'title', val)}
                  context={{ ...aiCtx, purpose: 'Section title' }}
                />
              )}

              <AIReadyField
                label="Deskripsi"
                field="description"
                isTextArea
                rows={3}
                value={currentData.description || ''}
                onChange={(val) => updateField(activeSection, 'description', val)}
                context={{ ...aiCtx, purpose: 'Supporting description text' }}
              />

              {hasCta && (
                <>
                  <AIReadyField
                    label="CTA Label (Tombol)"
                    field="ctaText"
                    value={currentData.ctaText || ''}
                    onChange={(val) => updateField(activeSection, 'ctaText', val)}
                    context={{ ...aiCtx, purpose: 'Call-to-action button label' }}
                  />
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                      CTA URL (Link Tombol)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: /model/j7 atau https://wa.me/..."
                      value={currentData.ctaUrl || ''}
                      onChange={(e) => updateField(activeSection, 'ctaUrl', e.target.value)}
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

          </div>
        </div>

        {/* ══ PREVIEW CANVAS ══════════════════════════════════ */}
        <div className={styles.previewCanvas}>
          <div className={styles.previewToolbar}>
            <span className={styles.previewTitle}>Live Preview — {activeSection}</span>
            <div className={styles.deviceToggle}>
              <button
                type="button"
                className={previewDevice === 'desktop' ? styles.deviceBtnActive : styles.deviceBtn}
                onClick={() => setPreviewDevice('desktop')}
              >
                Desktop
              </button>
              <button
                type="button"
                className={previewDevice === 'mobile' ? styles.deviceBtnActive : styles.deviceBtn}
                onClick={() => setPreviewDevice('mobile')}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className={styles.previewWrapper}>
            <div
              className={`${styles.previewScreen} ${
                previewDevice === 'desktop' ? styles.screenDesktop : styles.screenMobile
              }`}
            >
              <HomepageSectionPreview
                data={currentData}
                section={activeSection}
                device={previewDevice}
              />
            </div>
          </div>
        </div>

      </div>

      {/* MediaPicker Modal — di luar layout untuk mencegah z-index conflict */}
      <MediaPicker
        open={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handleMediaSelect}
        title={`Pilih Gambar — ${SECTIONS.find(s => s.id === activeSection)?.label}`}
      />
    </>
  );
}
