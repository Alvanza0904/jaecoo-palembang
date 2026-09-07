import { createSupabaseServerClient } from './server'
import type { ModelData, ModelVariant, ModelColor, ModelSpecCategory, ModelTechnologySection, PriceStatus } from '@/lib/types/model'
import type { PresentationSettings } from '@/lib/types/presentation'
import {
  getModels as getStaticModels,
  getModelBySlug as getStaticModelBySlug,
  getModelSlugs as getStaticModelSlugs,
} from '@/lib/data/models'

interface SupabaseModel {
  id: string
  slug: string
  name: string
  short_name: string
  tagline: string
  description: string
  published: boolean
  sort_order: number
  updated_at: string
  model_variants: SupabaseVariant[]
  model_colors: SupabaseColor[]
  model_specifications: SupabaseSpec[]
  model_content: SupabaseContent[]
}

interface SupabaseVariant {
  id: string
  variant_key: string
  name: string
  label: string | null
  price_status: string
  price_idr: number | null
  price_display: string | null
  price_display_override: string | null
  price_region: string
  is_default: boolean
}

interface SupabaseColor {
  id: string
  color_key: string
  name: string
  hex: string
  image_path: string | null
  sort_order: number
}

interface SupabaseSpec {
  id: string
  category: string
  spec_label: string
  spec_value: string
  sort_order: number
}

interface SupabaseContent {
  section: string
  content: Record<string, unknown>
}

function mapModel(
  row: SupabaseModel,
  staticFallback?: ModelData,
  heroPresentationSettings?: PresentationSettings,
): ModelData {
  const variants: ModelVariant[] = (row.model_variants ?? []).map((v) => ({
    id: v.variant_key,
    name: v.name,
    label: v.label ?? undefined,
    price_status: (v.price_status ?? 'official') as PriceStatus,
    price_idr: v.price_idr ?? null,
    price_display: v.price_display ?? null,
    price_display_override: v.price_display_override ?? null,
    price_region: v.price_region,
  }))

  const defaultVariant =
    (row.model_variants ?? []).find((v) => v.is_default) ??
    (row.model_variants ?? [])[0]

  const colors: ModelColor[] = (row.model_colors ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.color_key,
      name: c.name,
      hex: c.hex,
      image: {
        desktop: c.image_path ?? `/images/models/${row.slug}/color-${c.color_key}.jpg`,
        tablet: c.image_path ?? `/images/models/${row.slug}/color-${c.color_key}.jpg`,
        mobile: c.image_path ?? `/images/models/${row.slug}/color-${c.color_key}.jpg`,
        alt: `${row.name} — ${c.name}`,
      },
    }))

  const specMap = new Map<string, Array<{ label: string; value: string }>>()
  for (const s of (row.model_specifications ?? []).sort((a, b) => a.sort_order - b.sort_order)) {
    if (!specMap.has(s.category)) specMap.set(s.category, [])
    specMap.get(s.category)!.push({ label: s.spec_label, value: s.spec_value })
  }
  const specifications: ModelSpecCategory[] = Array.from(specMap.entries()).map(
    ([label, specs]) => ({ label, specs })
  )

  const techContent = (row.model_content ?? []).find((c) => c.section === 'technology')
    const technology: ModelTechnologySection =
    (techContent?.content as unknown as ModelTechnologySection) ??

    staticFallback?.technology ?? { headline: '', features: [] }

  const heroContent = (row.model_content ?? []).find((c) => c.section === 'hero')
  const heroRaw = heroContent?.content as Record<string, unknown> | undefined

  // Map stored hero content → MediaWithArtDirection
  // Model Editor stores: { image: {...}, cutout_url: "...", media_asset_id: "..." }
  // LayeredHero expects:  { image: { ...image, cutout: "..." }, art_direction: {...} }
  const hero_media: ModelData['hero_media'] = heroRaw
    ? {
        image: {
          ...((heroRaw.image as Record<string, unknown>) ?? {}),
          alt: ((heroRaw.image as Record<string, string>)?.alt) ?? row.name,
          // Map cutout_url (root level) → image.cutout (where LayeredHero reads it)
          cutout: (heroRaw.cutout_url as string | undefined)
            ?? ((heroRaw.image as Record<string, string>)?.cutout)
            ?? undefined,
        },
        art_direction: (heroRaw.art_direction as ModelData['hero_media']['art_direction']) ?? undefined,
        presentation_settings: heroPresentationSettings,
      }
    : staticFallback?.hero_media ?? {
        image: {
          desktop: `/images/models/${row.slug}/hero-desktop.jpg`,
          tablet: `/images/models/${row.slug}/hero-tablet.jpg`,
          mobile: `/images/models/${row.slug}/hero-mobile.jpg`,
          alt: row.name,
        },
      }

  return {
    slug: row.slug as ModelData['slug'],
    name: row.name,
    short_name: row.short_name,
    tagline: row.tagline,
    description: row.description,
    hero_media,
    default_variant: defaultVariant
      ? {
          id: defaultVariant.variant_key,
          name: defaultVariant.name,
          label: defaultVariant.label ?? undefined,
          price_status: (defaultVariant.price_status ?? 'official') as PriceStatus,
          price_idr: defaultVariant.price_idr ?? null,
          price_display: defaultVariant.price_display ?? null,
          price_display_override: defaultVariant.price_display_override ?? null,
          price_region: defaultVariant.price_region,
        }
      : staticFallback!.default_variant,
    variants: variants.length > 0 ? variants : (staticFallback?.variants ?? []),
    colors: colors.length > 0 ? colors : (staticFallback?.colors ?? []),
    technology,
    specifications: specifications.length > 0 ? specifications : (staticFallback?.specifications ?? []),
    published: row.published,
    updated_at: row.updated_at,
  }
}

