-- JAECOO Palembang — Migration: News / Journal Table
-- Run this migration to create the news table and seed initial articles.
--
-- Safe to re-run — uses CREATE TABLE IF NOT EXISTS and INSERT ON CONFLICT DO NOTHING.

-- ─── Table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.news (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             VARCHAR(255) NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  excerpt          TEXT,
  body_html        TEXT,
  category         VARCHAR(100) NOT NULL DEFAULT 'News',
  cover_url        TEXT,
  published        BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMP WITH TIME ZONE,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  meta_title       TEXT,
  meta_description TEXT
);

COMMENT ON TABLE public.news IS 'JAECOO Journal — berita, artikel, tips, dan update brand.';

-- ─── Indexes ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_news_slug      ON public.news (slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news (published, published_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news' AND policyname = 'news_public_read') THEN
    EXECUTE 'CREATE POLICY "news_public_read" ON public.news FOR SELECT USING (published = true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news' AND policyname = 'news_auth_write') THEN
    EXECUTE 'CREATE POLICY "news_auth_write" ON public.news FOR ALL USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

GRANT SELECT ON public.news TO anon;
GRANT ALL    ON public.news TO authenticated;
GRANT ALL    ON public.news TO service_role;

-- ─── Seed Articles ────────────────────────────────────────────────────────

INSERT INTO public.news (
  slug, title, excerpt, body_html, category, published, published_at,
  meta_title, meta_description
) VALUES

(
  'jaecoo-hadir-di-palembang',
  'JAECOO Resmi Hadir di Palembang',
  'JAECOO membawa lineup SUV premium ke Palembang, menghadirkan pilihan kendaraan modern yang belum pernah ada sebelumnya di Sumatera Selatan.',
  '<p>OMODA JAECOO kini resmi hadir di Palembang. Dealer resmi berlokasi di Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509, 9 Ilir, Ilir Timur II — siap melayani masyarakat Palembang dan Sumatera Selatan yang ingin memiliki SUV premium dengan teknologi terdepan.</p>
<p>Lineup JAECOO di Palembang mencakup tiga model unggulan: <strong>JAECOO J5 EV</strong> — SUV elektrik dengan desain sporty dan teknologi smart driving; <strong>JAECOO J7 SHS</strong> — SUV hybrid AWD dengan Super Hybrid System untuk performa dan efisiensi sekaligus; serta <strong>JAECOO J8 Ardis SHS</strong> — flagship SUV dengan kabin premium, adaptive air suspension, dan output tenaga tertinggi di lini JAECOO.</p>
<p>Ketiga model tersebut kini bisa dijangkau langsung di showroom resmi Palembang — untuk test drive, konsultasi harga, simulasi kredit, maupun sekadar melihat dari dekat seperti apa kualitas JAECOO secara langsung.</p>
<p>Untuk informasi lebih lanjut, hubungi Sales resmi kami, <strong>Alvan</strong>, melalui WhatsApp di <strong>0851-8314-5926</strong>. Kami siap membantu Anda menemukan JAECOO yang paling sesuai.</p>',
  'Brand',
  true,
  '2025-01-10T08:00:00Z',
  'JAECOO Resmi Hadir di Palembang — JAECOO Journal',
  'Dealer resmi OMODA JAECOO kini hadir di Palembang, menghadirkan J5 EV, J7 SHS, dan J8 Ardis SHS untuk masyarakat Sumatera Selatan.'
),

(
  'mengenal-teknologi-shs-jaecoo-j7',
  'Mengenal Teknologi SHS di JAECOO J7 — Hybrid yang Beda',
  'Super Hybrid System (SHS) bukan sekadar label. Inilah alasan J7 SHS menjadi SUV hybrid paling menarik di kelasnya untuk kondisi jalan Indonesia.',
  '<p>Bagi banyak orang, kata "hybrid" masih terasa samar — antara irit tapi kurang tenaga, atau bertenaga tapi tetap boros. JAECOO J7 SHS hadir untuk mengubah persepsi itu.</p>
<h2>Apa itu Super Hybrid System?</h2>
<p>SHS (Super Hybrid System) adalah arsitektur powertrain yang menggabungkan mesin bensin dengan motor listrik melalui DHT — <em>Dedicated Hybrid Transmission</em>. Berbeda dari sistem hybrid konvensional, DHT di J7 SHS dirancang khusus untuk kendaraan SUV, sehingga transisi antara tenaga bensin dan listrik terasa mulus tanpa jeda yang terasa.</p>
<p>Hasilnya: akselerasi instan seperti kendaraan listrik di kecepatan rendah, plus ketangguhan mesin bensin untuk perjalanan jarak jauh. Tidak ada pengorbanan di sisi mana pun.</p>
<h2>AWD yang Benar-Benar Bekerja</h2>
<p>J7 SHS dilengkapi sistem penggerak AWD adaptif. Distribusi torsi ke keempat roda berlangsung otomatis sesuai kondisi permukaan — baik di jalan aspal basah Palembang maupun medan berbatu saat road trip luar kota.</p>
<h2>Efisiensi Nyata, Bukan Hanya di Kertas</h2>
<p>Dengan teknologi SHS, J7 mampu beroperasi dalam mode listrik murni untuk perjalanan kota jarak pendek, kemudian secara mulus beralih ke mode hybrid saat beban meningkat. Konsumsi bahan bakar pun jauh lebih efisien dibanding SUV konvensional di kelasnya.</p>
<p>Ingin merasakan langsung perbedaannya? Jadwalkan test drive J7 SHS bersama Alvan — Sales resmi JAECOO Palembang — di nomor <strong>0851-8314-5926</strong>.</p>',
  'Teknologi',
  true,
  '2025-02-14T08:00:00Z',
  'Mengenal Teknologi SHS JAECOO J7 — Hybrid yang Beda | JAECOO Journal',
  'Super Hybrid System di JAECOO J7 SHS: bagaimana DHT dan AWD adaptif bekerja untuk performa dan efisiensi terbaik di kelasnya.'
),

(
  'jaecoo-j8-ardis-flagship-suv-palembang',
  'JAECOO J8 Ardis SHS — Ketika SUV Flagship Bicara Beda',
  'Dari adaptive air suspension hingga kabin 64 warna ambient light — J8 Ardis SHS bukan sekadar kendaraan. Ini pernyataan.',
  '<p>Ada mobil yang membawa Anda dari A ke B. Ada yang membuat perjalanan itu jadi pengalaman tersendiri. JAECOO J8 Ardis SHS masuk kategori yang kedua.</p>
<h2>Kabin yang Dirancang Tanpa Kompromi</h2>
<p>Begitu masuk ke kabin J8 Ardis, perbedaannya langsung terasa. Material premium di setiap permukaan yang bisa dijangkau — dari dasbor hingga door trim. Kursi pengemudi elektrik 10 arah dengan fungsi pijat dan pendingin memastikan tidak ada rasa lelah meski perjalanan panjang.</p>
<p>Pencahayaan ambien 64 warna bisa disesuaikan dengan suasana hati atau waktu tempuh. Sementara sistem audio berperforma tinggi mengisi kabin dengan kualitas suara yang jauh di atas rata-rata kelasnya.</p>
<h2>Adaptive Air Suspension — Teknologi yang Dirasakan, Bukan Sekadar Dibaca</h2>
<p>Suspensi udara adaptif J8 Ardis membaca kondisi jalan secara real-time dan menyesuaikan ketinggian serta kekerasan suspensi dalam hitungan milidetik. Hasilnya: kenyamanan sedan premium di badan SUV berukuran besar — bahkan di jalan yang tidak rata sekalipun.</p>
<h2>SHS Flagship — Tenaga di Level Berbeda</h2>
<p>Sebagai model tertinggi di lini JAECOO, J8 Ardis menggunakan SHS generasi terbaru dengan output tenaga tertinggi. Akselerasi yang responsif, torsi yang tersedia instan, dan AWD adaptif yang bekerja diam-diam di balik perjalanan yang terasa mudah.</p>
<h2>Siap Menjadi Milik Anda?</h2>
<p>JAECOO J8 Ardis SHS tersedia di showroom OMODA JAECOO Palembang. Hubungi <strong>Alvan</strong> di <strong>0851-8314-5926</strong> untuk jadwal test drive eksklusif dan informasi harga terkini.</p>',
  'Model',
  true,
  '2025-03-05T08:00:00Z',
  'JAECOO J8 Ardis SHS — SUV Flagship di Palembang | JAECOO Journal',
  'Adaptive air suspension, kabin premium, dan SHS Flagship. Inilah alasan J8 Ardis SHS berbeda dari SUV lain di kelasnya.'
),

(
  'tips-merawat-mobil-hybrid-ev',
  '5 Tips Merawat Mobil Hybrid & EV agar Tetap Prima',
  'Punya kendaraan hybrid atau listrik? Perawatannya berbeda dari mobil konvensional. Berikut panduan singkat dari tim JAECOO Palembang.',
  '<p>Memiliki kendaraan hybrid atau EV bukan hanya soal berkendara lebih efisien — ada beberapa hal perawatan yang perlu diperhatikan agar performa kendaraan tetap optimal dalam jangka panjang.</p>
<h2>1. Jaga Baterai di Rentang Optimal</h2>
<p>Untuk kendaraan EV seperti J5, idealnya jaga level baterai antara 20% hingga 80% untuk penggunaan harian. Pengisian hingga 100% sesekali tidak masalah, namun kebiasaan ini sebaiknya tidak dilakukan setiap hari agar siklus hidup baterai tetap panjang.</p>
<h2>2. Gunakan Charger yang Sesuai</h2>
<p>Selalu gunakan charger resmi atau yang telah tersertifikasi. Fast charging DC boleh digunakan untuk kebutuhan mendesak, namun untuk pengisian rutin, AC charging lebih ramah terhadap baterai dalam jangka panjang.</p>
<h2>3. Periksa Sistem Pendingin Baterai Secara Berkala</h2>
<p>Kendaraan EV dan hybrid modern memiliki sistem thermal management untuk menjaga suhu baterai tetap stabil. Pastikan sistem ini diperiksa pada setiap jadwal servis rutin di showroom resmi.</p>
<h2>4. Rem Regeneratif — Manfaatkan dengan Tepat</h2>
<p>Fitur rem regeneratif pada J5 EV dan J7 SHS membantu mengisi baterai saat deselerasi. Biasakan menggunakannya secara konsisten, terutama di jalanan kota yang sering berhenti, untuk efisiensi daya yang maksimal.</p>
<h2>5. Ikuti Jadwal Servis Resmi</h2>
<p>Jadwal servis kendaraan hybrid dan EV berbeda dari kendaraan konvensional. Konsultasikan dengan tim servis resmi OMODA JAECOO Palembang untuk memastikan kendaraan Anda selalu dalam kondisi terbaik sesuai rekomendasi pabrikan.</p>
<p>Untuk informasi servis dan perawatan lebih lanjut, kunjungi showroom OMODA JAECOO Palembang atau konsultasikan langsung dengan <strong>Alvan</strong> melalui WhatsApp <strong>0851-8314-5926</strong>.</p>',
  'Tips',
  true,
  '2025-04-20T08:00:00Z',
  '5 Tips Merawat Mobil Hybrid & EV | JAECOO Journal',
  'Panduan perawatan kendaraan hybrid dan EV dari OMODA JAECOO Palembang: baterai, charger, rem regeneratif, dan jadwal servis yang tepat.'
),

(
  'jaecoo-j5-ev-suv-listrik-palembang',
  'JAECOO J5 EV — SUV Listrik yang Tidak Perlu Kompromi',
  'Desain tegas, kabin luas, dan teknologi EV terkini. J5 membuktikan bahwa kendaraan listrik bisa punya karakter SUV yang sesungguhnya.',
  '<p>Ketika orang berbicara soal kendaraan listrik, bayangan yang muncul biasanya adalah city car kecil dengan jangkauan terbatas. JAECOO J5 EV hadir untuk mengubah narasi itu sepenuhnya.</p>
<h2>Proporsi SUV Sejati</h2>
<p>J5 EV memiliki dimensi yang tegap — panjang 4.330 mm dengan wheelbase 2.600 mm dan ground clearance 175 mm. Proporsi ini bukan sekadar angka; ia menghadirkan posisi berkendara yang tinggi, visibilitas yang lapang, dan kemampuan melewati berbagai kondisi jalan dengan percaya diri.</p>
<h2>Teknologi yang Mendukung Perjalanan Anda</h2>
<p>Di balik tampilannya, J5 EV menyimpan teknologi yang matang. Sistem ADAS Level 2 bekerja aktif memantau kondisi sekitar kendaraan — dari lane keeping hingga automatic emergency braking. Layar sentuh lebar dengan Apple CarPlay dan Android Auto wireless membuat konektivitas terasa alami, bukan seperti fitur tambahan.</p>
<h2>Pengisian yang Tidak Merepotkan</h2>
<p>Dukungan fast charging DC memungkinkan pengisian daya signifikan dalam waktu singkat. Untuk penggunaan harian di Palembang, pengisian semalam dengan AC charger di rumah sudah cukup untuk kebutuhan berkendara penuh keesokan harinya.</p>
<h2>THIS IS THE REAL SUV.</h2>
<p>J5 EV tersedia mulai dari <strong>Rp354.900.000 OTR Palembang</strong>. Untuk test drive dan informasi lebih lanjut, hubungi <strong>Alvan</strong> di <strong>0851-8314-5926</strong> atau kunjungi langsung showroom OMODA JAECOO Palembang.</p>',
  'Model',
  true,
  '2025-05-12T08:00:00Z',
  'JAECOO J5 EV — SUV Listrik Tanpa Kompromi di Palembang | JAECOO Journal',
  'JAECOO J5 EV: SUV elektrik dengan desain tegap, teknologi ADAS, dan fast charging. Mulai Rp354.900.000 OTR Palembang.'
)

ON CONFLICT (slug) DO NOTHING;
