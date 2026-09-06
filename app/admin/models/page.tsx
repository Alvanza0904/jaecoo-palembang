/**
 * JAECOO Palembang — Admin: Model List
 * STEP 5B: Tampilkan semua models dari Supabase
 *
 * Server Component — fetch langsung dari Supabase server client.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'
import styles from './models.module.css'

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
