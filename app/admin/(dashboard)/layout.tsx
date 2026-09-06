/**
 * JAECOO Palembang — Admin Dashboard Layout
 * STEP 5A: Auth Guard
 *
 * Route group (dashboard) — protects all dashboard pages.
 * /admin/login is OUTSIDE this group → no auth check → no redirect loop.
 */

import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server'
import { AdminShell } from '../AdminShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <AdminShell user={{ email: user.email ?? '', id: user.id }}>
      {children}
    </AdminShell>
  )
}
