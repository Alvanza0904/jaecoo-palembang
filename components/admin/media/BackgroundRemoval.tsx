/**
 * JAECOO Palembang — Background Removal Component
 * STEP 5D: Client-side vehicle cutout using @imgly/background-removal
 *
 * Uses WebAssembly ONNX model in the browser — no API key, no server cost.
 * Result (transparent WebP) is uploaded to /api/admin/media/cutout.
 *
 * Status flow:
 *  idle → loading-model → processing → uploading → done | error
 */

'use client'

import { useState, useCallback } from 'react'
import type { MediaAsset } from '@/lib/types/media-asset'
import styles from './BackgroundRemoval.module.css'

type RemovalStatus =
  | 'idle'
  | 'loading-model'
  | 'processing'
  | 'uploading'
  | 'done'
  | 'error'

interface Props {
  asset: MediaAsset
  onComplete: (updatedAsset: MediaAsset) => void
}

export function BackgroundRemoval({ asset, onComplete }: Props) {
  const [status, setStatus] = useState<RemovalStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleRemoveBackground = useCallback(async () => {
    setStatus('loading-model')
    setError(null)
    setProgress(5)

    try {
      // Dynamically import @imgly/background-removal
      // This loads the WASM model on first use (~40MB, cached by browser)
      const { removeBackground } = await import('@imgly/background-removal').catch(() => {
        throw new Error(
          'Library @imgly/background-removal tidak tersedia. ' +
          'Jalankan: npm install @imgly/background-removal'
        )
      })

      setStatus('processing')
      setProgress(20)

      // Fetch original image as blob
      if (!asset.public_url) throw new Error('Original URL tidak tersedia')

      const imageResponse = await fetch(asset.public_url)
      if (!imageResponse.ok) throw new Error('Gagal mengambil gambar original')
      const imageBlob = await imageResponse.blob()

      setProgress(40)

      // Run background removal (WASM — runs in browser)
      const resultBlob = await removeBackground(imageBlob, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 40) + 40  // 40–80%
            setProgress(pct)
          }
        },
        output: {
          format: 'image/webp',
          quality: 0.9,
        },
      })

      setProgress(80)

      // Preview
      const previewObjectUrl = URL.createObjectURL(resultBlob)
      setPreviewUrl(previewObjectUrl)

      // Upload cutout to server
      setStatus('uploading')
      setProgress(85)

      const cutoutFile = new File([resultBlob], 'cutout.webp', { type: 'image/webp' })
      const fd = new FormData()
      fd.append('mediaId', asset.id)
      fd.append('cutout', cutoutFile)

      const res = await fetch('/api/admin/media/cutout', {
        method: 'POST',
        body: fd,
      })

      setProgress(95)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Upload cutout gagal')
      }

      const json = await res.json()
      setProgress(100)
      setStatus('done')
      onComplete(json.asset)

    } catch (err) {
      console.error('[BackgroundRemoval]', err)
      setStatus('error')
      setError(String(err).replace('Error: ', ''))
    }
  }, [asset, onComplete])

  function handleRetry() {
    setStatus('idle')
    setProgress(0)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const statusLabel: Record<RemovalStatus, string> = {
    'idle': 'Hapus Background',
    'loading-model': 'Memuat model AI…',
    'processing': 'Memproses…',
    'uploading': 'Menyimpan cutout…',
    'done': 'Cutout Selesai ✓',
    'error': 'Gagal',
  }

  const isWorking = ['loading-model', 'processing', 'uploading'].includes(status)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Cutout Kendaraan</span>
        <span className={styles.hint}>
          Hapus background untuk efek layered Hero
        </span>
      </div>

      {/* Preview area */}
      {asset.cutout_url && status !== 'processing' && (
        <div className={styles.existingCutout}>
          <div className={styles.checkered}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.cutout_url}
              alt="Cutout kendaraan"
              className={styles.cutoutImg}
            />
          </div>
          <span className={styles.cutoutLabel}>✓ Cutout tersedia</span>
        </div>
      )}

      {previewUrl && status === 'done' && (
        <div className={styles.newCutout}>
          <div className={styles.checkered}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Cutout baru"
              className={styles.cutoutImg}
            />
          </div>
          <span className={styles.cutoutLabel}>✓ Cutout baru disimpan</span>
        </div>
      )}

      {/* Progress */}
      {isWorking && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressLabel}>
            {statusLabel[status]} ({progress}%)
          </div>
          {status === 'loading-model' && (
            <div className={styles.modelNote}>
              Download model AI ~40MB (sekali saja, lalu di-cache browser)
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠</span>
          <span className={styles.errorText}>{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actions}>
        {(status === 'idle' || status === 'error') && (
          <button
            className={styles.btnRemove}
            onClick={status === 'error' ? handleRetry : handleRemoveBackground}
            disabled={!asset.public_url}
          >
            {status === 'error' ? '↺ Coba Lagi' : '✂ ' + statusLabel[status]}
          </button>
        )}
        {status === 'done' && (
          <button className={styles.btnRetry} onClick={handleRetry}>
            ↺ Ulangi Processing
          </button>
        )}
      </div>

      <div className={styles.techNote}>
        Diproses di browser menggunakan AI (WebAssembly) — tidak ada biaya API
      </div>
    </div>
  )
}
