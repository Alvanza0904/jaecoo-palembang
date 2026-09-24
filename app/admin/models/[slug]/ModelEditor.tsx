'use client'

/**
 * JAECOO Palembang — Model Editor (Client Component)
 * STEP 5B + 5C + 5D: Full CMS editor dengan tab Basic / Variants / Colors / Content
 * STEP 5C: Tambah Media Picker untuk Hero Image dan Color images
 * STEP 5D: Tambah Cutout Media picker untuk layered Hero
 *
 * Semua save langsung ke Supabase via API routes (authenticated).
 */

import { useState, useTransition, useCallback, useEffect, type FocusEvent } from 'react'
import Link from 'next/link'
import styles from './editor.module.css'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { VisualMediaEditor } from '@/components/admin/visual-editor'
import { ModelStickyPreview } from '@/components/model/ModelStickyPreview'
import type { MediaWithArtDirection } from '@/lib/types/media'
import { MODELS } from '@/lib/data/models'
import type { MediaAsset } from '@/lib/types/media-asset'
import type { ModelFeature, ModelHighlight, ModelPageCopy, ModelSectionCopy } from '@/lib/types/model'

/* ─── Types ────────────────────────────────────────────── */

type PriceStatusOption =
  | 'official'
  | 'prebook'
  | 'coming_soon'
  | 'contact_sales'
  | 'starting_from'
  | 'hidden'

const PRICE_STATUS_OPTIONS: { value: PriceStatusOption; label: string }[] = [
  { value: 'official', label: 'Official — tampil nominal Rp' },
  { value: 'starting_from', label: 'Mulai Dari — tampil "Mulai dari Rp..."' },
  { value: 'prebook', label: 'Pre-Book — badge PRE-BOOK' },
  { value: 'coming_soon', label: 'Coming Soon — badge COMING SOON' },
  { value: 'contact_sales', label: 'Hubungi Sales — CTA tanpa harga' },
  { value: 'hidden', label: 'Hidden — harga tidak tampil' },
]

const PRICE_STATUS_REQUIRES_AMOUNT: PriceStatusOption[] = ['official', 'starting_from']

interface Variant {
  id: string
  variant_key: string
  name: string
  label: string | null
  price_status: PriceStatusOption
  price_idr: number | null
  price_display: string | null
  price_display_override: string | null
  price_region: string
  is_default: boolean
}

interface Color {
  id: string
  color_key: string
  name: string
  hex: string
  sort_order: number
  image_path?: string | null
  media_asset_id?: string | null
}

interface ContentRow {
  section: string
  content: Record<string, unknown>
}

interface SpecRow {
  category: string
  spec_label: string
  spec_value: string
}

interface AdminModel {
  id: string
  slug: string
  name: string
  short_name: string
  tagline: string
  description: string
  published: boolean
  sort_order: number
  model_variants: Variant[]
  model_colors: Color[]
  model_content: ContentRow[]
  model_specifications?: Array<SpecRow & { id?: string; sort_order?: number }>
}

interface ModelEditorProps {
  initialModel: AdminModel
  slug: string
}

type TabId = 'basic' | 'heroes' | 'variants' | 'colors' | 'imageSlots' | 'content' | 'specs'

/* ─── Helpers ──────────────────────────────────────────── */

function formatIDR(val: string | number): string {
  const n = Number(String(val).replace(/\D/g, ''))
  if (!n) return ''
  return `Rp${n.toLocaleString('id-ID')}`
}

/* ─── Feedback component ───────────────────────────────── */

function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div className={type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
      <span>{type === 'success' ? '✓' : '⚠'}</span>
      {message}
    </div>
  )
}

/* ─── Basic Info Tab ───────────────────────────────────── */

