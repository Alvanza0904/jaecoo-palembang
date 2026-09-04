import type { Metadata } from "next";
import { getPublishedNews } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "JAECOO Journal — Berita & Artikel",
  description: "Berita, artikel, dan update terbaru dari JAECOO Palembang.",
};

export default function BeritaPage() {
  const news = getPublishedNews();
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container>
        <SectionHeading eyebrow="Journal" heading="Berita Terbaru" />
        {news.length === 0 && (
          <p style={{ marginTop: "var(--space-8)", color: "var(--color-ink-muted)" }}>
            Belum ada artikel. Pantau terus untuk update terbaru.
          </p>
        )}
        {/* NewsCard grid — Phase berikutnya */}
      </Container>
    </section>
  );
}
