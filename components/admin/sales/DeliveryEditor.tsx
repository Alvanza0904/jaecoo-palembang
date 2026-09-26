'use client'

import { useEffect, useState } from 'react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { DELIVERY_MODELS, deliveryAlt, type SalesDelivery } from '@/lib/sales/deliveries'
import type { MediaAsset } from '@/lib/types/media-asset'
import styles from './sales-editor.module.css'

type Draft = SalesDelivery & { saved?: boolean }

function blank(): Draft {
  return {
    id: crypto.randomUUID(),
    media_asset_id: '',
    title: '',
    model: '',
    variant: '',
    caption: '',
    location: '',
    alt: '',
    sort: 0,
    published: true,
    saved: false,
  }
}

function toDelivery(row: Draft): SalesDelivery {
  const url = row.image?.desktop
  return {
    ...row,
    image: url
      ? { ...row.image, desktop: url, mobile: url, alt: deliveryAlt(row) }
      : undefined,
  }
}

export function DeliveryEditor({ onChange }: { onChange: (items: SalesDelivery[]) => void }) {
  const [items, setItems] = useState<Draft[]>([])
  const [picker, setPicker] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function publish(next: Draft[]) {
    setItems(next)
    onChange(next.filter((item) => item.published && item.image?.desktop).map(toDelivery))
  }

  function update(recipe: (current: Draft[]) => Draft[]) {
    setItems((current) => {
      const next = recipe(current)
      onChange(next.filter((item) => item.published && item.image?.desktop).map(toDelivery))
      return next
    })
  }

  function patch(id: string, change: Partial<Draft>) {
    update((current) => current.map((item) => item.id === id ? { ...item, ...change } : item))
  }

  useEffect(() => {
    fetch('/api/admin/sales/deliveries')
      .then((response) => response.json())
      .then((json) => {
        const rows = (json.deliveries ?? []) as Array<Draft & { image_url?: string; focal_x?: number; focal_y?: number }>
        const next = rows.map((row) => ({
          ...row,
          saved: true,
          image: row.image_url
            ? { desktop: row.image_url, mobile: row.image_url, alt: deliveryAlt(row), focal_x: row.focal_x, focal_y: row.focal_y }
            : undefined,
        }))
        publish(next)
      })
      .finally(() => setLoading(false))
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save(item: Draft) {
    setMessage(null)
    const method = item.saved ? 'PATCH' : 'POST'
    const response = await fetch('/api/admin/sales/deliveries', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    const json = await response.json()
    if (!response.ok) {
      setMessage(json.error || 'Gagal menyimpan.')
      return
    }
    const saved = json.delivery as SalesDelivery
    update((current) => current.map((row) => row.id === item.id || row.id === saved.id
      ? { ...row, ...saved, image: row.image ?? item.image, saved: true }
      : row))
    setMessage('Tersimpan.')
  }

  async function remove(item: Draft) {
    if (item.saved) {
      const response = await fetch(`/api/admin/sales/deliveries?id=${item.id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok) {
        setMessage(json.error || 'Gagal menghapus.')
        return
      }
    }
    update((current) => current.filter((row) => row.id !== item.id))
  }

  async function move(item: Draft, direction: -1 | 1) {
    const ordered = [...items].sort((a, b) => a.sort - b.sort)
    const index = ordered.findIndex((current) => current.id === item.id)
    const target = ordered[index + direction]
    if (!target) return
    update((current) => current.map((row) => {
      if (row.id === item.id) return { ...row, sort: target.sort }
      if (row.id === target.id) return { ...row, sort: item.sort }
      return row
    }))
    if (item.saved) await save({ ...item, sort: target.sort, saved: true })
    if (target.saved) await save({ ...target, sort: item.sort, saved: true })
  }

  function choose(asset: MediaAsset) {
    if (!picker) return
    patch(picker, {
      media_asset_id: asset.id,
      image: {
        desktop: asset.public_url ?? undefined,
        mobile: asset.public_url ?? undefined,
        alt: asset.alt_text ?? '',
        focal_x: asset.focal_x ?? undefined,
        focal_y: asset.focal_y ?? undefined,
      },
    })
    setPicker(null)
  }

  return (
    <section className={styles.deliveryAdmin}>
      <div className={styles.deliveryHead}>
        <div>
          <h2>Serah Terima</h2>
          <p>Pilih foto yang sudah ada di Media Library. File tidak diduplikasi.</p>
        </div>
        <button
          type="button"
          className={styles.add}
          onClick={() => update((current) => [...current, { ...blank(), sort: current.length + 1 }])}
        >
          Tambah Delivery
        </button>
      </div>
      {loading && <p>Memuat delivery…</p>}
      {message && <p className={styles.note}>{message}</p>}
      {items.map((item) => (
        <article key={item.id} className={styles.deliveryCard}>
          <button type="button" className={styles.photoPick} onClick={() => setPicker(item.id)}>
            {item.image?.desktop ? <img src={item.image.desktop} alt="" /> : <span>Pilih dari Media Library</span>}
          </button>
          <div className={styles.fields}>
            <label>Judul<input value={item.title} onChange={(event) => patch(item.id, { title: event.target.value })} /></label>
            <label>Model
              <select value={item.model} onChange={(event) => patch(item.id, { model: event.target.value })}>
                <option value="">Pilih model</option>
                {DELIVERY_MODELS.map((model) => <option key={model}>{model}</option>)}
              </select>
            </label>
            <label>Variant<input value={item.variant} onChange={(event) => patch(item.id, { variant: event.target.value })} /></label>
            <label>Lokasi<input value={item.location} onChange={(event) => patch(item.id, { location: event.target.value })} placeholder="Palembang" /></label>
            <label>Keterangan<textarea value={item.caption} onChange={(event) => patch(item.id, { caption: event.target.value })} /></label>
            <label>Alt text<input value={item.alt} onChange={(event) => patch(item.id, { alt: event.target.value })} placeholder={deliveryAlt(item)} /></label>
            <label className={styles.check}>
              <input type="checkbox" checked={item.published} onChange={(event) => patch(item.id, { published: event.target.checked })} />
              Tampilkan di halaman Sales
            </label>
            <div className={styles.rowActions}>
              <button type="button" onClick={() => move(item, -1)}>Naik</button>
              <button type="button" onClick={() => move(item, 1)}>Turun</button>
              <button type="button" onClick={() => save(item)}>Simpan</button>
              <button type="button" onClick={() => remove(item)}>Hapus</button>
            </div>
          </div>
        </article>
      ))}
      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={choose} title="Pilih foto serah terima" />
    </section>
  )
}
