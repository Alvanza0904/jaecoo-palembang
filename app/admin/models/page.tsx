/**
 * JAECOO Palembang — Admin: Model List
 * STEP 5B: Tampilkan semua models dari Supabase
 *
 * Server Component — fetch langsung dari Supabase server client.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MODELS } from '@/lib/data/models'
import styles from './models.module.css'

async function ensureCatalogModels() {
  const supabase = await createSupabaseServerClient()
  const { data: existing, error } = await supabase.from('models').select('id, slug, description, short_name')
  if (error || !existing) return

  const bySlug = new Map(existing.map((row) => [row.slug as string, row]))

  for (const model of MODELS) {
    const current = bySlug.get(model.slug)
    if (!current) {
      const { data: inserted, error: insertError } = await supabase
        .from('models')
        .insert({
          slug: model.slug,
          name: model.name,
          short_name: model.short_name,
          tagline: model.tagline,
          description: model.description,
          published: model.published,
          sort_order: Math.round(model.sort_order ?? 0),
        })
        .select('id')
        .single()
      if (insertError || !inserted) continue

      const variant = model.default_variant
      await supabase.from('model_variants').insert({
        model_id: inserted.id,
        variant_key: variant.id,
        name: variant.name,
        label: variant.label ?? null,
        price_status: variant.price_status,
        price_idr: variant.price_idr,
        price_display: variant.price_display,
        price_region: variant.price_region,
        is_default: true,
      })

      if (model.colors.length) {
        await supabase.from('model_colors').insert(
          model.colors.map((color, index) => ({
            model_id: inserted.id,
            color_key: color.id,
            name: color.name,
            hex: color.hex,
            sort_order: index + 1,
          })),
        )
      }

      const specRows = model.specifications.flatMap((category, categoryIndex) =>
        category.specs.map((spec, specIndex) => ({
          model_id: inserted.id,
          category: category.label,
          spec_label: spec.label,
          spec_value: spec.value,
          sort_order: categoryIndex * 100 + specIndex,
        })),
      )
      if (specRows.length) {
        await supabase.from('model_specifications').insert(specRows)
      }
      continue
    }

    const patch: { description?: string; short_name?: string } = {}
    if (model.slug === 'jaecoo-j7-shs' && typeof current.description === 'string' && current.description.includes('kemampuan AWD')) {
      patch.description = model.description
    }
    if (model.slug === 'jaecoo-j8-shs' && !String(current.short_name ?? '').trim()) {
      patch.short_name = model.short_name
    }
    if (Object.keys(patch).length) {
      await supabase.from('models').update(patch).eq('id', current.id)
    }
  }
}

async function getAdminModels() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      model_variants(id),
      model_colors(id)
    `)
    .order('sort_order')

  if (error) throw error
  return data ?? []
}

export const metadata = { title: 'Models' }

export default async function AdminModelsPage() {
  let models: Awaited<ReturnType<typeof getAdminModels>> = []
  let fetchError: string | null = null

  try {
    try {
      await ensureCatalogModels()
    } catch {
      // Catalog sync is best-effort. The existing list still renders.
    }
    models = await getAdminModels()
  } catch (err) {
    fetchError = String(err)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Admin</p>
          <h1 className={styles.title}>Models</h1>
        </div>
        <span className={styles.count}>{models.length} model</span>
      </div>

      <div className={styles.goldLine} />

      {fetchError ? (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠</span>
          <div>
            <strong>Gagal memuat model</strong>
            <p>{fetchError}</p>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {models.map((model) => {
            const variantCount = (model.model_variants as {id: string}[])?.length ?? 0
            const colorCount = (model.model_colors as {id: string}[])?.length ?? 0

            return (
              <a
                key={model.slug}
                href={`/admin/models/${model.slug}`}
                className={styles.card}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardName}>{model.name}</div>
                  <div className={styles.cardSlug}>/{model.slug}</div>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Variant</span>
                    <span className={styles.metaValue}>{variantCount}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Warna</span>
                    <span className={styles.metaValue}>{colorCount}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Status</span>
                    <span className={model.published ? styles.badgePublished : styles.badgeDraft}>
                      {model.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className={styles.cardEdit}>Edit →</div>
              </a>
            )
          })}
        </div>
      )}

      <p className={styles.hint}>
        Klik model untuk membuka editor. Perubahan langsung tersimpan ke Supabase.
      </p>
    </div>
  )
}
