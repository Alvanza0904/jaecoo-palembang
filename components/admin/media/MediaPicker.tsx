/**
 * JAECOO Palembang — Media Picker (Reusable Modal)
 * STEP 5C: Reusable picker for Model Editor and future use.
 *
 * Flow: open → browse/upload → select → confirm → close
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onSelect: (asset: MediaAsset) => void
 *   defaultCategory?: MediaCategory
 *   title?: string
 */

'use client'

import { useEffect, useRef } from 'react'
import type { MediaAsset, MediaCategory } from '@/lib/types/media-asset'
import { MediaLibrary } from './MediaLibrary'
import styles from './MediaPicker.module.css'

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  defaultCategory?: MediaCategory
  title?: string
}

export function MediaPicker({ open, onClose, onSelect, defaultCategory, title }: MediaPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  function handleSelect(asset: MediaAsset) {
    onSelect(asset)
    onClose()
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

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
            type="button" // FIX: Wajib agar tidak memicu submit form parent
            className={styles.closeBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // FIX: Cegah event bocor ke overlay
              onClose();
            }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Body — MediaLibrary in picker mode */}
        <div className={styles.modalBody}>
          <MediaLibrary
            onSelect={handleSelect}
            defaultCategory={defaultCategory}
            compact
          />
        </div>
      </div>
    </div>
  )
}
