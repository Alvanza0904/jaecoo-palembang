import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { formatDate } from "@/lib/utils/format";

interface Props { params: Promise<{ slug: string }> }

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();
  return (
    <section style={{ paddingBlock: "var(--space-20)" }}>
      <Container size="narrow">
        <p style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)", color: "var(--color-gold)", fontWeight: "var(--weight-medium)" }}>
          {article.category}
        </p>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", marginTop: "var(--space-3)" }}>
          {article.title}
        </h1>
        <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--color-ink-muted)" }}>
          {formatDate(article.published_at)}
        </p>
        <p style={{ marginTop: "var(--space-6)", fontSize: "var(--text-md)", color: "var(--color-ink-muted)" }}>
          {article.excerpt}
        </p>
      </Container>
    </section>
  );
}
