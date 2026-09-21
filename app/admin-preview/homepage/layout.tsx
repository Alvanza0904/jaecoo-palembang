/**
 * Layout minimal untuk admin-preview/homepage.
 * Tidak mewarisi sidebar/nav admin — halaman ini hanya untuk iframe preview.
 */

import type { ReactNode } from 'react'

export const metadata = {
  title: 'Admin Preview',
  robots: { index: false, follow: false },
}

export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#000', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
