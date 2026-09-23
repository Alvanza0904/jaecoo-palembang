/**
 * JAECOO Palembang — Admin: Model Editor
 * STEP 5B: Server wrapper yang fetch data lalu pass ke client editor
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ModelEditor } from './ModelEditor'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getAdminModel(slug: string) {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('models')
    .select(`
      *,
      model_variants(id, variant_key, name, label, price_status, price_idr, price_display, price_display_override, price_region, is_default),
      model_colors(id, color_key, name, hex, image_path, media_asset_id, sort_order),
      model_content(section, content),
      model_specifications(id, category, spec_label, spec_value, sort_order)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return { title: `Edit ${slug}` }
}

export default async function AdminModelEditorPage({ params }: PageProps) {
  const { slug } = await params

  let model: Awaited<ReturnType<typeof getAdminModel>> = null

  try {
    model = await getAdminModel(slug)
  } catch {
    // Supabase error — will be shown in UI
  }

  if (model === null) {
    notFound()
  }

  return <ModelEditor initialModel={model} slug={slug} />
}
