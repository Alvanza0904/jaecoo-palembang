/**
 * JAECOO Palembang — Berita Detail Page
 * Route: /berita/[slug]
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getAllNewsSlugs } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { formatDate } from "@/lib/utils/format";
import styles from "./berita-detail.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return {
    title: article.meta_title ?? `${article.title} — JAECOO Journal`,
    description: article.meta_description ?? article.excerpt,
    alternates: { canonical: `/berita/${slug}` },
    openGraph: {
      url: `/berita/${slug}`,
      title: article.title,
      description: article.excerpt,
      images: article.cover?.desktop ? [{ url: article.cover.desktop }] : [],
    },
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <section className={styles.section}>
      <Container size="narrow">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/berita" className={styles.breadcrumbLink}>← JAECOO Journal</Link>
        </nav>

        {/* Cover */}
        {article.cover?.desktop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover.desktop}
            alt={article.cover.alt ?? article.title}
            style={{
              width: "100%",
              aspectRatio: "16/9",
              objectFit: "cover",
              display: "block",
              marginBottom: "var(--space-10)",
              background: "var(--color-border)"
            }}
          />
        )}

        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.category}>{article.category}</span>
            <span className={styles.date}>{formatDate(article.published_at)}</span>
          </div>
          <hr className={styles.gold} />
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {article.body_html ? (
            <div dangerouslySetInnerHTML={{ __html: article.body_html }} />
          ) : (
            <div>
              <p className={styles.bodyPlaceholder}>
                Artikel ini sedang dalam proses penulisan dan akan segera tersedia.
              </p>
              <p className={styles.bodyPlaceholder}>
                Untuk informasi terkini seputar JAECOO Palembang, hubungi Sales resmi kami
                Alvan melalui WhatsApp <a href="https://wa.me/6285183145926" target="_blank" rel="noopener noreferrer">0851-8314-5926</a>.
              </p>
            </div>
          )}
        </div>

        {/* Back */}
        <div style={{ marginTop: "var(--space-16)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border)" }}>
          <Link href="/berita" className={styles.breadcrumbLink}>
            ← Semua Artikel
          </Link>
        </div>
      </Container>
    </section>
  );
}
