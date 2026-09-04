import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl, SALES_NAME, WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";

export const metadata: Metadata = {
  title: "Sales JAECOO Palembang — Alvan",
  description: "Hubungi Sales resmi JAECOO Palembang. Konsultasi, test drive, dan simulasi kredit.",
};

export default function SalesPage() {
  const displayNumber = WHATSAPP_NUMBER.replace("62", "0").replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  const whatsappUrl = buildWhatsAppUrl({ source: "sales_page", source_cta: "sales_page_cta" });

  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container size="narrow">
        <p style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase", color: "var(--color-gold)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-4)" }}>
          Sales Resmi
        </p>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-6)" }}>
          {SALES_NAME}
        </h1>
        <p style={{ fontSize: "var(--text-md)", color: "var(--color-ink-muted)", marginBottom: "var(--space-8)", maxWidth: "50ch" }}>
          Sales resmi JAECOO Palembang. Siap membantu Anda menemukan SUV yang tepat — dari konsultasi, test drive, hingga simulasi kredit.
        </p>
        <p style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-6)" }}>
          {displayNumber}
        </p>
        <Button as="a" href={whatsappUrl} variant="whatsapp" size="lg" target="_blank" rel="noopener noreferrer">
          Chat via WhatsApp
        </Button>
      </Container>
    </section>
  );
}
