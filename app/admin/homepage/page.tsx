/**
 * Admin Homepage Page — Server Component
 *
 * FIX 2026-09-22: Pass full ResponsiveImage (dengan presentation_settings)
 * ke HomepageEditor agar initial state sudah membawa presentation data.
 *
 * SEBELUM: hanya pass .desktop dan .mobile URL string → HomepageEditor
 *   tidak punya presentation_settings di initial state → preview kosong
 *   tidak cerminkan Visual Editor.
 *
 * SESUDAH: pass full ResponsiveImage per slot → HomepageEditor.initialData
 *   sudah punya `image` field dengan presentation_settings → SectionPreview
 *   langsung pakai layout yang sama dengan live website.
 */
import { HomepageEditor } from '@/components/admin/homepage/HomepageEditor'
import { getHomepageContent } from '@/lib/data/homepage-content'
import { getHomeMedia, contentMediaKey } from '@/lib/supabase/media'

export const metadata = { title: 'Homepage Editor | JAECOO Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const [content, homeMedia] = await Promise.all([
    getHomepageContent(),
    getHomeMedia(),
  ])

  // Helper — ambil full ResponsiveImage (membawa presentation_settings)
  const media = (slot: string) => homeMedia[contentMediaKey('home', 'home', slot)]

  const initialData = {
    ...content,
    hero: {
      ...content.hero,
      // Full ResponsiveImage untuk initial preview
      image:         media('hero'),
      desktop_image: media('hero')?.desktop,
      mobile_image:  media('hero')?.mobile,
    },
    experience: {
      ...content.experience,
      image:         media('experience'),
      desktop_image: media('experience')?.desktop,
      mobile_image:  media('experience')?.mobile,
    },
    technology: {
      ...content.technology,
      image:         media('technology'),
      desktop_image: media('technology')?.desktop,
      mobile_image:  media('technology')?.mobile,
    },
    about: {
      ...content.about,
      image:         media('about'),
      desktop_image: media('about')?.desktop,
      mobile_image:  media('about')?.mobile,
    },
    dealer_location: {
      ...content.dealer_location,
      image:         media('dealer_location'),
      desktop_image: media('dealer_location')?.desktop,
      mobile_image:  media('dealer_location')?.mobile,
    },
    final_cta: {
      ...content.final_cta,
      image:         media('final_cta'),
      desktop_image: media('final_cta')?.desktop,
      mobile_image:  media('final_cta')?.mobile,
    },
  }

  return <HomepageEditor initialData={initialData} />
}
