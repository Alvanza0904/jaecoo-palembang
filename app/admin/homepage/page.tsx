/**
 * Admin Homepage Page — Server Component
 * Fetch data dari homepage_content via lib/data/homepage-content
 * (menggunakan singleton fallback, tidak pernah crash).
 * Pass ke HomepageEditor untuk rendering client-side.
 */
import { HomepageEditor } from '@/components/admin/homepage/HomepageEditor'
import { getHomepageContent } from '@/lib/data/homepage-content'
import { getHomeMedia, contentMediaKey } from '@/lib/supabase/media'

export const metadata = { title: 'Homepage Editor | JAECOO Admin' }

// Pastikan halaman ini selalu fresh (tidak di-cache)
export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const [content, homeMedia] = await Promise.all([
    getHomepageContent(),
    getHomeMedia(),
  ])

  const initialData = {
    ...content,
    hero: {
      ...content.hero,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'hero')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'hero')]?.mobile,
    },
    experience: {
      ...content.experience,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'experience')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'experience')]?.mobile,
    },
    technology: {
      ...content.technology,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'technology')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'technology')]?.mobile,
    },
    about: {
      ...content.about,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'about')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'about')]?.mobile,
    },
    dealer_location: {
      ...content.dealer_location,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'dealer_location')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'dealer_location')]?.mobile,
    },
    final_cta: {
      ...content.final_cta,
      desktop_image: homeMedia[contentMediaKey('home', 'home', 'final_cta')]?.desktop,
      mobile_image: homeMedia[contentMediaKey('home', 'home', 'final_cta')]?.mobile,
    },
  }

  return <HomepageEditor initialData={initialData} />
}
