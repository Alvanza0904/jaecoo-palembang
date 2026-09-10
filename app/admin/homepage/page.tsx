import { HomepageEditor } from '@/components/admin/homepage/HomepageEditor'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Homepage' }

async function getModels() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('models').select('id,slug,name,sort_order,published').order('sort_order')
  if (error) throw error
  return data ?? []
}

export default async function AdminHomepagePage() {
  let models: Awaited<ReturnType<typeof getModels>> = []
  let error: string | null = null
  try { models = await getModels() } catch (e) { error = e instanceof Error ? e.message : String(e) }
  return <HomepageEditor initialModels={models} loadError={error} />
}
