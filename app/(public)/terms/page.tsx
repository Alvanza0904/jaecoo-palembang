import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms",
  description: "Syarat dan ketentuan JAECOO Palembang.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container size="narrow">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-8)" }}>
          Syarat &amp; Ketentuan
        </h1>
        <p style={{ color: "var(--color-ink-muted)" }}>Konten akan ditambahkan segera.</p>
      </Container>
    </section>
  );
}
