/**
 * JAECOO Palembang — Media Detail Panel
 * STEP 5D: Full detail view for a media asset
 *
 * Shows:
 * - Preview original
 * - Dimensions, file size, format
 * - Processing status
 * - Responsive variants availability
 * - Cutout availability + preview
 * - Background removal trigger
 * - Re-process variants button
 */

'use client'

import { useState, useCallback } from 'react'
import type { MediaAsset } from '@/lib/types/media-asset'
import {
  formatFileSize,
  PROCESSING_STATUS_LABEL,
  PROCESSING_STATUS_COLOR,
} from '@/lib/types/media-asset'
import { BackgroundRemoval } from './BackgroundRemoval'
import { VisualMediaEditor } from '@/components/admin/visual-editor'
import styles from './MediaDetail.module.css'

interface Props {
  asset: MediaAsset
  onClose: () => void
  onUpdated: (asset: MediaAsset) => void
}

const VARIANT_KEYS = ['1920', '1440', '1024', '768', '480', 'thumb'] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function MediaDetail({ asset: initialAsset, onClose, onUpdated }: Props) {
  const [asset, setAsset] = useState<MediaAsset>(initialAsset)
  const [reprocessing, setReprocessing] = useState(false)
  const [reprocessError, setReprocessError] = useState<string | null>(null)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const [altText, setAltText] = useState(initialAsset.alt_text ?? '')
  const [focalX, setFocalX] = useState(initialAsset.focal_x ?? 50)
  const [focalY, setFocalY] = useState(initialAsset.focal_y ?? 50)
  const [metaSaving, setMetaSaving] = useState(false)
  const [metaMessage, setMetaMessage] = useState<string | null>(null)

  async function saveMetadata() {
    setMetaSaving(true); setMetaMessage(null)
    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: altText, focal_x: focalX, focal_y: focalY }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan metadata.')
      setAsset(json.asset); onUpdated(json.asset); setMetaMessage('Metadata tersimpan ✓')
    } catch (e) { setMetaMessage(e instanceof Error ? e.message : 'Gagal menyimpan metadata.') }
    finally { setMetaSaving(false) }
  }

  function handleCutoutComplete(updatedAsset: MediaAsset) {
    setAsset(updatedAsset)
    onUpdated(updatedAsset)
  }

  const handleReprocess = useCallback(async () => {
    setReprocessing(true)
    setReprocessError(null)
    try {
      const res = await fetch('/api/admin/media/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: asset.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setReprocessError(json.error || 'Processing gagal')
        return
      }
      if (json.asset) {
        setAsset(json.asset)
        onUpdated(json.asset)
      }
    } catch (err) {
      setReprocessError(String(err))
    } finally {
      setReprocessing(false)
    }
  }, [asset.id, onUpdated])

  const variants = (asset.variants ?? {}) as Record<string, string>
  const isImage = asset.mime_type.startsWith('image/')
  const statusColor = PROCESSING_STATUS_COLOR[asset.processing_status ?? 'uploaded']

  return (
    <>
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle} title={asset.filename}>
            {asset.filename}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        <div className={styles.panelBody}>
          {/* Preview */}
          <div className={styles.previewSection}>
            {isImage && asset.public_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={asset.public_url}
                alt={asset.alt_text ?? asset.filename}
                className={styles.previewImg}
              />
            ) : (
              <div className={styles.previewPlaceholder}>
                {asset.mime_type.startsWith('video/') ? '▶ Video' : '◈'}
              </div>
            )}
          </div>

          {/* Processing Status */}
          <div className={styles.statusSection}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Status</span>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: statusColor + '22', color: statusColor, borderColor: statusColor + '44' }}
              >
                {PROCESSING_STATUS_LABEL[asset.processing_status ?? 'uploaded']}
              </span>
            </div>
            {asset.processing_error && (
              <div className={styles.processingError}>
                ⚠ {asset.processing_error}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className={styles.metaSection}>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>Format</span>
                <span className={styles.metaVal}>{asset.mime_type.split('/')[1].toUpperCase()}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>Ukuran</span>
                <span className={styles.metaVal}>{formatFileSize(asset.size_bytes)}</span>
              </div>
              {asset.width && asset.height && (
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Dimensi</span>
                  <span className={styles.metaVal}>{asset.width} × {asset.height}</span>
                </div>
              )}
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>Kategori</span>
                <span className={styles.metaVal}>{asset.category}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>Upload</span>
                <span className={styles.metaVal}>{formatDate(asset.created_at)}</span>
              </div>
            </div>
          </div>

          <div className={styles.metaSection}>
            <div className={styles.sectionTitle}>Accessibility & Focal Point</div>
            <label className={styles.metaKey} htmlFor="media-alt">Alt text</label>
            <input id="media-alt" value={altText} onChange={e => setAltText(e.target.value)} className={styles.metaInput} placeholder="Deskripsi singkat image" />
            <div className={styles.focalGrid}>
              <label className={styles.metaKey}>Focal X <input type="number" min="0" max="100" value={focalX} onChange={e=>setFocalX(Number(e.target.value))} /></label>
              <label className={styles.metaKey}>Focal Y <input type="number" min="0" max="100" value={focalY} onChange={e=>setFocalY(Number(e.target.value))} /></label>
            </div>
            <button className={styles.reprocessBtn} onClick={saveMetadata} disabled={metaSaving}>{metaSaving ? 'Menyimpan…' : 'Save metadata'}</button>
            {metaMessage && <div className={styles.reprocessError}>{metaMessage}</div>}
            <div className={styles.fieldNote}>Description belum tersedia di schema media_assets saat ini; tidak dibuat kolom paralel pada Step 8.6.</div>
          </div>

          {/* Variants */}
          {isImage && (
            <div className={styles.variantsSection}>
              <div className={styles.sectionTitle}>Responsive Variants</div>
              <div className={styles.variantGrid}>
                <div className={styles.variantRow}>
                  <span className={styles.variantLabel}>Original</span>
                  <span className={styles.variantCheck}>✓</span>
                </div>
                {VARIANT_KEYS.map((key) => {
                  const url = variants[key]
                  return (
                    <div className={styles.variantRow} key={key}>
                      <span className={styles.variantLabel}>
                        {key === 'thumb' ? 'Thumbnail' : `${key}px`}
                      </span>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.variantCheck}
                          title="Buka variant"
                        >
                          ✓
                        </a>
                      ) : (
                        <span className={styles.variantMissing}>—</span>
                      )}
                    </div>
                  )
                })}
                <div className={styles.variantRow}>
                  <span className={styles.variantLabel}>Cutout</span>
                  {asset.cutout_url ? (
                    <a
                      href={asset.cutout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.variantCheck}
                      title="Buka cutout"
                    >
                      ✓
                    </a>
                  ) : (
                    <span className={styles.variantMissing}>—</span>
                  )}
                </div>
              </div>

              {/* Re-process button */}
              {isImage && (
                <div className={styles.reprocessRow}>
                  <button
                    className={styles.reprocessBtn}
                    onClick={handleReprocess}
                    disabled={reprocessing}
                  >
                    {reprocessing ? '⟳ Processing…' : '⟳ Buat Ulang Variants'}
                  </button>
                  {reprocessError && (
                    <div className={styles.reprocessError}>{reprocessError}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Visual Editor Button */}
          {isImage && (
            <div className={styles.reprocessRow} style={{ marginBottom: 0 }}>
              <button
                className={styles.reprocessBtn}
                style={{ background: 'var(--color-gold)', color: '#111', borderColor: 'var(--color-gold)' }}
                onClick={() => setShowVisualEditor(true)}
              >
                🎨 Buka Visual Editor
              </button>
            </div>
          )}

          {/* Background Removal */}
          {isImage && (
            <BackgroundRemoval
              asset={asset}
              onComplete={handleCutoutComplete}
            />
          )}

          {/* URL copy */}
          <div className={styles.urlSection}>
            <div className={styles.sectionTitle}>URL Original</div>
            <div className={styles.urlRow}>
              <code className={styles.urlCode}>
                {asset.public_url ?? '—'}
              </code>
              {asset.public_url && (
                <button
                  className={styles.copyBtn}
                  onClick={async () => {
                    await navigator.clipboard.writeText(asset.public_url!)
                  }}
                  title="Salin URL"
                >
                  ⎘
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Visual Media Editor modal */}
    {showVisualEditor && (
      <VisualMediaEditor
        asset={asset}
        onClose={() => setShowVisualEditor(false)}
        onUpdated={(updated) => {
          setAsset(updated)
          onUpdated(updated)
        }}
      />
    )}
    </>
  )
}
