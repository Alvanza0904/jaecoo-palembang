/**
 * JAECOO Palembang — Gallery
 * Route: /gallery
 * Phase 2: Visual foundation — hero + editorial grid placeholder.
 */

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery JAECOO Palembang — Foto & Video",
  description: "Gallery foto dan video eksklusif JAECOO di Palembang. Lihat detail desain, warna, dan interior setiap model.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const whatsappUrl = buildWhatsAppUrl({
    source: "gallery_page",
    source_cta: "gallery_cta",
  });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="Visual Gallery"
        heading="Every angle. Every detail."
        size="medium"
        accent="cool"
      />

      <section className={styles.section}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.header}>
              <GoldLine width="short" />
              <SectionHeading
                eyebrow="Gallery"
                heading="Foto &amp; Video"
                subheading="Eksplorasi desain, interior, dan eksterior setiap model JAECOO secara visual."
              />
            </div>
          </Reveal>

          {/* Gallery grid — Phase 3+ */}
          <Reveal variant="fade" delay={150}>
            <div className={styles.placeholder}>
              <p className={styles.placeholderText}>
                Gallery media sedang dipersiapkan. Untuk preview eksklusif, hubungi Sales kami.
              </p>
              <Button
                as="a"
                href={whatsappUrl}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Request Gallery →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
