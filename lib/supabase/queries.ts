/**
 * JAECOO Palembang — Supabase Query Helpers
 *
 * STEP 4A: Stub — mirrors static data API exactly.
 *
 * When Supabase is connected, these replace functions in lib/data/models.ts.
 * Page components use the same function signatures — no page changes needed.
 *
 * Usage:
 *   Replace: import { getModels } from '@/lib/data/models'
 *   With:    import { getModels } from '@/lib/supabase/queries'
 */

// import { supabase } from './client'
// import type { ModelData } from '@/lib/types/model'
//
// export async function getModels(): Promise<ModelData[]> {
//   const { data, error } = await supabase
//     .from('models')
//     .select(`
//       *,
//       model_variants(*),
//       model_colors(*),
//       model_specifications(*),
//       model_content(*)
//     `)
//     .eq('published', true)
//     .order('sort_order')
//
//   if (error) throw error
//   return data as ModelData[]
// }
//
// export async function getModelBySlug(slug: string): Promise<ModelData | undefined> {
//   const { data, error } = await supabase
//     .from('models')
//     .select(`
//       *,
//       model_variants(*),
//       model_colors(*),
//       model_specifications(*),
//       model_content(*)
//     `)
//     .eq('slug', slug)
//     .eq('published', true)
//     .single()
//
//   if (error) return undefined
//   return data as ModelData
// }
//
// export async function getModelSlugs(): Promise<string[]> {
//   const { data, error } = await supabase
//     .from('models')
//     .select('slug')
//     .eq('published', true)
//     .order('sort_order')
//
//   if (error) throw error
//   return data.map((m) => m.slug)
// }

export {}; // placeholder — remove when activating
