import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: { absolute: "Kebijakan Privasi | JAECOO Palembang" },
  description: "Kebijakan privasi JAECOO Palembang.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
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
          Kebijakan Privasi
        </h1>
        <div style={{ fontSize: "var(--text-base)", color: "var(--color-ink-muted)", lineHeight: "var(--leading-normal)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <p>JAECOO Palembang berkomitmen untuk melindungi privasi Anda. Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Informasi yang Kami Kumpulkan</h2>
          <p>Kami hanya mengumpulkan informasi yang Anda berikan secara sukarela melalui formulir kontak atau WhatsApp, seperti nama dan nomor telepon, untuk keperluan konsultasi dan test drive.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Penggunaan Informasi</h2>
          <p>Informasi yang Anda berikan hanya digunakan untuk menghubungi Anda kembali terkait pertanyaan atau permintaan Anda seputar produk JAECOO. Kami tidak menjual atau membagikan informasi Anda kepada pihak ketiga.</p>
          <h2 style={{ fontSize: "var(--text-lg)", color: "var(--color-ink)", fontWeight: "var(--weight-bold)" }}>Kontak</h2>
          <p>Untuk pertanyaan terkait privasi, hubungi kami melalui WhatsApp: 0851-8314-5926 (Alvan).</p>
        </div>
      </Container>
    </section>
  );
}
