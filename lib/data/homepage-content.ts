import { createSupabaseServerClient } from '@/lib/supabase/server';
import { HomepageContent } from '@/types/homepage-content';

// STATIC FALLBACK: Website tetap hidup jika Supabase tidak tersedia
export const FALLBACK_CONTENT: Omit<HomepageContent, 'id'> = {
  hero: {
    eyebrow: "DEALER RESMI JAECOO PALEMBANG",
    headline: "JAECOO J5",
    description: "SUV listrik premium dengan desain tegas, karakter urban, dan tenaga elektrik yang siap menemani perjalanan sehari-hari.",
    ctaText: "Jelajahi J5",
    ctaUrl: "/model/jaecoo-j5-ev"
  },
  experience: {
    title: "Berkendara Tanpa Kompromi",
    description: "Setiap model JAECOO dirancang untuk memberikan pengalaman berkendara yang berbeda — dari efisiensi kota hingga ketangguhan off-road sesungguhnya."
  },
  technology: {
    title: "Teknologi yang Bekerja untuk Anda",
    description: "Teknologi JAECOO dirancang untuk bekerja secara natural: tenaga listrik, sistem hybrid, ADAS, kamera surround, dan konektivitas hadir untuk membuat setiap perjalanan lebih mudah dan lebih terkendali."
  },
  about: {
    title: "OMODA JAECOO Palembang",
    description: "Temukan lineup JAECOO di Palembang—mulai dari J5 EV, J7 SHS hingga J8 SHS-P ARDIS. Alvan siap membantu mulai dari memilih model, cek harga OTR, simulasi kredit, hingga jadwal test drive."
  },
  promo: {
    title: "Penawaran Terkini",
    description: "Lihat program dan penawaran yang sedang tersedia untuk lineup JAECOO di Palembang. Untuk harga dan program terbaru, konsultasikan langsung dengan Alvan.",
    ctaText: "Lihat Semua Promo",
    ctaUrl: "/promo"
  },
  journal: {
    title: "Berita & Informasi",
    description: "Ikuti informasi terbaru seputar JAECOO, produk, program, dan perkembangan otomotif."
  },
  dealer_location: {
    title: "Kunjungi Showroom Kami",
    description: "Rasakan langsung pengalaman JAECOO di showroom resmi Palembang.",
    address: "OMODA JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan — 085183145926"
  },
  final_cta: {
    title: "Temukan JAECOO yang tepat untuk Anda.",
    description: "Konsultasikan model, harga OTR Palembang, simulasi kredit, atau jadwalkan test drive bersama Alvan.",
    ctaText: "Chat dengan Alvan",
    ctaUrl: "https://wa.me/6285183145926"
  },
  seo: {
    metaTitle: "JAECOO Palembang | Dealer Resmi SUV Premium",
    metaDescription: "Dealer resmi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Test drive, simulasi kredit, dan promo eksklusif bersama Alvan."
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

    // Merge dengan fallback untuk field yang kosong di DB
    return {
      ...data,
      hero: { ...FALLBACK_CONTENT.hero, ...data.hero },
      experience: { ...FALLBACK_CONTENT.experience, ...data.experience },
      technology: { ...FALLBACK_CONTENT.technology, ...data.technology },
      about: { ...FALLBACK_CONTENT.about, ...data.about },
      promo: { ...FALLBACK_CONTENT.promo, ...data.promo },
      journal: { ...FALLBACK_CONTENT.journal, ...data.journal },
      dealer_location: { ...FALLBACK_CONTENT.dealer_location, ...data.dealer_location },
      final_cta: { ...FALLBACK_CONTENT.final_cta, ...data.final_cta },
      seo: { ...FALLBACK_CONTENT.seo, ...data.seo },
    } as HomepageContent;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    return { id: '11111111-1111-1111-1111-111111111111', ...FALLBACK_CONTENT };
  }
}
