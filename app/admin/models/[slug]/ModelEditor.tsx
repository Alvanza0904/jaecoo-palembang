'use client'

/**
 * JAECOO Palembang — Model Editor (Client Component)
 * STEP 5B + 5C: Full CMS editor dengan tab Basic / Variants / Colors / Content
 * STEP 5C: Tambah Media Picker untuk Hero Image dan Color images
 *
 * Semua save langsung ke Supabase via API routes (authenticated).
 */

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import styles from './editor.module.css'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import type { MediaAsset } from '@/lib/types/media-asset'

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
}

interface ModelEditorProps {
  initialModel: AdminModel
  slug: string
}

type TabId = 'basic' | 'variants' | 'colors' | 'content'

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

function BasicTab({ model, slug }: { model: AdminModel; slug: string }) {
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

  // Hero image — loaded from model_content.hero section
  const heroContent = model.model_content?.find((c) => c.section === 'hero')?.content as Record<string, unknown> | undefined
  const heroImageInit = (heroContent?.image as Record<string, string> | undefined)?.desktop ?? ''
  const [heroImageUrl, setHeroImageUrl] = useState(heroImageInit)

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

      {/* ── Hero Image ─────────────────────────────── */}
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
                      setHeroAssetId(null)
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

/* ─── Content Tab ──────────────────────────────────────── */

function ContentTab({ model, slug }: { model: AdminModel; slug: string }) {
  const getSection = (section: string) =>
    model.model_content?.find((c) => c.section === section)?.content ?? {}

  const ovInit = getSection('overview') as { headline?: string; description?: string }
  const techInit = getSection('technology') as { headline?: string; description?: string }

  const [overview, setOverview] = useState({ headline: ovInit.headline ?? '', description: ovInit.description ?? '' })
  const [technology, setTechnology] = useState({ headline: techInit.headline ?? '', description: techInit.description ?? '' })
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function handleSave(section: 'overview' | 'technology', content: Record<string, string>) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/models/${slug}/content`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, content }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan')
        setFeedback({ type: 'success', msg: `Section "${section}" tersimpan ✓` })
      } catch (err) {
        setFeedback({ type: 'error', msg: String(err) })
      }
    })
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Content</h2>
      <p className={styles.sectionNote}>
        Konten tersimpan di Supabase model_content. Perubahan langsung terefleksi di public website.
      </p>

      {feedback && <Feedback type={feedback.type} message={feedback.msg} />}

      {/* Overview */}
      <div className={styles.contentBlock}>
        <h3 className={styles.contentBlockTitle}>Overview</h3>
        <div className={styles.field}>
          <label className={styles.label}>Headline</label>
          <input
            className={styles.input}
            value={overview.headline}
            onChange={(e) => setOverview((f) => ({ ...f, headline: e.target.value }))}
            placeholder="Inovasi yang Menggerakkan Masa Depan"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={overview.description}
            onChange={(e) => setOverview((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => handleSave('overview', overview)}
          disabled={isPending}
        >
          {isPending ? '...' : 'Simpan Overview'}
        </button>
      </div>

      {/* Technology */}
      <div className={styles.contentBlock}>
        <h3 className={styles.contentBlockTitle}>Technology</h3>
        <div className={styles.field}>
          <label className={styles.label}>Headline</label>
          <input
            className={styles.input}
            value={technology.headline}
            onChange={(e) => setTechnology((f) => ({ ...f, headline: e.target.value }))}
            placeholder="Teknologi di Balik Performa"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={technology.description}
            onChange={(e) => setTechnology((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <button
          className={styles.btnSecondary}
          onClick={() => handleSave('technology', technology)}
          disabled={isPending}
        >
          {isPending ? '...' : 'Simpan Technology'}
        </button>
      </div>
    </div>
  )
}

/* ─── Main ModelEditor ─────────────────────────────────── */

export function ModelEditor({ initialModel, slug }: ModelEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')

  const TABS: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'variants', label: `Variants (${initialModel.model_variants?.length ?? 0})` },
    { id: 'colors', label: `Colors (${initialModel.model_colors?.length ?? 0})` },
    { id: 'content', label: 'Content' },
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
        {activeTab === 'basic' && <BasicTab model={initialModel} slug={slug} />}
        {activeTab === 'variants' && <VariantsTab model={initialModel} slug={slug} />}
        {activeTab === 'colors' && <ColorsTab model={initialModel} slug={slug} />}
        {activeTab === 'content' && <ContentTab model={initialModel} slug={slug} />}
      </div>
    </div>
  )
}
