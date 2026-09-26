'use client'

import { useEffect, useState } from 'react'
import { ContentImageField } from '@/components/admin/content/ContentImageField'
import { SalesPageView, type SalesImages } from '@/components/sales/SalesPage'
import type { ResponsiveImage } from '@/lib/types/media'
import styles from './sales-editor.module.css'

const SLOTS = [
  { key: 'hero_portrait', field: 'hero', label: 'Hero Portrait' },
  { key: 'about', field: 'about', label: 'About / Tentang Saya' },
  { key: 'statement', field: 'statement', label: 'Personal Statement' },
  { key: 'place_order', field: 'placeOrder', label: 'Place Order Photo' },
  { key: 'final_cta', field: 'finalCta', label: 'Final CTA Background' },
] as const

type Field = (typeof SLOTS)[number]['field']
type Asset = { id?: string; url?: string; alt?: string | null; focal_x?: number | null; focal_y?: number | null }
type Row = { slot_key: string; breakpoint: string | null; media_assets?: Asset | Asset[] | null }

function one(asset: Row['media_assets']) {
  return Array.isArray(asset) ? asset[0] : asset ?? undefined
}

function toImage(asset?: Asset | null): ResponsiveImage | undefined {
  if (!asset?.url) return undefined
  return {
    desktop: asset.url,
    mobile: asset.url,
    alt: asset.alt ?? 'Alvan',
    focal_x: asset.focal_x ?? undefined,
    focal_y: asset.focal_y ?? undefined,
  }
}

export function SalesEditor() {
  const [rows, setRows] = useState<Row[]>([])
  const [images, setImages] = useState<SalesImages>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/content-media?content_type=page&content_key=sales')
      .then((response) => response.json())
      .then((json) => {
        const next = (json.assignments ?? []) as Row[]
        setRows(next)
        const mapped: SalesImages = {}
        for (const slot of SLOTS) {
          const row = next.find((item) => item.slot_key === slot.key && item.breakpoint == null)
          mapped[slot.field] = toImage(one(row?.media_assets))
        }
        setImages(mapped)
      })
      .finally(() => setLoading(false))
  }, [])

  function assetFor(slot: string) {
    const row = rows.find((item) => item.slot_key === slot && item.breakpoint == null)
    const asset = one(row?.media_assets)
    if (!asset?.id && !asset?.url) return undefined
    return { id: asset?.id, url: asset?.url, alt: asset?.alt, focal_x: asset?.focal_x, focal_y: asset?.focal_y }
  }

  function update(field: Field, asset: Asset | null) {
    setImages((current) => ({ ...current, [field]: toImage(asset) }))
  }

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Admin / Sales</p>
      <h1>Sales Alvan</h1>
      <p className={styles.lead}>
        Foto halaman Sales tersimpan di content_media, bukan di kode. Preview di bawah memakai layout yang sama dengan halaman live.
      </p>
      {loading ? <p>Memuat…</p> : (
        <div className={styles.grid}>
          {SLOTS.map((slot) => (
            <div key={slot.key} className={styles.card}>
              <h2>{slot.label}</h2>
              <ContentImageField
                label={slot.label}
                contentType="page"
                contentKey="sales"
                slotKey={slot.key}
                initial={assetFor(slot.key)}
                onChange={(asset) => update(slot.field, asset)}
              />
            </div>
          ))}
        </div>
      )}
      <p className={styles.previewLabel}>Preview live</p>
      <div className={styles.preview}>
        <SalesPageView images={images} />
      </div>
    </div>
  )
}
