import { notFound } from "next/navigation";
import { getPromoBySlug } from "@/lib/data/promos";
import { Container } from "@/components/ui/Container";

interface Props { params: Promise<{ slug: string }> }

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params;
  const promo = getPromoBySlug(slug);
  if (!promo) notFound();
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container size="narrow">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{promo.title}</h1>
        <p style={{ marginTop: "var(--space-4)", color: "var(--color-ink-muted)" }}>{promo.description}</p>
      </Container>
    </section>
  );
}
