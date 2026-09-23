'use client'

import { useEffect, useRef, useState } from 'react'
import { HomepageSectionRenderer } from '@/components/sections/HomepageSectionRenderer'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'

interface PreviewPayload {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
  textEditMode?: boolean
  focusedFieldId?: string | null
}

interface PreviewMessage {
  type: 'JAECOO_HOMEPAGE_PREVIEW'
  payload: PreviewPayload
}

const EMPTY: PreviewPayload = {
  sectionId: 'hero',
  data: {},
  device: 'desktop',
  textEditMode: false,
  focusedFieldId: null,
}

/**
 * HomepagePreviewClient — iframe renderer untuk Normal Preview.
 *
 * Catatan arsitektur (setelah layout fix):
 * ContextualTextPanel TIDAK lagi dirender di sini.
 * Panel tersebut sudah dipindah ke HomepageEditor.tsx (parent),
 * menempati sticky container yang sama dengan SectionPreview.
 *
 * Iframe ini hanya aktif saat textEditMode=false (Normal Preview).
 * Saat textEditMode=true, parent menyembunyikan iframe dan menampilkan
 * ContextualTextPreview langsung di container yang sama.
 *
 * Flow yang tetap berjalan di sini:
 * - Menerima sectionId, data, device via postMessage
 * - Merender section dengan HomepageSectionRenderer mode=preview
 * - Mengirim READY ke parent setelah mount
 */
export function HomepagePreviewClient() {
  const [preview, setPreview] = useState(EMPTY)
  const focusKeyRef = useRef<string>('')
  const [focusKey, setFocusKey] = useState('')

  useEffect(() => {
    const handler = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.type !== 'JAECOO_HOMEPAGE_PREVIEW') return

      const p = event.data.payload
      setPreview({
        sectionId:      p.sectionId,
        data:           p.data,
        device:         p.device,
        textEditMode:   p.textEditMode  ?? false,
        focusedFieldId: p.focusedFieldId ?? null,
      })
    }

    window.addEventListener('message', handler)
    window.parent.postMessage(
      { type: 'JAECOO_HOMEPAGE_PREVIEW_READY' },
      window.location.origin,
    )

    return () => window.removeEventListener('message', handler)
  }, [])

  // Track focusKey agar React menjamin re-render saat section berubah
  useEffect(() => {
    const key = `${preview.sectionId}:${preview.textEditMode ? '1' : '0'}`
    if (key === focusKeyRef.current) return
    focusKeyRef.current = key
    setFocusKey(key)
  }, [preview.sectionId, preview.textEditMode])

  return (
    <main
      style={{
        margin: 0,
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <HomepageSectionRenderer
        sectionId={preview.sectionId}
        data={preview.data}
        mode="preview"
        textEditMode={false}
        focusedFieldId={null}
        focusKey={focusKey}
      />
    </main>
  )
}
