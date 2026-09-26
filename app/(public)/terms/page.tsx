import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: { absolute: "Syarat & Ketentuan | JAECOO Palembang" },
  description: "Syarat dan ketentuan penggunaan website JAECOO Palembang.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <section style={{
      paddingTop: "calc(var(--header-height-desktop) + var(--space-16))",
      paddingBottom: "var(--space-32)",
      background: "var(--color-off-white)",
      minHeight: "100svh"
    }}>
      <Container size="narrow">
        <p style={{
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-widest)",
          textTransform: "uppercase",
          color: "var(--color-gold)",
          marginBottom: "var(--space-4)"
        }}>
          Informasi
        </p>
        <h1 style={{
          fontSize: "clamp(var(--text-2xl), 5vw, var(--text-3xl))",
          fontWeight: "var(--weight-bold)",
          letterSpacing: "var(--tracking-tight)",
          marginBottom: "var(--space-10)",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "var(--space-8)"
        }}>
          Syarat &amp; Ketentuan
        </h1>
        <div style={{ fontSize: "var(--text-base)", color: "var(--color-ink-muted)", lineHeight: "var(--leading-normal)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <p>Dengan mengakses website jaecoopalembang.web.id, Anda menyetujui syarat dan ketentuan berikut.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Penggunaan Website</h2>
          <p>Website ini disediakan untuk keperluan informasi mengenai produk dan layanan JAECOO Palembang. Anda dilarang menggunakan konten website ini untuk tujuan komersial tanpa izin tertulis.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Harga dan Ketersediaan</h2>
          <p>Harga yang tertera di website merupakan harga estimasi dan dapat berubah sewaktu-waktu. Hubungi sales kami untuk konfirmasi harga terkini.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Kontak</h2>
          <p>Pertanyaan lebih lanjut: hubungi Alvan di 0851-8314-5926 melalui WhatsApp.</p>
        </div>
      </Container>
    </section>
  );
}
