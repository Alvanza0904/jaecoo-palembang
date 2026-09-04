import type { Metadata } from "next";
import { getActivePromos } from "@/lib/data/promos";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Promo JAECOO Palembang",
  description: "Penawaran dan promo terbaru JAECOO di Palembang.",
};

export default function PromoPage() {
  const promos = getActivePromos();
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container>
        <SectionHeading eyebrow="Penawaran" heading="Promo Terkini" />
        {promos.length === 0 && (
          <p style={{ marginTop: "var(--space-8)", color: "var(--color-ink-muted)" }}>
            Tidak ada promo aktif saat ini. Hubungi Sales untuk penawaran terbaik.
          </p>
        )}
        {/* PromoCard grid — Phase berikutnya */}
      </Container>
    </section>
  );
}
