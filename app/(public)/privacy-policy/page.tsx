import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy — JAECOO Palembang",
  description: "Kebijakan privasi JAECOO Palembang — cara kami mengumpulkan, menggunakan, dan melindungi data Anda.",
  alternates: { canonical: "/privacy-policy" },
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

export default function PrivacyPage() {
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
          Privacy Policy
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
            OMODA JAECOO Palembang (&ldquo;kami&rdquo;) berkomitmen untuk melindungi privasi setiap pengunjung dan calon pelanggan yang menggunakan website ini. Kebijakan ini menjelaskan informasi apa yang kami kumpulkan, bagaimana kami menggunakannya, dan bagaimana kami menjaganya.
          </p>

          <h2 style={headingStyle}>Informasi yang Kami Kumpulkan</h2>
          <p style={paraStyle}>
            Kami hanya mengumpulkan informasi yang Anda berikan secara sukarela melalui saluran berikut:
          </p>
          <ul style={{ ...paraStyle, paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <li>Formulir kontak atau pengajuan test drive di website ini</li>
            <li>Percakapan WhatsApp dengan Sales resmi kami (Alvan, 0851-8314-5926)</li>
            <li>Kunjungan langsung ke showroom</li>
          </ul>
          <p style={paraStyle}>
            Informasi yang biasanya dikumpulkan meliputi: nama, nomor telepon, dan model JAECOO yang diminati.
          </p>

          <h2 style={headingStyle}>Cara Kami Menggunakan Informasi Anda</h2>
          <p style={paraStyle}>
            Informasi yang Anda berikan digunakan semata-mata untuk:
          </p>
          <ul style={{ ...paraStyle, paddingLeft: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <li>Menghubungi Anda kembali terkait pertanyaan atau permintaan konsultasi</li>
            <li>Menjadwalkan test drive sesuai permintaan Anda</li>
            <li>Memberikan informasi produk, harga, dan promo yang relevan</li>
            <li>Memproses transaksi pembelian kendaraan</li>
          </ul>

          <h2 style={headingStyle}>Pembagian Data kepada Pihak Ketiga</h2>
          <p style={paraStyle}>
            Kami tidak menjual, memperdagangkan, atau membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum yang berlaku atau untuk keperluan proses pembelian kendaraan (misalnya, koordinasi dengan JAECOO Indonesia atau lembaga pembiayaan yang Anda pilih).
          </p>

          <h2 style={headingStyle}>Keamanan Data</h2>
          <p style={paraStyle}>
            Kami mengambil langkah-langkah yang wajar untuk melindungi informasi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Namun, tidak ada metode transmisi data melalui internet yang sepenuhnya aman; kami tidak dapat menjamin keamanan mutlak.
          </p>

          <h2 style={headingStyle}>Cookie dan Analitik</h2>
          <p style={paraStyle}>
            Website ini mungkin menggunakan cookie atau layanan analitik pihak ketiga (seperti Google Analytics) untuk memahami bagaimana pengunjung menggunakan website. Data ini bersifat anonim dan tidak dihubungkan ke identitas pribadi Anda.
          </p>

          <h2 style={headingStyle}>Hak Anda</h2>
          <p style={paraStyle}>
            Anda berhak untuk meminta akses, koreksi, atau penghapusan informasi pribadi yang kami simpan tentang Anda. Untuk permintaan semacam ini, hubungi kami melalui WhatsApp atau kunjungi showroom kami secara langsung.
          </p>

          <h2 style={headingStyle}>Perubahan Kebijakan</h2>
          <p style={paraStyle}>
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diumumkan di halaman ini dengan mencantumkan tanggal pembaruan terbaru.
          </p>

          <h2 style={headingStyle}>Hubungi Kami</h2>
          <p style={paraStyle}>
            Untuk pertanyaan, keluhan, atau permintaan terkait privasi, silakan hubungi kami melalui:
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
