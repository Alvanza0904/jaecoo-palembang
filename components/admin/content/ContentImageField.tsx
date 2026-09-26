/**
 * Shared CMS image field. All homepage/brand/model assignments use MediaPicker.
 */
'use client'

import { useState } from 'react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import type { MediaAsset } from '@/lib/types/media-asset'
import styles from './content.module.css'

interface Props {
  label: string
  contentType: string
  contentKey: string
  slotKey: string
  breakpoint?: 'desktop' | 'mobile'
  initial?: { id?: string; url?: string; alt?: string | null; focal_x?: number | null; focal_y?: number | null }
  onChange?: (asset: { id?: string; url?: string; alt?: string | null; focal_x?: number | null; focal_y?: number | null } | null) => void
}

export function ContentImageField({ label, contentType, contentKey, slotKey, breakpoint, initial, onChange }: Props) {
  const [asset, setAsset] = useState(initial)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function assign(next: MediaAsset) {
    setPickerOpen(false)
    setSaving(true); setMessage(null)
    try {
      const res = await fetch('/api/admin/content-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType, content_key: contentKey, slot_key: slotKey,
          breakpoint: breakpoint ?? null, media_asset_id: next.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan image.')
      setAsset({ id: next.id, url: next.public_url ?? undefined, alt: next.alt_text, focal_x: next.focal_x, focal_y: next.focal_y })
      onChange?.({ id: next.id, url: next.public_url ?? undefined, alt: next.alt_text, focal_x: next.focal_x, focal_y: next.focal_y })
      setMessage('Tersimpan ✓')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Gagal menyimpan.')
    } finally { setSaving(false) }
  }

  async function clear() {
    setSaving(true); setMessage(null)
    try {
      const params = new URLSearchParams({ content_type: contentType, content_key: contentKey, slot_key: slotKey })
      if (breakpoint) params.set('breakpoint', breakpoint)
      const res = await fetch(`/api/admin/content-media?${params}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal melepas image.')
      setAsset(undefined); setMessage('Dilepas — fallback aktif ✓')
      onChange?.(null)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal melepas image.') }
    finally { setSaving(false) }
  }

  return (
    <div className={styles.imageField}>
      <div className={styles.fieldHead}>
        <div>
          <div className={styles.fieldLabel}>{label}</div>
          <div className={styles.fieldHint}>{breakpoint ? `${breakpoint} image` : 'universal image'}</div>
        </div>
        {asset?.id && <span className={styles.savedPill}>Linked</span>}
      </div>
      <div className={styles.imagePreview}>
        {asset?.url ? <img src={asset.url} alt={asset.alt ?? label} /> : <div className={styles.emptyPreview}>Belum ada image</div>}
      </div>
      <div className={styles.imageActions}>
        <button className={styles.primaryBtn} type="button" onClick={() => setPickerOpen(true)} disabled={saving}>
          {saving ? 'Menyimpan…' : 'Pilih dari Galeri Media'}
        </button>
        {asset?.id && <button className={styles.secondaryBtn} type="button" onClick={clear} disabled={saving}>Remove</button>}
      </div>
      {message && <div className={message.includes('✓') ? styles.success : styles.error}>{message}</div>}
      {asset?.id && <div className={styles.assetMeta}>Alt: {asset.alt || 'belum diisi'} · Focal: {Math.round(asset.focal_x ?? 50)}% / {Math.round(asset.focal_y ?? 50)}%</div>}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={assign} title={`Pilih image — ${label}`} />
    </div>
  )
}
