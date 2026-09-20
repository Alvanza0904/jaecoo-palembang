import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — JAECOO Palembang",
  description: "Syarat dan ketentuan penggunaan website JAECOO Palembang.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

const headingStyle = {
  fontSize: "var(--text-lg)",
  color: "var(--color-ink)",
  fontWeight: "var(--weight-bold)",
  marginTop: "var(--space-2)",
};

const paraStyle = {
  color: "var(--color-ink-muted)",
  lineHeight: "var(--leading-normal)",
};

export default function TermsPage() {
  const lastUpdated = "1 Januari 2025";

  return (
    <section
      style={{
        paddingTop: "calc(var(--header-height-desktop) + var(--space-16))",
        paddingBottom: "var(--space-32)",
        background: "var(--color-off-white)",
        minHeight: "100svh",
      }}
    >
      <Container size="narrow">
        <p
          style={{
            fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            marginBottom: "var(--space-4)",
          }}
        >
          Legal
        </p>
        <h1
          style={{
            fontSize: "clamp(var(--text-2xl), 5vw, var(--text-3xl))",
            fontWeight: "var(--weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            marginBottom: "var(--space-3)",
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: "var(--space-8)",
          }}
        >
          Syarat &amp; Ketentuan
        </h1>

        <p style={{ ...paraStyle, fontSize: "var(--text-sm)", marginBottom: "var(--space-10)", color: "var(--color-ink-muted)" }}>
          Terakhir diperbarui: {lastUpdated}
        </p>

        <div
          style={{
            fontSize: "var(--text-base)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <p style={paraStyle}>
            Dengan mengakses dan menggunakan website jaecoopalembang.web.id, Anda dianggap telah membaca, memahami, dan menyetujui syarat dan ketentuan berikut. Jika Anda tidak setuju, mohon hentikan penggunaan website ini.
          </p>

          <h2 style={headingStyle}>1. Penggunaan Website</h2>
          <p style={paraStyle}>
            Website ini disediakan oleh OMODA JAECOO Palembang sebagai sarana informasi mengenai produk dan layanan JAECOO di Palembang. Anda diperbolehkan menggunakan website ini untuk kepentingan pribadi dan non-komersial. Dilarang keras menggunakan, menggandakan, atau mendistribusikan konten website ini untuk tujuan komersial tanpa izin tertulis dari kami.
          </p>

          <h2 style={headingStyle}>2. Informasi Produk dan Harga</h2>
          <p style={paraStyle}>
            Harga yang tercantum di website ini merupakan harga estimasi OTR Palembang dan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Harga resmi dan harga final akan dikonfirmasi langsung oleh Sales resmi kami. Spesifikasi kendaraan yang ditampilkan mengacu pada informasi yang tersedia saat ini dan dapat berubah sesuai kebijakan pabrikan.
          </p>

          <h2 style={headingStyle}>3. Simulasi Kredit</h2>
          <p style={paraStyle}>
            Kalkulasi cicilan yang tersedia di website ini bersifat estimasi dan menggunakan asumsi bunga flat 10% per tahun. Angka tersebut tidak mengikat secara hukum. Simulasi resmi akan diberikan oleh Sales atau lembaga pembiayaan rekanan sesuai profil kredit Anda.
          </p>

          <h2 style={headingStyle}>4. Kekayaan Intelektual</h2>
          <p style={paraStyle}>
            Seluruh konten website ini — termasuk teks, gambar, logo, desain, dan video — adalah milik OMODA JAECOO Palembang dan/atau JAECOO Indonesia. Dilarang menggunakan, mengunduh, atau mendistribusikan konten tersebut tanpa izin tertulis dari kami.
          </p>

          <h2 style={headingStyle}>5. Tautan Eksternal</h2>
          <p style={paraStyle}>
            Website ini mungkin memuat tautan ke platform pihak ketiga (seperti WhatsApp atau Google Maps). Kami tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik dari platform pihak ketiga tersebut.
          </p>

          <h2 style={headingStyle}>6. Batasan Tanggung Jawab</h2>
          <p style={paraStyle}>
            OMODA JAECOO Palembang tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan website ini, termasuk namun tidak terbatas pada: kesalahan informasi, gangguan akses, atau keputusan pembelian yang dibuat berdasarkan informasi di website ini tanpa konfirmasi resmi dari pihak kami.
          </p>

          <h2 style={headingStyle}>7. Perubahan Syarat & Ketentuan</h2>
          <p style={paraStyle}>
            Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku efektif sejak dipublikasikan di halaman ini. Penggunaan berkelanjutan atas website ini setelah perubahan dianggap sebagai penerimaan Anda terhadap syarat yang telah diperbarui.
          </p>

          <h2 style={headingStyle}>8. Hukum yang Berlaku</h2>
          <p style={paraStyle}>
            Syarat dan ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan secara musyawarah terlebih dahulu, atau melalui lembaga penyelesaian sengketa yang disepakati bersama.
          </p>

          <h2 style={headingStyle}>Hubungi Kami</h2>
          <p style={paraStyle}>
            Untuk pertanyaan lebih lanjut mengenai syarat dan ketentuan ini, silakan hubungi:
          </p>
          <ul style={{ ...paraStyle, paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <li>WhatsApp: 0851-8314-5926 (Alvan — Sales Resmi JAECOO Palembang)</li>
            <li>Alamat: Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509, 9 Ilir, Ilir Timur II, Palembang 30113</li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