const MODEL_SELECT = `
  *,
  model_variants(*),
  model_colors(*),
  model_specifications(*),
  model_content(section, content)
`

export async function getModels(): Promise<ModelData[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('models')
      .select(MODEL_SELECT)
      .eq('published', true)
      .order('sort_order')

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No models returned')

    const staticModels = getStaticModels()
    return (data as SupabaseModel[]).map((row) => {
      const fallback = staticModels.find((m) => m.slug === row.slug)
      return mapModel(row, fallback)
    })
  } catch (err) {
    console.warn('[Supabase] getModels() failed — using static fallback:', err)
    return getStaticModels()
  }
}

export async function getModelBySlug(slug: string): Promise<ModelData | undefined> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('models')
      .select(MODEL_SELECT)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) throw error
    if (!data) return undefined

    const row = data as SupabaseModel
    const heroContent = (row.model_content ?? []).find((c) => c.section === 'hero')
    const heroRaw = heroContent?.content as Record<string, unknown> | undefined
    const mediaAssetId = heroRaw?.media_asset_id

    // model_content.hero stores only the media asset ID. The Visual Media Editor
    // stores its source-of-truth presentation settings on media_assets.
    let heroPresentationSettings: PresentationSettings | undefined
    if (typeof mediaAssetId === 'string' && mediaAssetId) {
      const { data: mediaAsset, error: mediaError } = await supabase
        .from('media_assets')
        .select('presentation_settings')
        .eq('id', mediaAssetId)
        .maybeSingle()

      if (mediaError) {
        console.warn(`[Supabase] Hero media presentation lookup failed for ${slug}:`, mediaError)
      } else {
        heroPresentationSettings = mediaAsset?.presentation_settings as PresentationSettings | undefined
      }
    }

    const fallback = getStaticModelBySlug(slug)
    return mapModel(row, fallback, heroPresentationSettings)
  } catch (err) {
    console.warn(`[Supabase] getModelBySlug(${slug}) failed — using static fallback:`, err)
    return getStaticModelBySlug(slug)
  }
}

export async function getModelSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('models')
      .select('slug')
      .eq('published', true)
      .order('sort_order')

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No slugs returned')

    return data.map((m: { slug: string }) => m.slug)
  } catch (err) {
    console.warn('[Supabase] getModelSlugs() failed — using static fallback:', err)
    return getStaticModelSlugs()
  }
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('models').select('slug').limit(1)
    if (error) throw error
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
