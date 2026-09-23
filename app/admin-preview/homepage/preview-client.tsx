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
 * Sticky preview stays in the existing iframe.
 * Text edit mode does not swap in a second renderer. The live section
 * component receives the same draft payload the public page will save.
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
        sectionId: p.sectionId,
        data: p.data,
        device: p.device,
        textEditMode: p.textEditMode ?? false,
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

  useEffect(() => {
    const key = `${preview.sectionId}:${preview.textEditMode ? '1' : '0'}`
    if (key === focusKeyRef.current) return
    focusKeyRef.current = key
    setFocusKey(key)
  }, [preview.sectionId, preview.textEditMode])

  useEffect(() => {
    if (!preview.textEditMode) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [preview.sectionId, preview.textEditMode])

  return (
    <main
      style={{
        margin: 0,
        width: '100%',
        height: '100%',
        minHeight: '100%',
        overflowX: 'hidden',
        background: '#0a0a0c',
      }}
    >
      <HomepageSectionRenderer
        sectionId={preview.sectionId}
        data={preview.data}
        mode="preview"
        textEditMode={preview.textEditMode}
        focusedFieldId={preview.focusedFieldId}
        focusKey={focusKey}
      />

      {preview.textEditMode && (
        <style>{`
          [data-text-focus] {
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(201,168,76,0.55), 0 0 20px rgba(201,168,76,0.12) !important;
            border-radius: 3px !important;
            transition: box-shadow 0.2s ease !important;
          }
        `}</style>
      )}
    </main>
  )
}
