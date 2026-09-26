/**
 * JAECOO Palembang — Media Picker (Reusable Modal)
 *
 * FIX 2026-09-22: Visual Editor sebagai Single Source of Truth
 *
 * Flow SEBELUM (broken):
 *   browse → pilih → onSelect(asset) → selesai
 *   → presentation_settings TIDAK pernah diatur untuk konteks ini
 *   → live website pakai fallback / settings dari session lain
 *
 * Flow SESUDAH (fixed):
 *   browse → pilih → VisualMediaEditor terbuka untuk asset ini
 *   → atur posisi/scale/typography/overlay
 *   → Simpan → presentation_settings tersimpan ke Supabase (media_assets)
 *   → onSelect(updatedAsset) dipanggil dengan asset terbaru
 *   → live website baca presentation_settings → layout benar
 *
 * VisualMediaEditor adalah SATU-SATUNYA tempat mengatur layout visual.
 * HomepageEditor, ModelEditor, dll hanya meneruskan asset yang sudah
 * di-configure via VisualMediaEditor.
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { MediaAsset, MediaCategory } from '@/lib/types/media-asset'
import { MediaLibrary } from './MediaLibrary'
import { VisualMediaEditor } from '@/components/admin/visual-editor'
import { VideoEditor } from './VideoEditor'
import styles from './MediaPicker.module.css'

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  defaultCategory?: MediaCategory
  title?: string
  /** Teks preview di VisualMediaEditor */
  previewHeading?: string
  previewSubheading?: string
  previewTagline?: string
  /** Live section frame, for example `exterior` or `home:experience`. */
  frameSlot?: string
  /** Poster picker: only images, skip the image visual editor. */
  imagesOnly?: boolean
  directSelect?: boolean
}

type Step = 'browse' | 'visual-editor'

export function MediaPicker({
  open,
  onClose,
  onSelect,
  defaultCategory,
  title,
  previewHeading,
  previewSubheading,
  previewTagline,
  frameSlot,
  imagesOnly = false,
  directSelect = false,
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

  // Close on Escape (hanya di step browse — Visual Editor punya Escape sendiri)
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

  // Step 1: user pilih gambar dari library → buka Visual Editor
  const handleLibrarySelect = useCallback((asset: MediaAsset) => {
    if (asset.mime_type.startsWith('video/')) {
      if (imagesOnly) return
      setSelectedAsset(asset)
      setStep('visual-editor')
      return
    }
    if (directSelect) {
      onSelect(asset)
      onClose()
      return
    }
    setSelectedAsset(asset)
    setStep('visual-editor')
  }, [directSelect, imagesOnly, onClose, onSelect])

  // Step 2a: user klik Simpan di Visual Editor
  // → asset sudah punya presentation_settings terbaru dari Supabase
  const handleVisualEditorUpdated = useCallback((updatedAsset: MediaAsset) => {
    setSelectedAsset(updatedAsset)
    // Tidak langsung close — user mungkin masih mau adjust
  }, [])

  // Step 2b: user klik Simpan & Gunakan (close Visual Editor)
  // → teruskan asset ke parent
  const handleVisualEditorClose = useCallback(() => {
    if (selectedAsset) {
      onSelect(selectedAsset)
    }
    onClose()
  }, [selectedAsset, onSelect, onClose])

  // Kembali ke browse tanpa memilih
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
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
      }}>
        {/* Back button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          background: '#111',
          borderBottom: '1px solid #222',
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={handleBackToBrowse}
            style={{
              background: 'none',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#9ca3af',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            ← Ganti Gambar
          </button>
          <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
            {title ?? 'Visual Editor'} — {selectedAsset.filename}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleVisualEditorClose}
              style={{
                background: '#b8953a',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                padding: '0.375rem 1rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              Gunakan {selectedAsset.mime_type.startsWith('video/') ? 'Video' : 'Gambar'} Ini →
            </button>
          </div>
        </div>

        {/* Visual Editor */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {selectedAsset.mime_type.startsWith('video/') ? (
            <VideoEditor
              asset={selectedAsset}
              onClose={handleVisualEditorClose}
              onUpdated={handleVisualEditorUpdated}
            />
          ) : (
            <VisualMediaEditor
              asset={selectedAsset}
              onClose={handleVisualEditorClose}
              onUpdated={handleVisualEditorUpdated}
              previewHeading={previewHeading}
              previewSubheading={previewSubheading}
              previewTagline={previewTagline ?? 'PREVIEW'}
              frameSlot={frameSlot}
            />
          )}
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
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title ?? 'Pilih Media'}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <MediaLibrary
            onSelect={handleLibrarySelect}
            defaultCategory={defaultCategory}
            compact
            imagesOnly={imagesOnly}
          />
        </div>
      </div>
    </div>
  )
}
