/**
 * Layout minimal untuk admin-preview/homepage.
 * Tidak mewarisi sidebar/nav admin — halaman ini hanya untuk iframe preview.
 *
 * KRITIS: Harus import globals.css + Manrope font agar preview iframe
 * menggunakan design system yang SAMA dengan live website.
 * Tanpa ini, semua CSS custom properties (--color-ink, --font-manrope, dll)
 * tidak akan tersedia dan preview akan terlihat salah.
 */

import type { ReactNode } from 'react'
import { Manrope } from 'next/font/google'
import '@/styles/globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  title: 'Admin Preview',
  robots: { index: false, follow: false },
}

export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={manrope.variable} style={{ height: '100%' }}>
      <body style={{ margin: 0, padding: 0, background: '#000', height: '100%' }}>
        {children}
      </body>
    </html>
  )
}
