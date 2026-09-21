import type { Metadata } from 'next'
import { HomepagePreviewClient } from './preview-client'

export const metadata: Metadata = {
  title: 'Homepage Preview',
  robots: { index: false, follow: false },
}

export default function HomepagePreviewPage() {
  return <HomepagePreviewClient />
}
