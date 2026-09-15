import { createSupabaseServerClient } from '@/lib/supabase/server';
import { HomepageContent } from '@/types/homepage-content';

// STATIC FALLBACK: Menjaga website tetap hidup jika Supabase mati
const FALLBACK_CONTENT: Omit<HomepageContent, 'id'> = {
  hero: {
    eyebrow: "THE NEW ERA OF OFF-ROAD",
    headline: "JAECOO J7",
    description: "Kombinasi sempurna antara kemewahan klasik dan ketangguhan off-road.",
    ctaText: "Discover More",
    ctaUrl: "/models/j7"
  },
  experience: {
    title: "Unrivaled Experience",
    description: "Kenyamanan premium di setiap medan. Dirancang untuk Anda yang berani menjelajah."
  },
  technology: {
    title: "Advanced Technology",
    description: "Dilengkapi dengan sistem ARDIS (All-Road Drive Intelligent System) terdepan di kelasnya."
  },
  about: {
    title: "Mengenal JAECOO",
    description: "Dedikasi untuk menciptakan SUV off-road pintar berskala global."
  },
  promo: {
    title: "Penawaran Eksklusif",
    description: "Dapatkan harga terbaik dan program spesial untuk wilayah Palembang dan sekitarnya.",
    ctaText: "Lihat Promo",
    ctaUrl: "/promo"
  },
  journal: {
    title: "JAECOO Journal",
    description: "Berita terbaru, event, dan cerita dari komunitas JAECOO."
  },
  dealer_location: {
    title: "Kunjungi Dealer Kami",
    description: "Konsultasikan kebutuhan Anda dan jadwalkan Test Drive sekarang.",
    address: "OMODA JAECOO Palembang\nJl. R. Sukamto, Palembang"
  },
  final_cta: {
    title: "Siap Untuk Petualangan Baru?",
    description: "Hubungi konsultan sales kami untuk penawaran dan pelayanan terbaik.",
    ctaText: "Hubungi Sales",
    ctaUrl: "https://wa.me/yournumber"
  },
  seo: {
    metaTitle: "JAECOO Palembang | Dealer Resmi SUV Premium",
    metaDescription: "Temukan line-up JAECOO terbaru di Palembang. Konsultasi sales, test drive, dan promo eksklusif."
  }
};

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      console.warn("Supabase fetch failed or empty, using Fallback Homepage Content.");
      return { id: '11111111-1111-1111-1111-111111111111', ...FALLBACK_CONTENT };
    }

    return data as HomepageContent;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    return { id: '11111111-1111-1111-1111-111111111111', ...FALLBACK_CONTENT };
  }
}
