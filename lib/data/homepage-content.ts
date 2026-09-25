import { cache } from 'react';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import { HomepageContent } from '@/types/homepage-content';

// STATIC FALLBACK: Website tetap hidup jika Supabase tidak tersedia
export const FALLBACK_CONTENT: Omit<HomepageContent, 'id'> = {
  hero: {
    eyebrow: "DEALER RESMI JAECOO PALEMBANG",
    headline: "JAECOO J5",
    description: "SUV listrik dengan karakter tangguh, ruang yang lapang, dan tenaga instan untuk mobilitas modern yang lebih berani.",
    ctaText: "Jelajahi J5",
    ctaUrl: "/model/jaecoo-j5-ev"
  },
  experience: {
    title: "Satu Lini. Tiga Karakter.",
    description: "JAECOO menghadirkan pilihan SUV dengan karakter yang berbeda. J5 EV membawa kesederhanaan tenaga listrik, J7 SHS memadukan listrik dan hybrid, sementara J8 SHS-P ARDIS membawa performa flagship ke level berikutnya."
  },
  technology: {
    title: "Teknologi yang Terasa, Bukan Sekadar Terlihat",
    description: "Dari sistem penggerak listrik dan Super Hybrid System hingga ARDIS, kamera 540° dan fitur bantuan pengemudi, setiap teknologi dirancang untuk membuat perjalanan terasa lebih mudah, tenang, dan terkendali."
  },
  about: {
    title: "JAECOO Palembang",
    description: "Temukan lineup JAECOO di Palembang bersama Alvan. Mulai dari mengenal setiap model, konsultasi kebutuhan, hingga menjadwalkan test drive — semuanya dibuat sederhana dan personal."
  },
  promo: {
    title: "Penawaran Terkini",
    description: "Dapatkan informasi harga, program, dan penawaran terbaru JAECOO Palembang. Hubungi Alvan untuk detail yang sesuai dengan kebutuhan Anda.",
    ctaText: "Lihat Semua Promo",
    ctaUrl: "/promo"
  },
  journal: {
    title: "Berita & Informasi JAECOO",
    description: "Ikuti informasi terbaru seputar produk, teknologi, dan aktivitas JAECOO."
  },
  dealer_location: {
    title: "Kenali JAECOO Lebih Dekat",
    description: "Datang dan lihat langsung lineup JAECOO di dealer resmi Palembang. Alvan siap membantu Anda memahami setiap model dan menemukan pilihan yang sesuai.",
    address: "JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan — 085183145926"
  },
  final_cta: {
    title: "Temukan JAECOO yang Tepat untuk Anda.",
    description: "Ingin melihat langsung, membandingkan model, atau menjadwalkan test drive? Hubungi Alvan untuk mendapatkan informasi JAECOO Palembang secara langsung.",
    ctaText: "Chat dengan Alvan",
    ctaUrl: "https://wa.me/6285183145926"
  },
  seo: {
    metaTitle: "JAECOO Palembang | Dealer Resmi SUV Premium",
    metaDescription: "Dealer resmi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Test drive, simulasi kredit, dan promo eksklusif bersama Alvan."
  }
};

export const getHomepageContent = cache(async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const supabase = createSupabasePublicClient();
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
});
