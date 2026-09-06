/**
 * JAECOO Palembang — Admin Layout
 * STEP 5A: Protected layout with sidebar navigation
 *
 * - noindex (admin area)
 * - Renders AdminShell (client component) with user context
 * - Auth check via server-side getServerUser()
 * - Unauthenticated → middleware redirects to /admin/login
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server'
import { AdminShell } from './AdminShell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: 'Admin — JAECOO Palembang', template: '%s — Admin JAECOO' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  // Double-check server-side (middleware is primary guard)
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <AdminShell user={{ email: user.email ?? '', id: user.id }}>
      {children}
    </AdminShell>
  )
}
