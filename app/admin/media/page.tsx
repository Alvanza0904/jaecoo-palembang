/**
 * JAECOO Palembang — Admin Media Library
 * STEP 5C: /admin/media
 *
 * Server component — auth check, then renders client MediaLibrary.
 */

import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server'
import { MediaLibrary } from '@/components/admin/media/MediaLibrary'

export const metadata = { title: 'Media Library — JAECOO Admin' }

export default async function AdminMediaPage() {
  const user = await getServerUser()
  if (!user) redirect('/admin/login')

  return <MediaLibrary />
}
