'use client'

import { useEffect, useState } from 'react'
import { HomepageSectionRenderer } from '@/components/sections/HomepageSectionRenderer'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'

interface PreviewMessage {
  type: 'JAECOO_HOMEPAGE_PREVIEW'
  payload: {
    sectionId: SectionId
    data: SectionRenderData
    device: 'desktop' | 'mobile'
  }
}

const EMPTY: PreviewMessage['payload'] = {
  sectionId: 'hero',
  data: {},
  device: 'desktop',
}

export function HomepagePreviewClient() {
  const [preview, setPreview] = useState(EMPTY)

  useEffect(() => {
    const handler = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.type !== 'JAECOO_HOMEPAGE_PREVIEW') return
      setPreview(event.data.payload)
    }

    window.addEventListener('message', handler)
    window.parent.postMessage(
      { type: 'JAECOO_HOMEPAGE_PREVIEW_READY' },
      window.location.origin,
    )

    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <main style={{ margin: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <HomepageSectionRenderer
        sectionId={preview.sectionId}
        data={preview.data}
        mode="preview"
      />
    </main>
  )
}
