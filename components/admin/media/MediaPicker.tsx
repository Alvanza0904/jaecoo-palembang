/**
 * JAECOO Palembang — Media Picker (Reusable Modal)
 *
 * FIX 2026-09-22: Visual Editor sebagai Single Source of Truth
 *
 * Flow DEFAULT (untuk hero/section images yang butuh layout control):
 *   browse → pilih → VisualMediaEditor (atur posisi/scale/typography)
 *   → Simpan → presentation_settings ke Supabase
 *   → "Gunakan Gambar Ini" → onSelect(updatedAsset)
 *
 * Flow SIMPLE (skipVisualEditor=true, untuk color/promo/news cover):
 *   browse → pilih → onSelect(asset) langsung
 *
 * Props:
 *   skipVisualEditor?: boolean — default false
 *     Set true untuk picker yang tidak butuh layout control
 *     (color swatches, promo thumbnail, news cover sederhana)
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { MediaAsset, MediaCategory } from '@/lib/types/media-asset'
import { MediaLibrary } from './MediaLibrary'
import { VisualMediaEditor } from '@/components/admin/visual-editor'
import styles from './MediaPicker.module.css'

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  defaultCategory?: MediaCategory
  title?: string
  /** Jika true: skip Visual Editor, langsung onSelect setelah pilih gambar.
   *  Gunakan untuk picker yang tidak butuh layout control (color, promo thumb, dll).
   *  Default: false — artinya Visual Editor selalu terbuka untuk layout control. */
  skipVisualEditor?: boolean
  /** Teks preview di VisualMediaEditor */
  previewHeading?: string
  previewSubheading?: string
  previewTagline?: string
}

type Step = 'browse' | 'visual-editor'

export function MediaPicker({
  open,
  onClose,
  onSelect,
  defaultCategory,
  title,
  skipVisualEditor = false,
  previewHeading,
  previewSubheading,
  previewTagline,
}: MediaPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('browse')
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)

  // Reset ke browse setiap kali picker dibuka
  useEffect(() => {
    if (open) {
      setStep('browse')
      setSelectedAsset(null)
    }
  }, [open])

  // Close on Escape (hanya di step browse)
  useEffect(() => {
    if (!open || step !== 'browse') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  // Prevent body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Step 1: pilih gambar dari library
  const handleLibrarySelect = useCallback((asset: MediaAsset) => {
    if (skipVisualEditor) {
      // Mode simple: langsung selesai
      onSelect(asset)
      onClose()
      return
    }
    // Mode layout: buka Visual Editor
    setSelectedAsset(asset)
    setStep('visual-editor')
  }, [skipVisualEditor, onSelect, onClose])

  // Visual Editor: update asset (autosave sudah terjadi di dalamnya)
  const handleVisualEditorUpdated = useCallback((updatedAsset: MediaAsset) => {
    setSelectedAsset(updatedAsset)
  }, [])

  // "Gunakan Gambar Ini" — selesai, kirim ke parent
  const handleConfirm = useCallback(() => {
    if (selectedAsset) {
      onSelect(selectedAsset)
    }
    onClose()
  }, [selectedAsset, onSelect, onClose])

  // Kembali ke browse
  const handleBackToBrowse = useCallback(() => {
    setStep('browse')
    setSelectedAsset(null)
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }, [onClose])

  if (!open) return null

  // ── Step 2: Visual Editor ─────────────────────────────────
  if (step === 'visual-editor' && selectedAsset) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', background: '#000',
      }}>
        {/* Toolbar atas */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.625rem 1rem', background: '#111',
          borderBottom: '1px solid #222', flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={handleBackToBrowse}
            style={{
              background: 'none', border: '1px solid #374151',
              borderRadius: '6px', color: '#9ca3af',
              padding: '0.375rem 0.75rem', cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            ← Ganti Gambar
          </button>
          <span style={{ color: '#6b7280', fontSize: '0.8125rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title ?? 'Visual Editor'} — {selectedAsset.filename}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              background: '#b8953a', border: 'none', borderRadius: '6px',
              color: '#000', padding: '0.375rem 1rem',
              cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Gunakan Gambar Ini →
          </button>
        </div>

        {/* Visual Editor */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <VisualMediaEditor
            asset={selectedAsset}
            onClose={handleConfirm}
            onUpdated={handleVisualEditorUpdated}
            previewHeading={previewHeading}
            previewSubheading={previewSubheading}
            previewTagline={previewTagline ?? 'PREVIEW'}
          />
        </div>
      </div>
    )
  }

  // ── Step 1: Browse ────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal
      aria-label={title ?? 'Pilih Media'}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title ?? 'Pilih Media'}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <MediaLibrary
            onSelect={handleLibrarySelect}
            defaultCategory={defaultCategory}
            compact
          />
        </div>
      </div>
    </div>
  )
}