function BasicTab({ model, slug, mode = 'identity' }: { model: AdminModel; slug: string; mode?: 'identity' | 'hero' }) {
  const [form, setForm] = useState({
    name: model.name,
    short_name: model.short_name,
    tagline: model.tagline,
    description: model.description ?? '',
    published: model.published,
  })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [visualEditorAsset, setVisualEditorAsset] = useState<MediaAsset | null>(null)
  const [visualEditorCutoutAsset, setVisualEditorCutoutAsset] = useState<MediaAsset | null>(null)
  const [visualEditorLoading, setVisualEditorLoading] = useState(false)

  // Hero image — loaded from model_content.hero section
  const heroContent = model.model_content?.find((c) => c.section === 'hero')?.content as Record<string, unknown> | undefined
  const heroImageInit = (heroContent?.image as Record<string, string> | undefined)?.desktop ?? ''
  const [heroImageUrl, setHeroImageUrl] = useState(heroImageInit)
  const heroMediaAssetId = typeof heroContent?.media_asset_id === 'string' ? heroContent.media_asset_id : ''
  const cutoutMediaAssetId = typeof heroContent?.cutout_media_id === 'string' ? heroContent.cutout_media_id : ''

  async function openVisualEditor() {
    if (!heroMediaAssetId) {
      setFeedback({ type: 'error', msg: 'Hero image belum terhubung ke Media Asset.' })
      return
    }
    setVisualEditorLoading(true)
    try {
      const ids = Array.from(new Set([heroMediaAssetId, cutoutMediaAssetId].filter(Boolean)))
      const results = await Promise.all(ids.map(async (id) => {
        const res = await fetch(`/api/admin/media/${id}`)
        const json = await res.json()
        if (!res.ok || !json.asset) throw new Error(json.error || `Media asset ${id} tidak ditemukan.`)
        return json.asset as MediaAsset
      }))
      const heroAsset = results.find((a) => a.id === heroMediaAssetId) ?? null
      if (!heroAsset) throw new Error('Hero media asset tidak ditemukan.')
      setVisualEditorAsset(heroAsset)
      setVisualEditorCutoutAsset(results.find((a) => a.id === cutoutMediaAssetId) ?? null)
    } catch (err) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Gagal membuka Visual Editor.' })
    } finally {
      setVisualEditorLoading(false)
    }
  }

  // Cutout media picker
  const [cutoutPickerOpen, setCutoutPickerOpen] = useState(false)
  const [cutoutUrl, setCutoutUrl] = useState<string>('')
  const [cutoutSaving, setCutoutSaving] = useState(false)
  const [cutoutFeedback, setCutoutFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleCutoutSelect(asset: MediaAsset) {
    setCutoutPickerOpen(false)
    if (!asset.cutout_url) {
      setCutoutFeedback({
        type: 'error',
        msg: 'Media ini belum memiliki cutout. Buka Media Library → klik media → hapus background dulu.',
      })
      return
    }
    setCutoutSaving(true)
    setCutoutFeedback(null)
    try {
      const res = await fetch(`/api/admin/models/${slug}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'hero',
          content: {
            ...(heroContent ?? {}),
            cutout_url: asset.cutout_url,
            cutout_media_id: asset.id,
          },
        }),
      })
      if (res.ok) {
        setCutoutUrl(asset.cutout_url)
        setCutoutFeedback({ type: 'success', msg: 'Cutout berhasil disimpan.' })
      } else {
        const j = await res.json()
        setCutoutFeedback({ type: 'error', msg: j.error || 'Gagal menyimpan cutout.' })
      }
    } catch {
      setCutoutFeedback({ type: 'error', msg: 'Koneksi gagal.' })
    } finally {
      setCutoutSaving(false)
    }
  }

  // Init cutout from hero content
  const cutoutUrlInit = (heroContent?.cutout_url as string | undefined) ?? ''

  function update(key: keyof typeof form, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
    setFeedback(null)
  }

  function handleSave() {
    if (!form.name.trim()) {
      setFeedback({ type: 'error', msg: 'Nama model wajib diisi' })
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
        setFeedback({ type: 'success', msg: 'Tersimpan ✓' })
        setDirty(false)
      } catch (err) {
        setFeedback({ type: 'error', msg: String(err) })
      }
    })
  }

  return (
    <div className={styles.section}>
      {mode === 'identity' && (
        <>
      <h2 className={styles.sectionTitle}>Basic Information</h2>

      <div className={styles.field}>
        <label className={styles.label}>Model Name <span className={styles.required}>*</span></label>
        <input
          className={styles.input}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="JAECOO J5 EV"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Short Name</label>
          <input
            className={styles.input}
            value={form.short_name}
            onChange={(e) => update('short_name', e.target.value)}
            placeholder="J5 EV"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Slug</label>
          <input className={`${styles.input} ${styles.inputMono}`} value={slug} disabled />
          <span className={styles.fieldNote}>Slug tidak dapat diubah</span>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tagline</label>
        <input
          className={styles.input}
          value={form.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          placeholder="THIS IS THE REAL SUV."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          placeholder="Deskripsi singkat model..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.labelRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
          />
          <span>Published (tampil di website)</span>
        </label>
      </div>

      {feedback && <Feedback type={feedback.type} message={feedback.msg} />}

      <div className={styles.actions}>
        {dirty && <span className={styles.unsaved}>Ada perubahan belum disimpan</span>}
        <button
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={isPending || !dirty}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Basic Info'}
        </button>
      </div>
        </>
      )}

      {mode === 'hero' && (
        <>
      <h2 className={styles.sectionTitle}>Model Hero</h2>
      <p className={styles.sectionNote}>Dipakai halaman Overview. Technology dan Specifications memakai gambar ini hanya jika hero sub-page-nya masih kosong.</p>
      <div className={styles.mediaSection}>
        <h3 className={styles.mediaSectionTitle}>Hero Image</h3>
        <p className={styles.mediaSectionNote}>
          Gambar utama yang tampil di halaman model. Tersimpan sebagai hero media reference.
        </p>

        {heroImageUrl ? (
          <div className={styles.mediaCurrent}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl} alt="Hero current" className={styles.mediaThumb} />
            <div className={styles.mediaInfo}>
              <div className={styles.mediaUrl}>{heroImageUrl}</div>
              <div className={styles.mediaActions}>
                <button className={styles.btnSecondary} onClick={() => setPickerOpen(true)}>
                  Ganti Gambar
                </button>
                <button className={styles.btnSecondary} onClick={() => void openVisualEditor()} disabled={visualEditorLoading}>
                  {visualEditorLoading ? 'Membuka…' : '🎨 Edit Posisi'}
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={async () => {
                    // Save empty hero to DB
                    const res = await fetch(`/api/admin/models/${slug}/content`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'hero',
                        content: { image: { desktop: '', tablet: '', mobile: '', alt: model.name }, media_asset_id: null },
                      }),
                    })
                    if (res.ok) {
                      setHeroImageUrl('')
                    }
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className={styles.mediaPickBtn}
            onClick={() => setPickerOpen(true)}
          >
            <span className={styles.mediaPickIcon}>◈</span>
            <span>Pilih Hero Image dari Media Library</span>
          </button>
        )}
      </div>

      {/* ── Cutout Media ───────────────────────────── */}
      <div className={styles.mediaSection}>
        <h3 className={styles.mediaSectionTitle}>Cutout Kendaraan</h3>
        <p className={styles.mediaSectionNote}>
          Gambar kendaraan tanpa background (transparan) untuk layered Hero effect.
          Buka Media Library → klik gambar → hapus background terlebih dahulu.
        </p>

        {cutoutFeedback && (
          <Feedback type={cutoutFeedback.type} message={cutoutFeedback.msg} />
        )}

        {(cutoutUrl || cutoutUrlInit) ? (
          <div className={styles.mediaCurrent}>
            <div style={{
              background: 'repeating-conic-gradient(#333 0% 25%, #1a1a1a 0% 50%) 0 0 / 16px 16px',
              borderRadius: 6,
              overflow: 'hidden',
              width: 80,
              height: 60,
              flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cutoutUrl || cutoutUrlInit}
                alt="Cutout"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className={styles.mediaInfo}>
              <div className={styles.mediaUrl}>Cutout tersedia ✓</div>
              <div className={styles.mediaActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setCutoutPickerOpen(true)}
                  disabled={cutoutSaving}
                >
                  Ganti Cutout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className={styles.mediaPickBtn}
            onClick={() => setCutoutPickerOpen(true)}
            disabled={cutoutSaving}
          >
            <span className={styles.mediaPickIcon}>✂</span>
            <span>Pilih Media dengan Cutout</span>
          </button>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pilih Hero Image"
        defaultCategory="models"
        onSelect={async (asset: MediaAsset) => {
          setPickerOpen(false)
          setHeroImageUrl(asset.public_url ?? '')
          // Save to model_content.hero
          await fetch(`/api/admin/models/${slug}/content`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: 'hero',
              content: {
                ...(heroContent ?? {}),
                image: {
                  desktop: asset.public_url,
                  tablet:  asset.public_url,
                  mobile:  asset.public_url,
                  alt:     model.name,
                  width:   asset.width,
                  height:  asset.height,
                },
                media_asset_id: asset.id,
                focal_x: asset.focal_x,
                focal_y: asset.focal_y,
                text_color_mode: asset.text_color_mode,
              },
            }),
          })
        }}
      />

      {/* Cutout Picker Modal */}
      <MediaPicker
        open={cutoutPickerOpen}
        onClose={() => setCutoutPickerOpen(false)}
        title="Pilih Media dengan Cutout"
        defaultCategory="models"
        onSelect={handleCutoutSelect}
      />

      {visualEditorAsset && (
        <VisualMediaEditor
          asset={visualEditorAsset}
          cutoutAsset={visualEditorCutoutAsset}
          previewHeading={model.tagline || model.name}
          previewSubheading={model.name}
          onClose={() => {
            setVisualEditorAsset(null)
            setVisualEditorCutoutAsset(null)
          }}
          onUpdated={(updated) => {
            if (updated.id === visualEditorAsset.id) setVisualEditorAsset(updated)
            if (updated.id === visualEditorCutoutAsset?.id) setVisualEditorCutoutAsset(updated)
            if (updated.id === heroMediaAssetId && updated.public_url) setHeroImageUrl(updated.public_url)
            if (updated.id === cutoutMediaAssetId && updated.cutout_url) setCutoutUrl(updated.cutout_url)
          }}
        />
      )}
        </>
      )}
    </div>
  )
}

/* ─── Variant Row ──────────────────────────────────────── */

function VariantRow({
  variant,
  slug,
  onSaved,
  onDeleted,
}: {
  variant: Variant
  slug: string
  onSaved: (v: Variant) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: variant.name,
    label: variant.label ?? '',
    price_status: variant.price_status ?? 'official' as PriceStatusOption,
    price_idr: variant.price_idr ?? 0,
    price_display_override: variant.price_display_override ?? '',
    price_region: variant.price_region,
    is_default: variant.is_default,
  })
  const requiresAmount = PRICE_STATUS_REQUIRES_AMOUNT.includes(form.price_status)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleSave() {
    if (!form.name.trim()) { setFeedback('Nama variant wajib diisi'); return }

    startTransition(async () => {
      try {
        const payload = {
          name: form.name,
          label: form.label || null,
          price_status: form.price_status,
          price_idr: requiresAmount ? form.price_idr : null,
          price_display: requiresAmount && form.price_idr ? formatIDR(form.price_idr) : null,
          price_display_override: form.price_display_override || null,
          price_region: form.price_region,
          is_default: form.is_default,
        }
        const res = await fetch(`/api/admin/models/${slug}/variants/${variant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
        onSaved({
          ...variant,
          name: form.name,
          label: form.label || null,
          price_status: form.price_status,
          price_idr: requiresAmount ? form.price_idr : null,
          price_display: requiresAmount && form.price_idr ? formatIDR(form.price_idr) : null,
          price_display_override: form.price_display_override || null,
          price_region: form.price_region,
          is_default: form.is_default,
        })
        setEditing(false)
        setFeedback(null)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Hapus variant "${variant.name}"?`)) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/variants/${variant.id}`, { method: 'DELETE' })
        if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
        onDeleted(variant.id)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  if (!editing) {
    return (
      <div className={styles.rowCard}>
        <div className={styles.rowMain}>
          <span className={styles.rowName}>{variant.name}</span>
          {variant.label && <span className={styles.badge}>{variant.label}</span>}
          {variant.is_default && <span className={styles.badgeDefault}>Default</span>}
          <span className={styles.badge}>{variant.price_status ?? 'official'}</span>
        </div>
        <div className={styles.rowMeta}>
          <span className={styles.rowPrice}>
            {variant.price_idr ? formatIDR(variant.price_idr) : '—'}
          </span>
          <span className={styles.rowRegion}>{variant.price_region}</span>
        </div>
        <div className={styles.rowActions}>
          <button className={styles.btnEdit} onClick={() => setEditing(true)}>Edit</button>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={isPending}>Hapus</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.rowCard} ${styles.rowCardExpanded}`}>
      <div className={styles.editGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Nama *</label>
          <input
            className={styles.input}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Label (opsional)</label>
          <input
            className={styles.input}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="SIVP"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Status Harga *</label>
          <select
            className={styles.input}
            value={form.price_status}
            onChange={(e) => setForm((f) => ({ ...f, price_status: e.target.value as PriceStatusOption }))}
          >
            {PRICE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {requiresAmount && (
          <div className={styles.field}>
            <label className={styles.label}>Harga (IDR){requiresAmount ? ' *' : ''}</label>
            <input
              className={styles.input}
              type="number"
              value={form.price_idr ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, price_idr: Number(e.target.value) }))}
            />
            {!!form.price_idr && <span className={styles.fieldNote}>{formatIDR(form.price_idr)}</span>}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label}>Display Override (opsional)</label>
          <input
            className={styles.input}
            value={form.price_display_override}
            onChange={(e) => setForm((f) => ({ ...f, price_display_override: e.target.value }))}
            placeholder='e.g. "Mulai dari Rp500 juta"'
          />
          <span className={styles.fieldNote}>Jika diisi, override auto-format dari price_idr</span>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Region Harga</label>
          <input
            className={styles.input}
            value={form.price_region}
            onChange={(e) => setForm((f) => ({ ...f, price_region: e.target.value }))}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.labelRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={form.is_default}
            onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
          />
          <span>Variant default</span>
        </label>
      </div>
      {feedback && <p className={styles.errorInline}>{feedback}</p>}
      <div className={styles.rowActions}>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={isPending}>
          {isPending ? '...' : 'Simpan'}
        </button>
        <button className={styles.btnSecondary} onClick={() => { setEditing(false); setFeedback(null) }}>
          Batal
        </button>
      </div>
    </div>
  )
}

/* ─── Variants Tab ─────────────────────────────────────── */

function VariantsTab({ model, slug }: { model: AdminModel; slug: string }) {
  const [variants, setVariants] = useState<Variant[]>(model.model_variants ?? [])
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({
    variant_key: '',
    name: '',
    label: '',
    price_status: 'official' as PriceStatusOption,
    price_idr: 0,
    price_display_override: '',
    price_region: 'OTR Palembang',
    is_default: false,
  })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSaved = useCallback((updated: Variant) => {
    setVariants((vs) => vs.map((v) => (v.id === updated.id ? updated : v)))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setVariants((vs) => vs.filter((v) => v.id !== id))
  }, [])

  function handleAdd() {
    if (!newForm.name.trim()) { setFeedback('Nama variant wajib diisi'); return }
    if (!newForm.variant_key.trim()) { setFeedback('Variant key wajib diisi'); return }
    if (!newForm.price_idr) { setFeedback('Harga wajib diisi'); return }

    startTransition(async () => {
      try {
        const requiresAmt = PRICE_STATUS_REQUIRES_AMOUNT.includes(newForm.price_status)
        const res = await fetch(`/api/admin/models/${slug}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variant_key: newForm.variant_key,
            name: newForm.name,
            label: newForm.label || null,
            price_status: newForm.price_status,
            price_idr: requiresAmt ? newForm.price_idr : null,
            price_display: requiresAmt && newForm.price_idr ? formatIDR(newForm.price_idr) : null,
            price_display_override: newForm.price_display_override || null,
            price_region: newForm.price_region,
            is_default: newForm.is_default,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menambah variant')
        setVariants((vs) => [...vs, json.variant])
        setAdding(false)
        setNewForm({ variant_key: '', name: '', label: '', price_status: 'official', price_idr: 0, price_display_override: '', price_region: 'OTR Palembang', is_default: false })
        setFeedback(null)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Variants</h2>
        <button className={styles.btnAdd} onClick={() => setAdding(true)} disabled={adding}>
          + Tambah Variant
        </button>
      </div>

      <p className={styles.sectionNote}>
        J7 SIVP dikelola sebagai variant J7 SHS — bukan model terpisah.
      </p>

      <div className={styles.rowList}>
        {variants.map((v) => (
          <VariantRow
            key={v.id}
            variant={v}
            slug={slug}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        ))}
        {variants.length === 0 && (
          <p className={styles.empty}>Belum ada variant. Tambah di atas.</p>
        )}
      </div>

      {adding && (
        <div className={styles.addCard}>
          <h3 className={styles.addTitle}>Tambah Variant Baru</h3>
          <div className={styles.editGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Variant Key * <span className={styles.fieldNote}>(unik, slug)</span></label>
              <input
                className={`${styles.input} ${styles.inputMono}`}
                value={newForm.variant_key}
                onChange={(e) => setNewForm((f) => ({ ...f, variant_key: e.target.value }))}
                placeholder="j7-sivp"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nama *</label>
              <input
                className={styles.input}
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="JAECOO J7 SHS-P"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Label (opsional)</label>
              <input
                className={styles.input}
                value={newForm.label}
                onChange={(e) => setNewForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="SIVP"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Status Harga *</label>
              <select
                className={styles.input}
                value={newForm.price_status}
                onChange={(e) => setNewForm((f) => ({ ...f, price_status: e.target.value as PriceStatusOption }))}
              >
                {PRICE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {PRICE_STATUS_REQUIRES_AMOUNT.includes(newForm.price_status) && (
              <div className={styles.field}>
                <label className={styles.label}>Harga IDR *</label>
                <input
                  className={styles.input}
                  type="number"
                  value={newForm.price_idr || ''}
                  onChange={(e) => setNewForm((f) => ({ ...f, price_idr: Number(e.target.value) }))}
                  placeholder="534900000"
                />
                {!!newForm.price_idr && <span className={styles.fieldNote}>{formatIDR(newForm.price_idr)}</span>}
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Display Override (opsional)</label>
              <input
                className={styles.input}
                value={newForm.price_display_override}
                onChange={(e) => setNewForm((f) => ({ ...f, price_display_override: e.target.value }))}
                placeholder='e.g. "Mulai dari Rp500 juta"'
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Region Harga</label>
              <input
                className={styles.input}
                value={newForm.price_region}
                onChange={(e) => setNewForm((f) => ({ ...f, price_region: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.labelRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={newForm.is_default}
                onChange={(e) => setNewForm((f) => ({ ...f, is_default: e.target.checked }))}
              />
              <span>Variant default</span>
            </label>
          </div>
          {feedback && <p className={styles.errorInline}>{feedback}</p>}
          <div className={styles.rowActions}>
            <button className={styles.btnPrimary} onClick={handleAdd} disabled={isPending}>
              {isPending ? '...' : 'Tambah'}
            </button>
            <button className={styles.btnSecondary} onClick={() => { setAdding(false); setFeedback(null) }}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Color Row ────────────────────────────────────────── */

function ColorRow({
  color,
  slug,
  onSaved,
  onDeleted,
}: {
  color: Color
  slug: string
  onSaved: (c: Color) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: color.name, hex: color.hex, sort_order: color.sort_order })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [colorImageUrl, setColorImageUrl] = useState(color.image_path ?? '')

  function handleSave() {
    if (!form.name.trim()) { setFeedback('Nama warna wajib diisi'); return }
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.hex)) { setFeedback('Hex tidak valid (contoh: #C8A96E)'); return }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/colors/${color.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
        onSaved({ ...color, ...form, image_path: colorImageUrl })
        setEditing(false)
        setFeedback(null)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Hapus warna "${color.name}"?`)) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/colors/${color.id}`, { method: 'DELETE' })
        if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
        onDeleted(color.id)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  if (!editing) {
    return (
      <div className={styles.rowCard}>
        <div className={styles.colorSwatch} style={{ background: color.hex }} title={color.hex} />
        <div className={styles.rowMain}>
          <span className={styles.rowName}>{color.name}</span>
          <span className={styles.rowSlug}>{color.hex}</span>
        </div>
        <div className={styles.rowMeta}>
          <span className={styles.rowRegion}>Urutan: {color.sort_order}</span>
        </div>
        <div className={styles.rowActions}>
          <button className={styles.btnEdit} onClick={() => setEditing(true)}>Edit</button>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={isPending}>Hapus</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.rowCard} ${styles.rowCardExpanded}`}>
      <div className={styles.editGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Nama *</label>
          <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Hex Color *</label>
          <div className={styles.hexRow}>
            <input
              className={`${styles.input} ${styles.inputMono}`}
              value={form.hex}
              onChange={(e) => setForm((f) => ({ ...f, hex: e.target.value }))}
              placeholder="#C8A96E"
            />
            <div className={styles.swatchPreview} style={{ background: form.hex }} />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Urutan</label>
          <input
            className={styles.input}
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
          />
        </div>
      </div>
      {/* Color Image */}
      <div className={styles.field}>
        <label className={styles.label}>Gambar Warna (opsional)</label>
        {colorImageUrl ? (
          <div className={styles.mediaRowCompact}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={colorImageUrl} alt={form.name} className={styles.mediaThumbSm} />
            <div className={styles.mediaRowActions}>
              <button className={styles.btnSecondary} onClick={() => setColorPickerOpen(true)}>Ganti</button>
              <button className={styles.btnDanger} onClick={() => setColorImageUrl('')}>Hapus</button>
            </div>
          </div>
        ) : (
          <button className={styles.mediaPickBtnSm} onClick={() => setColorPickerOpen(true)}>
            + Pilih Gambar dari Media Library
          </button>
        )}
      </div>

      <MediaPicker
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        title={`Pilih Gambar — ${color.name}`}
        defaultCategory="models"
        onSelect={async (asset: MediaAsset) => {
          setColorPickerOpen(false)
          setColorImageUrl(asset.public_url ?? '')
          // Patch color image_path in DB
          await fetch(`/api/admin/models/${slug}/colors/${color.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: asset.public_url, media_asset_id: asset.id }),
          })
        }}
      />

      {feedback && <p className={styles.errorInline}>{feedback}</p>}
      <div className={styles.rowActions}>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={isPending}>{isPending ? '...' : 'Simpan'}</button>
        <button className={styles.btnSecondary} onClick={() => { setEditing(false); setFeedback(null) }}>Batal</button>
      </div>
    </div>
  )
}

/* ─── Colors Tab ───────────────────────────────────────── */

function ColorsTab({ model, slug }: { model: AdminModel; slug: string }) {
  const [colors, setColors] = useState<Color[]>(model.model_colors ?? [])
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ color_key: '', name: '', hex: '#', sort_order: 0 })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSaved = useCallback((updated: Color) => {
    setColors((cs) => cs.map((c) => (c.id === updated.id ? updated : c)))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setColors((cs) => cs.filter((c) => c.id !== id))
  }, [])

  function handleAdd() {
    if (!newForm.name.trim()) { setFeedback('Nama warna wajib diisi'); return }
    if (!newForm.color_key.trim()) { setFeedback('Color key wajib diisi'); return }
    if (!/^#[0-9A-Fa-f]{6}$/.test(newForm.hex)) { setFeedback('Hex tidak valid (contoh: #FFFFFF)'); return }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/colors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newForm),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menambah warna')
        setColors((cs) => [...cs, json.color])
        setAdding(false)
        setNewForm({ color_key: '', name: '', hex: '#', sort_order: 0 })
        setFeedback(null)
      } catch (err) {
        setFeedback(String(err))
      }
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Colors</h2>
        <button className={styles.btnAdd} onClick={() => setAdding(true)} disabled={adding}>
          + Tambah Warna
        </button>
      </div>

      <div className={styles.rowList}>
        {colors.map((c) => (
          <ColorRow key={c.id} color={c} slug={slug} onSaved={handleSaved} onDeleted={handleDeleted} />
        ))}
        {colors.length === 0 && <p className={styles.empty}>Belum ada warna. Tambah di atas.</p>}
      </div>

      {adding && (
        <div className={styles.addCard}>
          <h3 className={styles.addTitle}>Tambah Warna Baru</h3>
          <div className={styles.editGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Color Key *</label>
              <input
                className={`${styles.input} ${styles.inputMono}`}
                value={newForm.color_key}
                onChange={(e) => setNewForm((f) => ({ ...f, color_key: e.target.value }))}
                placeholder="crystal-white"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nama *</label>
              <input
                className={styles.input}
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Crystal White"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Hex Color *</label>
              <div className={styles.hexRow}>
                <input
                  className={`${styles.input} ${styles.inputMono}`}
                  value={newForm.hex}
                  onChange={(e) => setNewForm((f) => ({ ...f, hex: e.target.value }))}
                  placeholder="#FFFFFF"
                />
                <div className={styles.swatchPreview} style={{ background: /^#[0-9A-Fa-f]{6}$/.test(newForm.hex) ? newForm.hex : 'transparent' }} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Urutan</label>
              <input
                className={styles.input}
                type="number"
                value={newForm.sort_order}
                onChange={(e) => setNewForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
          </div>
          {feedback && <p className={styles.errorInline}>{feedback}</p>}
          <div className={styles.rowActions}>
            <button className={styles.btnPrimary} onClick={handleAdd} disabled={isPending}>{isPending ? '...' : 'Tambah'}</button>
            <button className={styles.btnSecondary} onClick={() => { setAdding(false); setFeedback(null) }}>Batal</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Image Slots Tab ─────────────────────────────────── */
function ImageSlotsTab({ slug }: { slug: string }) {
  const groups: Array<{ title: string; note: string; slots: Array<[string, string, 'desktop' | 'mobile']> }> = [
    {
      title: 'Overview → Exterior',
      note: 'Hanya background section Exterior di halaman Overview. Mobile kosong = gambar desktop yang sama.',
      slots: [
        ['exterior', 'Desktop', 'desktop'],
        ['exterior_mobile', 'Mobile', 'desktop'],
      ],
    },
    {
      title: 'Overview → Design detail',
      note: 'Tiga gambar di komposisi Design detail. Tidak dipakai section lain.',
      slots: [
        ['design_detail_main', 'Gambar utama', 'desktop'],
        ['design_detail_wheel', 'Detail roda', 'desktop'],
        ['design_detail_rear', 'Detail belakang', 'desktop'],
      ],
    },
    {
      title: 'Overview → Profile',
      note: 'Hanya background tipografi Profile.',
      slots: [['profile', 'Desktop', 'desktop']],
    },
    {
      title: 'Overview → Interior',
      note: 'Hanya background section Interior. Mobile kosong = gambar desktop yang sama.',
      slots: [
        ['interior', 'Desktop', 'desktop'],
        ['interior_mobile', 'Mobile', 'desktop'],
      ],
    },
    {
      title: 'Overview → Cockpit',
      note: 'Gambar utama dan gambar detail yang menumpuk di section Cockpit.',
      slots: [
        ['cockpit_main', 'Gambar utama', 'desktop'],
        ['cockpit_detail', 'Gambar detail', 'desktop'],
      ],
    },
    {
      title: 'Overview → Performa',
      note: 'Hanya background section Performa. Angka performa diedit di Content → Overview.',
      slots: [['performance', 'Desktop', 'desktop'], ['performance', 'Mobile', 'mobile']],
    },
    {
      title: 'Overview → Technology',
      note: 'Hanya gambar di samping daftar fitur pada Overview. Bukan hero halaman Technology.',
      slots: [['technology', 'Desktop', 'desktop'], ['technology', 'Mobile', 'mobile']],
    },
    {
      title: 'Overview → ADAS & Safety',
      note: 'Hanya background section ADAS di Overview. Teks dan angka ADAS diedit di Content → Technology → ADAS, karena section itu juga dibaca halaman Technology.',
      slots: [['adas', 'Desktop', 'desktop'], ['adas', 'Mobile', 'mobile']],
    },
    {
      title: 'Overview → Spesifikasi visual',
      note: 'Hanya background blok spesifikasi di Overview. Bukan hero halaman Specifications.',
      slots: [['specs_visual', 'Desktop', 'desktop'], ['specs_visual', 'Mobile', 'mobile']],
    },
    {
      title: 'Overview → CTA akhir',
      note: 'Hanya background CTA di bawah Overview.',
      slots: [['final_cta', 'Desktop', 'desktop'], ['final_cta', 'Mobile', 'mobile']],
    },
    {
      title: 'Technology → Intelligence',
      note: 'Hanya scene kecerdasan di halaman Technology. Tidak memakai gambar Overview → Technology.',
      slots: [['tech_intelligence', 'Desktop', 'desktop'], ['tech_intelligence', 'Mobile', 'mobile']],
    },
    {
      title: 'Technology → CTA',
      note: 'Hanya CTA di bawah halaman Technology. Tidak memakai gambar CTA Overview.',
      slots: [['tech_cta', 'Desktop', 'desktop'], ['tech_cta', 'Mobile', 'mobile']],
    },
  ]
  const [assignments,setAssignments]=useState<Array<{slot_key:string;breakpoint:string|null;media_assets?:{id:string;public_url:string|null;alt_text:string|null;focal_x:number|null;focal_y:number|null}}>>([])
  useEffect(()=>{fetch(`/api/admin/content-media?content_type=model&content_key=${encodeURIComponent(slug)}`).then(r=>r.json()).then(j=>setAssignments(j.assignments??[]))},[slug])
  return <div className={styles.section}>
    <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>Gambar section</h2><p className={styles.sectionNote}>Satu kartu = satu section di website. Hero Overview, Technology, dan Specifications ada di tab Heroes. Gambar fitur teknologi ada di Content → Technology. Warna ada di tab Colors.</p></div></div>
    {groups.map((group) => (
      <div key={group.title} className={styles.contentBlock}>
        <div className={styles.contentBlockHeader}>
          <div>
            <p className={styles.contentBlockKicker}>GAMBAR</p>
            <h3 className={styles.contentBlockTitle}>{group.title}</h3>
          </div>
        </div>
        <p className={styles.sectionNote}>{group.note}</p>
        <div className={styles.contentSectionGrid}>
          {group.slots.map(([slot, label, breakpoint]) => (
            <div key={`${slot}-${breakpoint}`} className={styles.contentBlock}>
              <div className={styles.contentBlockHeader}><h3 className={styles.contentBlockTitle}>{label}</h3><span className={styles.contentSectionStatus}>{group.title}</span></div>
              <div className={styles.field}><MediaAssignmentField slug={slug} slot={slot} breakpoint={breakpoint} assignments={assignments} fieldLabel={label}/></div>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className={styles.contentBlock}><h3 className={styles.contentBlockTitle}>Colors</h3><p className={styles.sectionNote}>Warna tetap dikelola dari model_colors.media_asset_id pada tab Colors.</p></div>
  </div>
}

function MediaAssignmentField({slug,slot,breakpoint,assignments,fieldLabel}:{slug:string;slot:string;breakpoint:'desktop'|'mobile';assignments:Array<{slot_key:string;breakpoint:string|null;media_assets?:{id:string;public_url:string|null;alt_text:string|null;focal_x:number|null;focal_y:number|null}}>;fieldLabel?:string}) {
  const initial=assignments.find(x=>x.slot_key===slot&&x.breakpoint===breakpoint)?.media_assets
  const [asset,setAsset]=useState(initial)
  const [open,setOpen]=useState(false)
  const [message,setMessage]=useState('')
  useEffect(()=>{ setAsset(initial) }, [initial?.id, initial?.public_url])
  async function choose(next:MediaAsset){
    setOpen(false); setMessage('')
    const r=await fetch('/api/admin/content-media',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content_type:'model',content_key:slug,slot_key:slot,breakpoint,media_asset_id:next.id})})
    if (r.ok) {
      setAsset({ id: next.id, public_url: next.public_url, alt_text: next.alt_text, focal_x: next.focal_x, focal_y: next.focal_y })
      setMessage('Tersimpan ✓')
    } else {
      setMessage((await r.json()).error||'Gagal')
    }
  }
  async function remove(){
    const p=new URLSearchParams({content_type:'model',content_key:slug,slot_key:slot,breakpoint})
    const r=await fetch(`/api/admin/content-media?${p}`,{method:'DELETE'})
    if (r.ok) { setAsset(undefined); setMessage('Gambar dikosongkan ✓') }
    else setMessage('Gagal menghapus')
  }
  return <div>
    <div className={styles.label}>{fieldLabel ?? `${breakpoint} image`}</div>
    {asset?.public_url
      ? <img src={asset.public_url} alt={asset.alt_text??slot} style={{width:'100%',aspectRatio:'16/7',objectFit:'cover',borderRadius:8,display:'block',margin:'8px 0'}}/>
      : <div className={styles.fieldNote}>Belum ada gambar {breakpoint}.</div>}
    <div className={styles.rowActions}>
      <button className={styles.btnSecondary} type="button" onClick={()=>setOpen(true)}>{asset ? 'Ganti dari Media Library' : 'Pilih dari Media Library'}</button>
      {asset && <button className={styles.btnSecondary} type="button" onClick={remove}>Hapus</button>}
    </div>
    {message&&<div className={styles.fieldNote}>{message}</div>}
    <MediaPicker open={open} onClose={()=>setOpen(false)} onSelect={choose} title={`Pilih ${breakpoint} — ${slot}`}/>
  </div>
}

/* ─── Content Tab ──────────────────────────────────────── */

const PAGE_GROUPS: Array<{
  title: string
  note: string
  fields: Array<{
    key: keyof ModelPageCopy
    title: string
    where: string
    withLabel?: boolean
    withHeading?: boolean
    withBody?: boolean
    withStat?: boolean
    withButtons?: boolean
  }>
}> = [
  {
    title: "Overview",
    note: "Gambar Model Hero ada di tab Heroes. Harga ada di Variants.",
    fields: [
      { key: "hero_cta", title: "Hero — tombol", where: "Overview → Hero", withLabel: false, withHeading: false, withButtons: true },
      { key: "performance", title: "Performa", where: "Overview → Performa", withBody: true },
      { key: "cta", title: "CTA akhir", where: "Overview → CTA akhir", withBody: true, withButtons: true },
    ],
  },
  {
    title: "Design",
    note: "Gambar tiap section ada di tab Image Slots, grup Exterior dan Interior.",
    fields: [
      { key: "exterior", title: "Exterior", where: "Overview → Exterior", withBody: true },
      { key: "design", title: "Design detail", where: "Overview → Design detail", withBody: true },
      { key: "profile", title: "Profile", where: "Overview → Profile" },
      { key: "interior", title: "Interior", where: "Overview → Interior", withBody: true },
      { key: "cockpit", title: "Cockpit", where: "Overview → Cockpit", withBody: true },
    ],
  },
  {
    title: "Technology",
    note: "Headline fitur dan gambar fitur ada di blok Technology di bawah. Gambar scene ada di Image Slots.",
    fields: [
      { key: "adas", title: "ADAS / keselamatan", where: "Gambar: Gambar section → Overview → ADAS & Safety", withBody: true, withStat: true },
      { key: "tech_intelligence", title: "Scene kecerdasan", where: "Technology → Intelligence", withBody: true },
      { key: "tech_close", title: "CTA Technology", where: "Technology → CTA akhir", withBody: true, withButtons: true },
    ],
  },
  {
    title: "Specifications",
    note: "Tabel angka ada di tab Specifications. Teks ini hanya penutup halaman spesifikasi.",
    fields: [
      { key: "specs_cta", title: "CTA spesifikasi", where: "Specifications → CTA", withBody: true, withButtons: true },
    ],
  },
]

function heroMediaFromModel(model: AdminModel): MediaWithArtDirection {
  const hero = model.model_content?.find((item) => item.section === "hero")?.content as Record<string, unknown> | undefined
  const image = (hero?.image as Record<string, string> | undefined) ?? {}
  const desktop = image.desktop || ""
  return {
    image: {
      desktop,
      tablet: image.tablet || desktop,
      mobile: image.mobile || desktop,
      alt: image.alt || model.name,
    },
    media_asset_id: typeof hero?.media_asset_id === "string" ? hero.media_asset_id : undefined,
  }
}

function emptyFeature(): ModelFeature {
  return { id: `feature-${Date.now()}`, title: "", description: "", tag: "" }
}

function ContentTab({ model, slug }: { model: AdminModel; slug: string }) {
  const staticModel = MODELS.find((item) => item.slug === slug)
  const getSection = (section: string) =>
    model.model_content?.find((c) => c.section === section)?.content ?? {}

  const techInit = getSection("technology") as {
    headline?: string
    subheadline?: string
    description?: string
    features?: ModelFeature[]
  }
  const pageInit = getSection("page") as ModelPageCopy & { highlights?: ModelHighlight[] }
  const fallbackCopy = staticModel?.page_copy ?? {}
  const fallbackHighlights = staticModel?.highlights ?? []
  const fallbackFeatures = staticModel?.technology.features ?? []

  const [pageCopy, setPageCopy] = useState<ModelPageCopy>({ ...fallbackCopy, ...pageInit })
  const [highlights, setHighlights] = useState<ModelHighlight[]>(
    pageInit.highlights?.length ? pageInit.highlights : fallbackHighlights,
  )
  const [techStats, setTechStats] = useState<ModelHighlight[]>(
    pageInit.tech_stats?.length ? pageInit.tech_stats : staticModel?.page_copy?.tech_stats ?? [],
  )
  const pageSeo = pageInit as ModelPageCopy & { meta_title?: string; meta_description?: string }
  const [seo, setSeo] = useState({
    meta_title: pageSeo.meta_title || staticModel?.meta_title || "",
    meta_description: pageSeo.meta_description || staticModel?.meta_description || "",
  })
  const [technology, setTechnology] = useState({
    headline: techInit.headline || staticModel?.technology.headline || "",
    subheadline: techInit.subheadline || techInit.description || staticModel?.technology.subheadline || "",
  })
  const [features, setFeatures] = useState<ModelFeature[]>(
    techInit.features?.length ? techInit.features : fallbackFeatures,
  )
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [heroHeading, setHeroHeading] = useState(model.tagline || "")
  const [previewSection, setPreviewSection] = useState("exterior")
  const [textEditMode, setTextEditMode] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element)) {
        setTextEditMode(false)
        setFocusedField(null)
        return
      }
      const field = target.closest("[data-preview-field]")
      const section = field?.closest("[data-preview-section]")?.getAttribute("data-preview-section")
      if (field && section) {
        setPreviewSection(section)
        setTextEditMode(true)
        setFocusedField(field.getAttribute("data-preview-field"))
        return
      }
      setTextEditMode(false)
      setFocusedField(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function patchSection(key: keyof ModelPageCopy, patch: Partial<ModelSectionCopy>, field?: string) {
    setPageCopy((current) => ({
      ...current,
      [key]: { ...(current[key] as ModelSectionCopy | undefined), ...patch },
    }))
    setPreviewSection(String(key))
    setTextEditMode(true)
    if (field) setFocusedField(field)
  }

  function leaveTextPreview(event: FocusEvent<HTMLElement>) {
    const next = event.relatedTarget
    if (!(next instanceof Element)) return
    if (next.closest("[data-preview-field]")) return
    setTextEditMode(false)
    setFocusedField(null)
  }

  function savePage() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/content`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "page",
            content: await (async () => {
              const latest = await fetch(`/api/admin/models/${slug}`).then((response) => response.json()).catch(() => null)
              const current = latest?.model?.model_content?.find((item: { section: string }) => item.section === "page")?.content ?? {}
              return {
                ...current,
                ...pageCopy,
                highlights,
                tech_stats: techStats,
                meta_title: seo.meta_title,
                meta_description: seo.meta_description,
              }
            })(),
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Gagal menyimpan")
        setFeedback({ type: "success", msg: "Copy halaman tersimpan ✓" })
      } catch (err) {
        setFeedback({ type: "error", msg: String(err) })
      }
    })
  }

  function saveTechnology(nextFeatures = features) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/content`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "technology",
            content: {
              headline: technology.headline,
              subheadline: technology.subheadline,
              features: nextFeatures,
            },
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Gagal menyimpan")
        setFeedback({ type: "success", msg: "Technology tersimpan ✓" })
      } catch (err) {
        setFeedback({ type: "error", msg: String(err) })
      }
    })
  }

  async function assignFeatureImage(asset: MediaAsset) {
    if (pickerIndex === null) return
    const index = pickerIndex
    setPickerIndex(null)
    const next = features.map((feature, i) => i === index
      ? {
          ...feature,
          media: {
            media_asset_id: asset.id,
            image: {
              desktop: asset.public_url ?? undefined,
              alt: asset.alt_text || feature.title,
            },
          },
        }
      : feature)
    setFeatures(next)
    saveTechnology(next)
  }

  return (
    <div
      className={styles.previewLayout}
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement
        const section = target.closest?.("[data-preview-section]")?.getAttribute("data-preview-section")
        const field = target.getAttribute?.("data-preview-field")
        if (!section) return
        setPreviewSection(section)
        setTextEditMode(true)
        if (field) setFocusedField(field)
      }}
      onBlurCapture={leaveTextPreview}
    >
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Page Content</h2>
          <p className={styles.sectionNote}>
            Copy ini hanya untuk model yang sedang dibuka. Menyimpan technology tidak menghapus daftar fitur.
          </p>
        </div>
      </div>
      {feedback && <Feedback type={feedback.type} message={feedback.msg} />}

      <div className={styles.contentBlock} data-preview-section="hero">
        <div className={styles.field}>
          <label className={styles.label}>Hero Heading</label>
          <textarea
            className={styles.textarea}
            data-preview-field="heading"
            rows={2}
            value={heroHeading}
            onFocus={() => { setPreviewSection("hero"); setTextEditMode(true); setFocusedField("heading") }}
            onChange={(e) => { setHeroHeading(e.target.value); setPreviewSection("hero"); setTextEditMode(true); setFocusedField("heading") }}
          />
        </div>
      </div>

      {PAGE_GROUPS.map((group) => (
        <div key={group.title}>
          <div className={styles.contentBlock}>
            <p className={styles.contentBlockKicker}>{group.title.toUpperCase()}</p>
            <h3 className={styles.contentBlockTitle}>{group.title}</h3>
            <p className={styles.sectionNote}>{group.note}</p>
          </div>
          {group.fields.map((field) => {
            const value = (pageCopy[field.key] as ModelSectionCopy | undefined) ?? {}
            const showLabel = field.withLabel !== false
            const showHeading = field.withHeading !== false
            return (
              <div key={field.key} className={styles.contentBlock} data-preview-section={String(field.key)} onFocusCapture={() => setPreviewSection(String(field.key))}>
                <div className={styles.contentBlockHeader}>
                  <h3 className={styles.contentBlockTitle}>{field.title}</h3>
                  <span className={styles.contentSectionStatus}>{field.where}</span>
                </div>
                {showLabel && (
                  <div className={styles.field}>
                    <label className={styles.label}>Label</label>
                    <input className={styles.input} data-preview-field="label" value={value.label ?? ""} onChange={(e) => patchSection(field.key, { label: e.target.value }, "label")} />
                  </div>
                )}
                {showHeading && (
                  <div className={styles.field}>
                    <label className={styles.label}>Heading</label>
                    <textarea className={styles.textarea} data-preview-field="heading" rows={3} value={value.heading ?? ""} onChange={(e) => patchSection(field.key, { heading: e.target.value }, "heading")} />
                    <span className={styles.fieldNote}>Satu baris baru = satu baris di halaman.</span>
                  </div>
                )}
                {field.withBody && (
                  <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} data-preview-field="body" rows={3} value={value.body ?? ""} onChange={(e) => patchSection(field.key, { body: e.target.value }, "body")} />
                  </div>
                )}
                {field.withStat && (
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Angka</label>
                      <input className={styles.input} value={value.stat ?? ""} onChange={(e) => patchSection(field.key, { stat: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Satuan</label>
                      <input className={styles.input} value={value.unit ?? ""} onChange={(e) => patchSection(field.key, { unit: e.target.value })} />
                    </div>
                  </div>
                )}
                {field.withButtons && (
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Teks tombol utama</label>
                      <input className={styles.input} data-preview-field="primary" value={value.primary_label ?? ""} onChange={(e) => patchSection(field.key, { primary_label: e.target.value }, "primary")} />
                    </div>
                    {field.key !== "specs_cta" && (
                      <div className={styles.field}>
                        <label className={styles.label}>Teks tombol kedua</label>
                        <input className={styles.input} value={value.secondary_label ?? ""} onChange={(e) => patchSection(field.key, { secondary_label: e.target.value })} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {group.title === "Overview" && (
            <div className={styles.contentBlock} data-preview-section="performance" onFocusCapture={() => setPreviewSection("performance")}>
              <div className={styles.contentBlockHeader}>
                <h3 className={styles.contentBlockTitle}>Angka performa</h3>
                <span className={styles.contentSectionStatus}>Overview → Performa</span>
              </div>
              {highlights.map((item, index) => (
                <div key={index} className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nilai</label>
                    <input className={styles.input} value={item.value} onChange={(e) => setHighlights((rows) => rows.map((row, i) => i === index ? { ...row, value: e.target.value } : row))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Label</label>
                    <input className={styles.input} value={item.label} onChange={(e) => setHighlights((rows) => rows.map((row, i) => i === index ? { ...row, label: e.target.value } : row))} />
                  </div>
                  <button className={styles.btnSecondary} type="button" onClick={() => setHighlights((rows) => rows.filter((_, i) => i !== index))}>Hapus</button>
                </div>
              ))}
              <button className={styles.btnSecondary} type="button" onClick={() => setHighlights((rows) => [...rows, { value: "", label: "" }])}>+ Angka</button>
            </div>
          )}
          {group.title === "Technology" && (
            <div className={styles.contentBlock} data-preview-section="tech_intelligence" onFocusCapture={() => setPreviewSection("tech_intelligence")}>
              <div className={styles.contentBlockHeader}>
                <h3 className={styles.contentBlockTitle}>Angka technology</h3>
                <span className={styles.contentSectionStatus}>Technology → stat strip</span>
              </div>
              <p className={styles.sectionNote}>Empat angka di bawah scene teknologi. Bukan tabel Specifications.</p>
              {techStats.map((item, index) => (
                <div key={index} className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nilai</label>
                    <input className={styles.input} value={item.value} onChange={(e) => setTechStats((rows) => rows.map((row, i) => i === index ? { ...row, value: e.target.value } : row))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Label</label>
                    <input className={styles.input} value={item.label} onChange={(e) => setTechStats((rows) => rows.map((row, i) => i === index ? { ...row, label: e.target.value } : row))} />
                  </div>
                  <button className={styles.btnSecondary} type="button" onClick={() => setTechStats((rows) => rows.filter((_, i) => i !== index))}>Hapus</button>
                </div>
              ))}
              <button className={styles.btnSecondary} type="button" onClick={() => setTechStats((rows) => [...rows, { value: "", label: "" }])}>+ Angka</button>
            </div>
          )}
        </div>
      ))}

      <div className={styles.contentBlock}>
        <div className={styles.contentBlockHeader}>
          <h3 className={styles.contentBlockTitle}>SEO halaman model</h3>
          <span className={styles.contentSectionStatus}>Overview, Technology, Specifications</span>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Meta title</label>
          <input className={styles.input} value={seo.meta_title} onChange={(e) => setSeo((row) => ({ ...row, meta_title: e.target.value }))} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Meta description</label>
          <textarea className={styles.textarea} rows={3} value={seo.meta_description} onChange={(e) => setSeo((row) => ({ ...row, meta_description: e.target.value }))} />
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} type="button" onClick={savePage} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan copy halaman"}
        </button>
      </div>

      <div className={styles.contentBlock} data-preview-section="technology" onFocusCapture={() => setPreviewSection("technology")}>
        <div className={styles.contentBlockHeader}>
          <div>
            <p className={styles.contentBlockKicker}>TECHNOLOGY</p>
            <h3 className={styles.contentBlockTitle}>Technology</h3>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Headline</label>
          <input className={styles.input} data-preview-field="heading" value={technology.headline} onFocus={() => { setPreviewSection("technology"); setTextEditMode(true); setFocusedField("heading") }} onChange={(e) => { setTechnology((row) => ({ ...row, headline: e.target.value })); setPreviewSection("technology"); setTextEditMode(true); setFocusedField("heading") }} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Subheadline</label>
          <textarea className={styles.textarea} data-preview-field="body" rows={3} value={technology.subheadline} onFocus={() => { setPreviewSection("technology"); setTextEditMode(true); setFocusedField("body") }} onChange={(e) => { setTechnology((row) => ({ ...row, subheadline: e.target.value })); setPreviewSection("technology"); setTextEditMode(true); setFocusedField("body") }} />
        </div>
        {features.map((feature, index) => (
          <div key={feature.id || index} className={styles.contentBlock}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Tag</label>
                <input className={styles.input} value={feature.tag ?? ""} onChange={(e) => setFeatures((rows) => rows.map((row, i) => i === index ? { ...row, tag: e.target.value } : row))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Judul</label>
                <input className={styles.input} value={feature.title} onChange={(e) => setFeatures((rows) => rows.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Deskripsi</label>
              <textarea className={styles.textarea} rows={3} value={feature.description} onChange={(e) => setFeatures((rows) => rows.map((row, i) => i === index ? { ...row, description: e.target.value } : row))} />
            </div>
            {feature.media?.image?.desktop && (
              <img src={feature.media.image.desktop} alt={feature.title} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
            )}
            <div className={styles.rowActions}>
              <button className={styles.btnSecondary} type="button" onClick={() => setPickerIndex(index)}>
                {feature.media?.media_asset_id ? "Ganti gambar fitur" : "Pilih gambar fitur"}
              </button>
              <button className={styles.btnSecondary} type="button" onClick={() => setFeatures((rows) => rows.filter((_, i) => i !== index))}>Hapus fitur</button>
            </div>
          </div>
        ))}
        <div className={styles.rowActions}>
          <button className={styles.btnSecondary} type="button" onClick={() => setFeatures((rows) => [...rows, emptyFeature()])}>+ Fitur</button>
          <button className={styles.btnPrimary} type="button" onClick={() => saveTechnology()} disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan technology"}
          </button>
        </div>
        <MediaPicker open={pickerIndex !== null} onClose={() => setPickerIndex(null)} onSelect={assignFeatureImage} title="Pilih gambar fitur" />
      </div>
    </div>
    <div className={styles.stickyPreview}>
      <ModelStickyPreview
        slug={slug}
        modelName={model.name}
        tagline={model.tagline}
        heroImage={heroMediaFromModel(model).image.desktop}
        section={previewSection}
        textEditMode={textEditMode}
        focusedField={focusedField}
        pageCopy={pageCopy}
        highlights={highlights}
        technology={technology}
        features={features}
        heroHeading={heroHeading}
      />
    </div>
    </div>
  )
}

/* ─── Specifications Tab ───────────────────────────────── */

function SpecsTab({ model, slug }: { model: AdminModel; slug: string }) {
  const staticSpecs = MODELS.find((item) => item.slug === slug)?.specifications ?? []
  const fromDb = (model.model_specifications ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row) => ({ category: row.category, spec_label: row.spec_label, spec_value: row.spec_value }))
  const seeded = staticSpecs.flatMap((category) =>
    category.specs.map((spec) => ({ category: category.label, spec_label: spec.label, spec_value: spec.value })),
  )
  const [rows, setRows] = useState<SpecRow[]>(fromDb.length ? fromDb : seeded)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  function update(index: number, patch: Partial<SpecRow>) {
    setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row))
  }

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/specs`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specs: rows }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Gagal menyimpan spesifikasi")
        setFeedback({ type: "success", msg: "Spesifikasi tersimpan ✓" })
      } catch (err) {
        setFeedback({ type: "error", msg: String(err) })
      }
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Specifications</h2>
          <p className={styles.sectionNote}>
            Angka di sini yang tampil di halaman spesifikasi. Jangan menyalin spesifikasi model lain.
            {slug === "jaecoo-j7-sivp" && " J7 SIVP memakai lembar spesifikasi J7 SHS. Pembeda SIVP — Super Intelligent Valet Parking, LiDAR, dan 27 sensor — berada di Technology."}
          </p>
        </div>
        <button className={styles.btnAdd} type="button" onClick={() => setRows((current) => [...current, { category: "", spec_label: "", spec_value: "" }])}>+ Baris</button>
      </div>
      {feedback && <Feedback type={feedback.type} message={feedback.msg} />}
      <div className={styles.rowList}>
        {rows.map((row, index) => (
          <div key={index} className={styles.contentBlock}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Kategori</label>
                <input className={styles.input} value={row.category} onChange={(e) => update(index, { category: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Label</label>
                <input className={styles.input} value={row.spec_label} onChange={(e) => update(index, { spec_label: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nilai</label>
                <input className={styles.input} value={row.spec_value} onChange={(e) => update(index, { spec_value: e.target.value })} />
              </div>
            </div>
            <button className={styles.btnSecondary} type="button" onClick={() => setRows((current) => current.filter((_, i) => i !== index))}>Hapus</button>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} type="button" onClick={save} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan spesifikasi"}
        </button>
      </div>
    </div>
  )
}

/* ─── Heroes ───────────────────────────────────────────── */

function SubpageHeroEditor({
  model,
  slug,
  title,
  slot,
  copyKey,
  where,
  fallback,
}: {
  model: AdminModel
  slug: string
  title: string
  slot: string
  copyKey: "technology_hero" | "specifications_hero"
  where: string
  fallback: string
}) {
  const page = (model.model_content?.find((item) => item.section === "page")?.content ?? {}) as ModelPageCopy
  const [copy, setCopy] = useState<ModelSectionCopy>(page[copyKey] ?? {})
  const [assignments, setAssignments] = useState<Array<{ slot_key: string; breakpoint: string | null; media_assets?: { id: string; public_url: string | null; alt_text: string | null; focal_x: number | null; focal_y: number | null } }>>([])
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch(`/api/admin/content-media?content_type=model&content_key=${encodeURIComponent(slug)}`)
      .then((response) => response.json())
      .then((json) => setAssignments(json.assignments ?? []))
      .catch(() => setAssignments([]))
  }, [slug])

  function saveCopy() {
    startTransition(async () => {
      try {
        const latest = await fetch(`/api/admin/models/${slug}`).then((response) => response.json())
        const current = latest?.model?.model_content?.find((item: { section: string }) => item.section === "page")?.content ?? {}
        const res = await fetch(`/api/admin/models/${slug}/content`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "page", content: { ...current, [copyKey]: copy } }),
        })
        setMessage(res.ok ? "Teks hero tersimpan ✓" : "Gagal menyimpan teks hero")
      } catch {
        setMessage("Gagal menyimpan teks hero")
      }
    })
  }

  return (
    <div className={styles.contentBlock}>
      <div className={styles.contentBlockHeader}>
        <h3 className={styles.contentBlockTitle}>{title}</h3>
        <span className={styles.contentSectionStatus}>{where}</span>
      </div>
      <p className={styles.sectionNote}>{fallback} Gambar tersimpan langsung. Teks disimpan dengan tombol di bawah.</p>
      <div className={styles.field}>
        <label className={styles.label}>Eyebrow</label>
        <input className={styles.input} value={copy.label ?? ""} onChange={(e) => setCopy((row) => ({ ...row, label: e.target.value }))} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <textarea className={styles.textarea} rows={3} value={copy.heading ?? ""} onChange={(e) => setCopy((row) => ({ ...row, heading: e.target.value }))} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea className={styles.textarea} rows={3} value={copy.body ?? ""} onChange={(e) => setCopy((row) => ({ ...row, body: e.target.value }))} />
      </div>
      <MediaAssignmentField slug={slug} slot={slot} breakpoint="desktop" assignments={assignments} fieldLabel="Desktop image" />
      <MediaAssignmentField slug={slug} slot={slot} breakpoint="mobile" assignments={assignments} fieldLabel="Mobile image" />
      <div className={styles.actions}>
        <button className={styles.btnPrimary} type="button" onClick={saveCopy} disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan teks hero"}</button>
      </div>
      {message && <p className={styles.fieldNote}>{message}</p>}
    </div>
  )
}

function HeroesTab({ model, slug }: { model: AdminModel; slug: string }) {
  return (
    <div>
      <BasicTab model={model} slug={slug} mode="hero" />
      <SubpageHeroEditor
        model={model}
        slug={slug}
        title="Technology Hero"
        slot="technology_hero"
        copyKey="technology_hero"
        where="Halaman Technology"
        fallback="Kalau gambar ini kosong, halaman Technology memakai Model Hero."
      />
      <SubpageHeroEditor
        model={model}
        slug={slug}
        title="Specifications Hero"
        slot="specifications_hero"
        copyKey="specifications_hero"
        where="Halaman Specifications"
        fallback="Kalau gambar ini kosong, halaman Specifications memakai Model Hero."
      />
    </div>
  )
}

/* ─── Main ModelEditor ─────────────────────────────────── */

export function ModelEditor({ initialModel, slug }: ModelEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')

  const TABS: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'heroes', label: 'Heroes' },
    { id: 'variants', label: `Variants (${initialModel.model_variants?.length ?? 0})` },
    { id: 'colors', label: `Colors (${initialModel.model_colors?.length ?? 0})` },
    { id: 'imageSlots', label: 'Gambar section' },
    { id: 'content', label: 'Content' },
    { id: 'specs', label: 'Specifications' },
  ]

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.topHeader}>
        <div>
          <Link href="/admin/models" className={styles.backLink}>← Models</Link>
          <h1 className={styles.pageTitle}>{initialModel.name}</h1>
        </div>
        <div className={styles.headerMeta}>
          <span className={initialModel.published ? styles.badgePublished : styles.badgeDraft}>
            {initialModel.published ? 'Published' : 'Draft'}
          </span>
          <a
            href={`/model/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewLink}
          >
            Lihat di website ↗
          </a>
        </div>
      </div>

      <div className={styles.goldLine} />

      <div className={styles.editorMap}>
        <p className={styles.editorMapTitle}>Lokasi edit — sama untuk J5, J7 SHS, J7 SIVP, dan J8</p>
        <ul>
          <li><strong>Basic Info</strong> — nama, short name, tagline, deskripsi, publish</li>
          <li><strong>Heroes</strong> — Model Hero (Overview), Technology Hero, Specifications Hero. Hero sub-page kosong memakai Model Hero</li>
          <li><strong>Variants</strong> — harga, status harga, label varian</li>
          <li><strong>Colors</strong> — nama warna, hex, foto warna</li>
          <li><strong>Gambar section</strong> — satu kartu untuk satu section frontend. Bukan hero</li>
          <li><strong>Content</strong> — teks Overview, Design, Technology, CTA, angka, SEO</li>
          <li><strong>Specifications</strong> — tabel angka</li>
        </ul>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'basic' && <BasicTab model={initialModel} slug={slug} mode="identity" />}
        {activeTab === 'heroes' && <HeroesTab model={initialModel} slug={slug} />}
        {activeTab === 'variants' && <VariantsTab model={initialModel} slug={slug} />}
        {activeTab === 'colors' && <ColorsTab model={initialModel} slug={slug} />}
        {activeTab === 'imageSlots' && <ImageSlotsTab slug={slug} />}
        {activeTab === 'content' && <ContentTab model={initialModel} slug={slug} />}
        {activeTab === 'specs' && <SpecsTab model={initialModel} slug={slug} />}
      </div>
    </div>
  )
}
