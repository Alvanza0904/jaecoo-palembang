/**
 * JAECOO Palembang — Media Library (Client Component)
 * STEP 5D: Updated with processing status, variants, cutout display
 *
 * Features:
 * - Grid display with thumbnail, processing status badge
 * - Upload with progress → auto-trigger processing
 * - Media detail panel (click card → open detail)
 * - Search + category filter
 * - Delete with cleanup of all variants + cutout
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaAsset, MediaCategory } from '@/lib/types/media-asset'
import {
  MEDIA_CATEGORIES,
  validateFile,
  getImageDimensions,
  formatFileSize,
  PROCESSING_STATUS_LABEL,
  PROCESSING_STATUS_COLOR,
} from '@/lib/types/media-asset'
import { uploadToStorage, registerUploadedMedia, prepareStorageUpload } from '@/lib/media/direct-upload'
import { MediaDetail } from './MediaDetail'
import styles from './MediaLibrary.module.css'

/* ─── Helpers ────────────────────────────────────────── */

function isImage(mime: string) {
  return mime.startsWith('image/')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/* ─── Upload Zone ─────────────────────────────────────── */

interface UploadZoneProps {
  category: MediaCategory
  onUploaded: (asset: MediaAsset) => void
}

function UploadZone({ category, onUploaded }: UploadZoneProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) { setError(validationError); setStatus('error'); return }

    setStatus('uploading')
    setError(null)
    setProgress(10)

    let width: number | undefined
    let height: number | undefined
    if (isImage(file.type)) {
      try {
        const dims = await getImageDimensions(file)
        width = dims.width
        height = dims.height
      } catch { /* non-critical */ }
    }
    setProgress(30)

    const video = file.type.startsWith('video/')
    try {
      if (video) {
        await prepareStorageUpload()
        const path = await uploadToStorage(file, category, setProgress)
        const asset = await registerUploadedMedia({
          storage_path: path,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          category,
        })
        setProgress(100)
        setStatus('success')
        onUploaded(asset)
        setTimeout(() => { setStatus('idle'); setProgress(0) }, 2000)
        return
      }

      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', category)
      if (width)  fd.append('width', String(width))
      if (height) fd.append('height', String(height))

      setProgress(50)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
      setProgress(90)
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Upload gagal.'); setStatus('error'); return }
      setProgress(100)
      setStatus('success')
      onUploaded(json.asset)
      setTimeout(() => { setStatus('idle'); setProgress(0) }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Koneksi gagal. Periksa internet dan coba lagi.')
      setStatus('error')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={`${styles.uploadZone} ${dragOver ? styles.uploadZoneDrag : ''} ${status === 'error' ? styles.uploadZoneError : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => status !== 'uploading' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      {status === 'idle' && (
        <>
          <div className={styles.uploadIcon}>↑</div>
          <div className={styles.uploadTitle}>Upload Media</div>
          <div className={styles.uploadSub}>Klik atau seret file ke sini</div>
          <div className={styles.uploadHint}>Gambar maks. 10 MB · Video MP4/WebM maks. 50 MB</div>
        </>
      )}

      {status === 'uploading' && (
        <>
          <div className={styles.uploadProgress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.uploadSub}>Mengupload… {progress}%</div>
            {progress >= 90 && (
              <div className={styles.uploadHint}>Processing variants di background…</div>
            )}
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className={styles.uploadIcon} style={{ color: '#22c55e' }}>✓</div>
          <div className={styles.uploadTitle}>Upload berhasil!</div>
          <div className={styles.uploadHint}>Variants sedang diproses…</div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className={styles.uploadIcon} style={{ color: 'var(--color-error, #ef4444)' }}>⚠</div>
          <div className={styles.uploadTitle}>Upload gagal</div>
          <div className={styles.uploadError}>{error}</div>
          <div className={styles.uploadHint} style={{ marginTop: '0.5rem' }}>Klik untuk coba lagi</div>
        </>
      )}
    </div>
  )
}

/* ─── Media Card ──────────────────────────────────────── */

interface MediaCardProps {
  asset: MediaAsset
  onDeleted: (id: string) => void
  onSelect?: (asset: MediaAsset) => void
  selectable?: boolean
  onOpenDetail: (asset: MediaAsset) => void
}

function MediaCard({ asset, onDeleted, onSelect, selectable, onOpenDetail }: MediaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDeleted(asset.id)
      } else {
        const j = await res.json()
        alert('Gagal hapus: ' + (j.error || 'Unknown error'))
      }
    } catch {
      alert('Koneksi gagal saat hapus. Coba lagi.')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const url = asset.public_url ?? ''
  const isImg = isImage(asset.mime_type)
  const status = asset.processing_status ?? 'uploaded'
  const statusColor = PROCESSING_STATUS_COLOR[status]
  const hasVariants = Object.keys(asset.variants ?? {}).length > 0
  const hasCutout = !!asset.cutout_url

  return (
    <div
      className={`${styles.card} ${selectable ? styles.cardSelectable : ''}`}
      onClick={() => onOpenDetail(asset)}
    >
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {isImg && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={asset.filename} className={styles.thumbImg} loading="lazy" />
        ) : asset.mime_type.startsWith('video/') && url ? (
          <video src={url} className={styles.thumbImg} muted playsInline preload="metadata" />
        ) : (
          <div className={styles.thumbPlaceholder}>
            {asset.mime_type.startsWith('video/') ? '▶' : '◈'}
          </div>
        )}

        {/* Processing status badge */}
        <div
          className={styles.statusBadge}
          style={{
            backgroundColor: statusColor + '33',
            color: statusColor,
            borderColor: statusColor + '55',
          }}
        >
          {PROCESSING_STATUS_LABEL[status]}
        </div>

        {selectable && (
          <div className={styles.selectOverlay} onClick={(e) => { e.stopPropagation(); onSelect?.(asset) }}>
            <span className={styles.selectBtn}>Pilih</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className={styles.cardBody}>
        <div className={styles.cardFilename} title={asset.filename}>{asset.filename}</div>
        <div className={styles.cardMeta}>
          <span className={styles.cardCategory}>{asset.category}</span>
          <span className={styles.cardSize}>{formatFileSize(asset.size_bytes)}</span>
        </div>
        {asset.width && asset.height && (
          <div className={styles.cardDim}>{asset.width} × {asset.height} px</div>
        )}

        {/* Variant + cutout indicators */}
        <div className={styles.cardIndicators}>
          {hasVariants && (
            <span className={styles.indicatorGreen} title="Responsive variants tersedia">
              ⊞ Variants
            </span>
          )}
          {hasCutout && (
            <span className={styles.indicatorGold} title="Cutout tersedia">
              ✂ Cutout
            </span>
          )}
        </div>

        <div className={styles.cardDate}>{formatDate(asset.created_at)}</div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        {selectable && (
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => onSelect?.(asset)}
          >
            ✓ Pilih
          </button>
        )}
        <button
          className={`${styles.actionBtn} ${confirmDelete ? styles.actionBtnDanger : ''}`}
          onClick={handleDelete}
          disabled={deleting}
          title={confirmDelete ? 'Klik lagi untuk konfirmasi hapus' : 'Hapus'}
          aria-label="Hapus media"
        >
          {deleting ? '…' : confirmDelete ? 'Hapus?' : '✕'}
        </button>
      </div>
    </div>
  )
}

/* ─── Main MediaLibrary ───────────────────────────────── */

interface MediaLibraryProps {
  onSelect?: (asset: MediaAsset) => void
  defaultCategory?: MediaCategory
  compact?: boolean
  imagesOnly?: boolean
}

export function MediaLibrary({ onSelect, defaultCategory, compact, imagesOnly = false }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>(defaultCategory ?? 'all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [detailAsset, setDetailAsset] = useState<MediaAsset | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/media?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memuat media')
      setAssets(json.assets)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  function handleUploaded(asset: MediaAsset) {
    setAssets((prev) => [asset, ...prev])
  }

  function handleDeleted(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
    if (detailAsset?.id === id) setDetailAsset(null)
  }

  function handleUpdated(updated: MediaAsset) {
    setAssets((prev) => prev.map((a) => a.id === updated.id ? updated : a))
    if (detailAsset?.id === updated.id) setDetailAsset(updated)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const selectable = !!onSelect

  return (
    <div className={`${styles.library} ${compact ? styles.libraryCompact : ''}`}>
      {/* Header */}
      {!compact && (
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Media Library</h1>
            <p className={styles.subtitle}>
              Upload dan kelola gambar — variants diproses otomatis, cutout tersedia via detail
            </p>
          </div>
        </div>
      )}

      <div className={styles.goldLine} />

      {/* Upload + Filters row */}
      <div className={styles.toolbar}>
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterBtn} ${category === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setCategory('all')}
          >
            Semua
          </button>
          {MEDIA_CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`${styles.filterBtn} ${category === c.value ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama file…"
            type="search"
          />
          <button className={styles.searchBtn} type="submit">Cari</button>
        </form>
      </div>

      <UploadZone
        category={(category !== 'all' ? category : 'system') as MediaCategory}
        onUploaded={handleUploaded}
      />

      {/* Stats */}
      {!loading && (
        <div className={styles.stats}>
          {assets.length} file
          {search && ` — hasil pencarian "${search}"`}
          {category !== 'all' && ` — kategori ${category}`}
          <span className={styles.statsHint}> · Klik kartu untuk detail & cutout</span>
        </div>
      )}

      {/* Grid */}
      {loading && (
        <div className={styles.loadingRow}>
          <div className={styles.spinner} />
          <span>Memuat media…</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <span>⚠ {error}</span>
          <button className={styles.retryBtn} onClick={fetchAssets}>Coba lagi</button>
        </div>
      )}

      {!loading && !error && assets.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◈</div>
          <div className={styles.emptyTitle}>Belum ada media</div>
          <div className={styles.emptyHint}>Upload file di atas untuk memulai.</div>
        </div>
      )}

      {!loading && assets.length > 0 && (
        <div className={styles.grid}>
          {(imagesOnly ? assets.filter((asset) => asset.mime_type.startsWith('image/')) : assets).map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              onDeleted={handleDeleted}
              onSelect={onSelect}
              selectable={selectable}
              onOpenDetail={setDetailAsset}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {detailAsset && (
        <MediaDetail
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
