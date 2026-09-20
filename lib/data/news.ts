/**
 * JAECOO Palembang — News Data Layer
 * Primary: Supabase news table
 * Fallback: static mock data
 */

import type { NewsData } from "@/lib/types/news";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEntityMedia } from "@/lib/supabase/media";

// Static fallback — used when Supabase is unavailable
const FALLBACK_NEWS: Omit<NewsData, "cover">[] = [
  {
    id: "news-001",
    slug: "jaecoo-hadir-di-palembang",
    title: "JAECOO Resmi Hadir di Palembang",
    excerpt:
      "JAECOO membawa lineup SUV premium ke Palembang, menghadirkan pilihan kendaraan modern yang belum pernah ada sebelumnya di Sumatera Selatan.",
    body_html: `<p>OMODA JAECOO kini resmi hadir di Palembang. Dealer resmi berlokasi di Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509, 9 Ilir, Ilir Timur II — siap melayani masyarakat Palembang dan Sumatera Selatan yang ingin memiliki SUV premium dengan teknologi terdepan.</p>
<p>Lineup JAECOO di Palembang mencakup tiga model unggulan: <strong>JAECOO J5 EV</strong> — SUV elektrik dengan desain sporty dan teknologi smart driving; <strong>JAECOO J7 SHS</strong> — SUV hybrid AWD dengan Super Hybrid System untuk performa dan efisiensi sekaligus; serta <strong>JAECOO J8 Ardis SHS</strong> — flagship SUV dengan kabin premium, adaptive air suspension, dan output tenaga tertinggi di lini JAECOO.</p>
<p>Untuk konsultasi, test drive, atau informasi harga terkini, hubungi Sales resmi kami, Alvan, melalui WhatsApp di nomor 0851-8314-5926. Kami siap membantu Anda menemukan JAECOO yang paling sesuai.</p>`,
    category: "Brand",
    published_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
    published: true,
    meta_title: "JAECOO Resmi Hadir di Palembang — JAECOO Journal",
    meta_description: "Dealer resmi OMODA JAECOO kini hadir di Palembang, menghadirkan J5 EV, J7 SHS, dan J8 Ardis SHS untuk masyarakat Sumatera Selatan.",
  },
  {
    id: "news-002",
    slug: "mengenal-teknologi-shs-jaecoo-j7",
    title: "Mengenal Teknologi SHS di JAECOO J7 — Hybrid yang Beda",
    excerpt:
      "Super Hybrid System (SHS) bukan sekadar label. Inilah alasan J7 SHS menjadi SUV hybrid paling menarik di kelasnya untuk kondisi jalan Indonesia.",
    body_html: `<p>Bagi banyak orang, kata "hybrid" masih terasa samar — antara irit tapi kurang tenaga, atau bertenaga tapi tetap boros. JAECOO J7 SHS hadir untuk mengubah persepsi itu.</p>
<h2>Apa itu Super Hybrid System?</h2>
<p>SHS (Super Hybrid System) adalah arsitektur powertrain yang menggabungkan mesin bensin dengan motor listrik melalui DHT — <em>Dedicated Hybrid Transmission</em>. Berbeda dari sistem hybrid konvensional, DHT di J7 SHS dirancang khusus untuk kendaraan SUV, sehingga transisi antara tenaga bensin dan listrik terasa mulus tanpa jeda.</p>
<p>Hasilnya: akselerasi instan seperti kendaraan listrik di kecepatan rendah, plus ketangguhan mesin bensin untuk perjalanan jarak jauh. Tidak ada pengorbanan di sisi manapun.</p>
<h2>AWD yang Benar-Benar Bekerja</h2>
<p>J7 SHS dilengkapi sistem penggerak AWD adaptif. Distribusi torsi ke keempat roda berlangsung otomatis sesuai kondisi permukaan — baik di jalan aspal basah Palembang maupun medan berbatu saat road trip luar kota.</p>
<h2>Efisiensi Nyata, Bukan Hanya di Kertas</h2>
<p>Dengan teknologi SHS, J7 mampu beroperasi dalam mode listrik murni untuk perjalanan kota jarak pendek, kemudian secara mulus beralih ke mode hybrid saat beban meningkat. Konsumsi bahan bakar pun jauh lebih efisien dibanding SUV konvensional di kelasnya.</p>
<p>Ingin merasakan langsung perbedaannya? Jadwalkan test drive J7 SHS bersama Alvan — Sales resmi JAECOO Palembang — di nomor 0851-8314-5926.</p>`,
    category: "Teknologi",
    published_at: "2025-02-14T08:00:00Z",
    updated_at: "2025-02-14T08:00:00Z",
    published: true,
    meta_title: "Mengenal Teknologi SHS JAECOO J7 — Hybrid yang Beda | JAECOO Journal",
    meta_description: "Super Hybrid System di JAECOO J7 SHS: bagaimana DHT dan AWD adaptif bekerja untuk performa dan efisiensi terbaik di kelasnya.",
  },
  {
    id: "news-003",
    slug: "jaecoo-j8-ardis-flagship-suv-palembang",
    title: "JAECOO J8 Ardis SHS — Ketika SUV Flagship Bicara Beda",
    excerpt:
      "Dari adaptive air suspension hingga kabin 64 warna ambient light — J8 Ardis SHS bukan sekadar kendaraan. Ini pernyataan.",
    body_html: `<p>Ada mobil yang membawa Anda dari A ke B. Ada yang membuat perjalanan itu jadi pengalaman tersendiri. JAECOO J8 Ardis SHS masuk kategori yang kedua.</p>
<h2>Kabin yang Dirancang Tanpa Kompromi</h2>
<p>Begitu masuk ke kabin J8 Ardis, perbedaannya langsung terasa. Material premium di setiap permukaan yang bisa dijangkau — dari dasbor hingga door trim. Kursi pengemudi elektrik 10 arah dengan fungsi pijat dan pendingin memastikan tidak ada rasa lelah meski perjalanan panjang.</p>
<p>Pencahayaan ambien 64 warna bisa disesuaikan dengan suasana hati atau waktu tempuh. Sementara sistem audio berperforma tinggi mengisi kabin dengan kualitas suara yang setara ruang konser kelas atas.</p>
<h2>Adaptive Air Suspension — Teknologi yang Dirasakan, Bukan Sekadar Dibaca</h2>
<p>Suspensi udara adaptif J8 Ardis membaca kondisi jalan secara real-time dan menyesuaikan ketinggian dan kekerasan suspensi dalam hitungan milidetik. Hasilnya: kenyamanan sedan premium di badan SUV berukuran besar — bahkan di jalan yang tidak rata sekalipun.</p>
<h2>SHS Flagship — Tenaga di Level Berbeda</h2>
<p>Sebagai model tertinggi di lini JAECOO, J8 Ardis menggunakan SHS generasi terbaru dengan output tenaga tertinggi. Akselerasi yang responsif, torsi yang tersedia instan, dan AWD adaptif yang bekerja diam-diam di balik perjalanan yang terasa mudah.</p>
<h2>Siap Menjadi Milik Anda?</h2>
<p>JAECOO J8 Ardis SHS tersedia di showroom OMODA JAECOO Palembang. Hubungi Alvan di 0851-8314-5926 untuk jadwal test drive eksklusif dan informasi harga terkini.</p>`,
    category: "Model",
    published_at: "2025-03-05T08:00:00Z",
    updated_at: "2025-03-05T08:00:00Z",
    published: true,
    meta_title: "JAECOO J8 Ardis SHS — SUV Flagship di Palembang | JAECOO Journal",
    meta_description: "Adaptive air suspension, kabin premium, dan SHS Flagship. Inilah alasan J8 Ardis SHS berbeda dari SUV lain di kelasnya.",
  },
  {
    id: "news-004",
    slug: "tips-merawat-mobil-hybrid-ev",
    title: "5 Tips Merawat Mobil Hybrid & EV agar Tetap Prima",
    excerpt:
      "Punya kendaraan hybrid atau listrik? Perawatannya berbeda dari mobil konvensional. Berikut panduan singkat dari tim JAECOO Palembang.",
    body_html: `<p>Memiliki kendaraan hybrid atau EV bukan hanya soal berkendara lebih efisien — ada beberapa hal perawatan yang perlu diperhatikan agar performa kendaraan tetap optimal dalam jangka panjang.</p>
<h2>1. Jaga Baterai di Rentang Optimal</h2>
<p>Untuk kendaraan EV seperti J5, idealnya jaga level baterai antara 20% hingga 80% untuk penggunaan harian. Pengisian hingga 100% sesekali tidak masalah, namun kebiasaan ini sebaiknya tidak dilakukan setiap hari agar siklus hidup baterai tetap panjang.</p>
<h2>2. Gunakan Charger yang Sesuai</h2>
<p>Selalu gunakan charger resmi atau yang telah tersertifikasi. Fast charging DC boleh digunakan, namun untuk pengisian rutin, AC charging lebih ramah terhadap baterai dalam jangka panjang.</p>
<h2>3. Periksa Sistem Pendingin Baterai Secara Berkala</h2>
<p>Kendaraan EV dan hybrid modern memiliki sistem thermal management untuk menjaga suhu baterai. Pastikan sistem ini diperiksa pada setiap jadwal servis rutin.</p>
<h2>4. Rem Regeneratif — Manfaatkan dengan Tepat</h2>
<p>Fitur rem regeneratif pada J5 dan J7 SHS membantu mengisi baterai saat deselerasi. Biasakan menggunakannya dengan konsisten untuk efisiensi maksimal.</p>
<h2>5. Ikuti Jadwal Servis Resmi</h2>
<p>Jadwal servis kendaraan hybrid/EV berbeda dari kendaraan konvensional. Konsultasikan dengan tim servis resmi OMODA JAECOO Palembang untuk memastikan kendaraan Anda selalu dalam kondisi terbaik.</p>
<p>Untuk informasi servis dan perawatan, hubungi showroom OMODA JAECOO Palembang atau konsultasikan langsung dengan Alvan melalui WhatsApp 0851-8314-5926.</p>`,
    category: "Tips",
    published_at: "2025-04-20T08:00:00Z",
    updated_at: "2025-04-20T08:00:00Z",
    published: true,
    meta_title: "5 Tips Merawat Mobil Hybrid & EV | JAECOO Journal",
    meta_description: "Panduan perawatan kendaraan hybrid dan EV dari OMODA JAECOO Palembang: baterai, charger, rem regeneratif, dan jadwal servis yang tepat.",
  },
];

