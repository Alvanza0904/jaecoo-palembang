/**
 * JAECOO Palembang — Admin Preview: Homepage Section
 *
 * Halaman ini di-load dalam iframe oleh HomepagePreviewFrame.
 * Menerima postMessage berisi { sectionId, data, device } dan
 * merender HomepageSectionRenderer secara real-time.
 *
 * Kenapa iframe?
 * - CSS media queries dievaluasi terhadap lebar iframe (390px / full),
 *   bukan lebar browser admin (biasanya >1024px).
 * - Preview Mobile benar-benar berperilaku seperti browser 390px.
 * - Tidak ada transform/scale yang mengacaukan font size dan layout.
 *
 * PENTING: Halaman ini harus ada agar HomepagePreviewFrame bisa load.
 * Tanpa ini, iframe 404 dan preview kosong.
 */

'use client'

import { useEffect, useState } from 'react'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import { HomepageSectionRenderer } from '@/components/sections/HomepageSectionRenderer'

interface PreviewPayload {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile' // digunakan untuk CSS class wrapper saja
}

export default function AdminPreviewHomepage() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'JAECOO_HOMEPAGE_PREVIEW') return
      setPayload(e.data.payload as PreviewPayload)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!payload) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: '#4b5563',
        fontSize: '0.75rem',
        fontFamily: 'system-ui, sans-serif',
      }}>
        Menunggu preview…
      </div>
    )
  }

  return (
    <div style={{ margin: 0, padding: 0, background: '#000' }}>
      <HomepageSectionRenderer
        sectionId={payload.sectionId}
        data={payload.data}
        mode="preview"
      />
    </div>
  )
}
