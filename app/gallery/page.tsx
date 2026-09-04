import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Gallery JAECOO Palembang",
  description: "Gallery foto dan video JAECOO di Palembang.",
};

export default function GalleryPage() {
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container>
        <SectionHeading eyebrow="Gallery" heading="Foto & Video" />
        {/* GalleryGrid — Phase berikutnya */}
      </Container>
    </section>
  );
}