/**
 * Try to fetch from Supabase news table.
 * Columns: id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description
 */
async function fetchNewsFromSupabase(limit?: number): Promise<NewsData[] | null> {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("news")
      .select("id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: (row.excerpt as string) ?? "",
      body_html: row.body_html as string | undefined,
      category: (row.category as string) ?? "News",
      published_at: row.published_at as string,
      updated_at: row.updated_at as string,
      published: Boolean(row.published),
      meta_title: row.meta_title as string | undefined,
      meta_description: row.meta_description as string | undefined,
      cover: {
        desktop: row.cover_url as string | undefined,
        mobile: row.cover_url as string | undefined,
        alt: row.title as string,
      },
    }));
  } catch {
    return null;
  }
}

export async function getPublishedNews(limit?: number): Promise<NewsData[]> {
  // Try Supabase first
  const supabaseData = await fetchNewsFromSupabase(limit);
  if (supabaseData && supabaseData.length > 0) return supabaseData;

  // Fallback to mock + media enrichment
  const sorted = FALLBACK_NEWS.filter((n) => n.published).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  const selected = limit ? sorted.slice(0, limit) : sorted;

  return Promise.all(
    selected.map(async (news) => ({
      ...news,
      cover: (await getEntityMedia("news", news.id, "cover")) ?? { alt: news.title },
    }))
  );
}

export async function getNewsBySlug(slug: string): Promise<NewsData | undefined> {
  // Try Supabase first
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? "",
        body_html: data.body_html ?? undefined,
        category: data.category ?? "News",
        published_at: data.published_at,
        updated_at: data.updated_at,
        published: Boolean(data.published),
        meta_title: data.meta_title ?? undefined,
        meta_description: data.meta_description ?? undefined,
        cover: {
          desktop: data.cover_url ?? undefined,
          mobile: data.cover_url ?? undefined,
          alt: data.title,
        },
      };
    }
  } catch {
    // fallthrough
  }

  // Fallback to mock
  const news = FALLBACK_NEWS.find((n) => n.slug === slug && n.published);
  if (!news) return undefined;
  return {
    ...news,
    cover: (await getEntityMedia("news", news.id, "cover")) ?? { alt: news.title },
  };
}

// For generateStaticParams
export async function getAllNewsSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("news")
      .select("slug")
      .eq("published", true);
    if (data && data.length > 0) return data.map((r: { slug: string }) => r.slug);
  } catch {
    // fallthrough
  }
  return FALLBACK_NEWS.filter((n) => n.published).map((n) => n.slug);
}
