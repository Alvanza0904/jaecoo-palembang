import { cache } from 'react';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import { HomepageContent } from '@/types/homepage-content';
import { localizePhrase } from '@/lib/copy/public-indonesian';

// STATIC FALLBACK: Website tetap hidup jika Supabase tidak tersedia
export const FALLBACK_CONTENT: Omit<HomepageContent, 'id'> = {
  hero: {
    eyebrow: "DEALER RESMI JAECOO PALEMBANG",
    headline: "JAECOO J5",
    description: "SUV listrik untuk perjalanan harian. Tenaga instan, kabin lega, dan jarak tempuh yang cukup untuk aktivitas kota maupun luar kota.",
    ctaText: "Jelajahi J5",
    ctaUrl: "/model/jaecoo-j5-ev"
  },
  experience: {
    title: "Satu Lini. Tiga Karakter.",
    description: "J5 EV untuk mobilitas listrik sehari-hari, J7 SHS untuk hybrid yang fleksibel, J7 SIVP dengan valet parkir pintar, dan J8 SHS-P ARDIS sebagai flagship dengan AWD."
  },
  technology: {
    title: "Teknologi yang Terasa, Bukan Sekadar Terlihat",
    description: "Dari powertrain listrik dan Super Hybrid System hingga ARDIS, kamera 540°, dan bantuan pengemudi — teknologi yang membantu perjalanan terasa lebih tenang dan terkendali."
  },
  about: {
    title: "JAECOO Palembang",
    description: "Kenali lineup JAECOO bersama Alvan di Palembang. Dari membandingkan model, konsultasi kebutuhan, sampai menjadwalkan test drive — semuanya dibuat sederhana dan personal."
  },
  promo: {
    title: "Penawaran Terkini",
    description: "Cek harga, program, dan penawaran terbaru JAECOO Palembang. Hubungi Alvan untuk detail yang sesuai dengan kebutuhan Anda.",
    ctaText: "Lihat Semua Promo",
    ctaUrl: "/promo"
  },
  journal: {
    title: "Berita & Informasi JAECOO",
    description: "Ikuti update produk, teknologi, dan aktivitas JAECOO yang relevan untuk Anda di Palembang."
  },
  dealer_location: {
    title: "Kenali JAECOO Lebih Dekat",
    description: "Datang ke dealer resmi di Palembang. Lihat unit secara langsung, bandingkan model, dan tanyakan detail ke Alvan tanpa basa-basi bertele-tele.",
    address: "JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan — 085183145926"
  },
  final_cta: {
    title: "Temukan JAECOO yang Tepat untuk Anda.",
    description: "Ingin melihat unit, membandingkan model, atau menjadwalkan test drive? Chat Alvan untuk informasi langsung dari JAECOO Palembang.",
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

    const content = {
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

    content.hero.ctaText = localizePhrase(content.hero.ctaText) ?? content.hero.ctaText;
    content.hero.eyebrow = localizePhrase(content.hero.eyebrow) ?? content.hero.eyebrow;
    content.hero.headline = localizePhrase(content.hero.headline) ?? content.hero.headline;
    content.experience.title = localizePhrase(content.experience.title) ?? content.experience.title;
    content.experience.description = localizePhrase(content.experience.description) ?? content.experience.description;
    content.technology.title = localizePhrase(content.technology.title) ?? content.technology.title;
    content.dealer_location.description = localizePhrase(content.dealer_location.description) ?? content.dealer_location.description;
    content.seo.metaTitle = localizePhrase(content.seo.metaTitle) ?? content.seo.metaTitle;
    return content;
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    return { id: '11111111-1111-1111-1111-111111111111', ...FALLBACK_CONTENT };
  }
});
