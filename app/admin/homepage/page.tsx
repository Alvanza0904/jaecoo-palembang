/**
 * Admin Homepage Page — Server Component
 * Fetch data dari homepage_content via lib/data/homepage-content
 * (menggunakan singleton fallback, tidak pernah crash).
 * Pass ke HomepageEditor untuk rendering client-side.
 */
import { HomepageEditor } from '@/components/admin/homepage/HomepageEditor'
import { getHomepageContent } from '@/lib/data/homepage-content'

export const metadata = { title: 'Homepage Editor | JAECOO Admin' }

// Pastikan halaman ini selalu fresh (tidak di-cache)
export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const initialData = await getHomepageContent()
  return <HomepageEditor initialData={initialData} />
}
