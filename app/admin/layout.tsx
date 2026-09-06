/**
 * JAECOO Palembang — Admin Root Layout
 * STEP 5A v5: Shell wrapper untuk semua /admin/* pages
 *
 * Auth guard HANYA di middleware.ts — tidak di sini.
 * Login page di /admin/login punya layout sendiri yang override ini.
 *
 * Middleware sudah handle:
 * - /admin/login → bypass (no redirect if not logged in)
 * - /admin/* → redirect ke login jika tidak auth
 * - /admin/login saat sudah login → redirect ke /admin
 */

import { getServerUser } from '@/lib/supabase/server'
import { AdminShell } from './AdminShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: 'Admin — JAECOO Palembang', template: '%s — Admin JAECOO' },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware sudah pastikan user ada di sini (kecuali login page)
  // Login page pakai layout override sendiri → tidak sampai sini
  const user = await getServerUser()

  // Fallback safety — seharusnya tidak terjadi karena middleware
  if (!user) {
    // Render children saja (middleware akan handle redirect)
    return <>{children}</>
  }

  return (
    <AdminShell user={{ email: user.email ?? '', id: user.id }}>
      {children}
    </AdminShell>
  )
}
