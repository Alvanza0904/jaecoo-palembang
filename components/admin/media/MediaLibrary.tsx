/**
 * JAECOO Palembang — Media Library (Client Component)
 * STEP 5C: Full media management UI
 *
 * Features:
 * - Grid display with thumbnail, metadata
 * - Upload with progress, validation, error messages
 * - Search + category filter
 * - Delete confirmation
 * - Copy URL
 * - Mobile-friendly layout
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaAsset, MediaCategory } from '@/lib/types/media-asset'
import {
  MEDIA_CATEGORIES,
  validateFile,
  getImageDimensions,
  formatFileSize,
} from '@/lib/types/media-asset'
import styles from './MediaLibrary.module.css'

/* ─── Helpers ────────────────────────────────────────── */

function isImage(mime: string) {
  return mime.startsWith('image/')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
    if (validationError) {
      setError(validationError)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setError(null)
    setProgress(10)

    // Get image dimensions client-side before upload
    let width: number | undefined
    let height: number | undefined
    if (isImage(file.type)) {
      try {
        const dims = await getImageDimensions(file)
        width = dims.width
        height = dims.height
      } catch {
        // not critical — continue without dimensions
      }
    }
    setProgress(30)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', category)
    if (width)  fd.append('width', String(width))
    if (height) fd.append('height', String(height))

    setProgress(50)

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: fd,
      })
      setProgress(90)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Upload gagal. Coba lagi.')
        setStatus('error')
        return
      }

      setProgress(100)
      setStatus('success')
      onUploaded(json.asset)
      setTimeout(() => { setStatus('idle'); setProgress(0) }, 2000)
    } catch {
      setError('Koneksi gagal. Periksa internet dan coba lagi.')
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
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      {status === 'idle' && (
        <>
          <div className={styles.uploadIcon}>↑</div>
          <div className={styles.uploadTitle}>Upload Media</div>
          <div className={styles.uploadSub}>Klik atau seret file ke sini</div>
          <div className={styles.uploadHint}>JPG · PNG · WebP · AVIF · MP4 — max 10 MB</div>
        </>
      )}

      {status === 'uploading' && (
        <>
          <div className={styles.uploadProgress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.uploadSub}>Mengupload… {progress}%</div>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className={styles.uploadIcon} style={{ color: '#22c55e' }}>✓</div>
          <div className={styles.uploadTitle}>Upload berhasil!</div>
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
}

function MediaCard({ asset, onDeleted, onSelect, selectable }: MediaCardProps) {
  const [copying, setCopying] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleCopy() {
    if (!asset.public_url) return
    await navigator.clipboard.writeText(asset.public_url)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  async function handleDelete() {
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

  return (
    <div className={`${styles.card} ${selectable ? styles.cardSelectable : ''}`}>
      {/* Thumbnail */}
      <div
        className={styles.thumb}
        onClick={() => selectable && onSelect?.(asset)}
      >
        {isImg && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={asset.filename} className={styles.thumbImg} loading="lazy" />
        ) : (
          <div className={styles.thumbPlaceholder}>
            {asset.mime_type.startsWith('video/') ? '▶' : '◈'}
          </div>
        )}
        {selectable && (
          <div className={styles.selectOverlay}>
            <span className={styles.selectBtn}>Pilih</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className={styles.cardBody}>
        <div className={styles.cardFilename} title={asset.filename}>
          {asset.filename}
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.cardCategory}>{asset.category}</span>
          <span className={styles.cardSize}>{formatFileSize(asset.size_bytes)}</span>
        </div>
        {asset.width && asset.height && (
          <div className={styles.cardDim}>{asset.width} × {asset.height} px</div>
        )}
        <div className={styles.cardDate}>{formatDate(asset.created_at)}</div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        {asset.public_url && (
          <button
            className={styles.actionBtn}
            onClick={handleCopy}
            title="Salin URL"
            aria-label="Salin URL"
          >
            {copying ? '✓' : '⎘'}
          </button>
        )}
        {selectable && (
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => onSelect?.(asset)}
            title="Gunakan media ini"
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
  /** If provided, renders in picker mode — user selects one asset */
  onSelect?: (asset: MediaAsset) => void
  /** Pre-selected category filter in picker mode */
  defaultCategory?: MediaCategory
  /** Compact mode for embedding in modals */
  compact?: boolean
}

export function MediaLibrary({ onSelect, defaultCategory, compact }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>(defaultCategory ?? 'all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

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
              Upload dan kelola gambar untuk website JAECOO Palembang
            </p>
          </div>
        </div>
      )}

      <div className={styles.goldLine} />

      {/* Upload + Filters row */}
      <div className={styles.toolbar}>
        {/* Category filter */}
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

        {/* Search */}
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

      {/* Upload zone — only visible when not in picker/compact mode, or in picker for quick upload */}
      <UploadZone
        category={(category !== 'all' ? category : 'system') as MediaCategory}
        onUploaded={handleUploaded}
      />

      {/* Stats */}
      {!loading && (
        <div className={styles.stats}>
          {assets.length} file{assets.length !== 1 ? '' : ''}
          {search && ` — hasil pencarian "${search}"`}
          {category !== 'all' && ` — kategori ${category}`}
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
          {assets.map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              onDeleted={handleDeleted}
              onSelect={onSelect}
              selectable={selectable}
            />
          ))}
        </div>
      )}
    </div>
  )
}
