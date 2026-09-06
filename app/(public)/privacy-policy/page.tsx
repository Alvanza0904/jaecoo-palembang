import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kebijakan privasi JAECOO Palembang.",
};

export default function PrivacyPage() {
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container size="narrow">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-8)" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-ink-muted)" }}>Konten Privacy Policy akan ditambahkan segera.</p>
      </Container>
    </section>
  );
}
