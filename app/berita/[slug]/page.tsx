/**
 * JAECOO Palembang — Berita Detail Page
 * Route: /berita/[slug]
 * Phase 2: Editorial article layout.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getPublishedNews } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { GoldLine } from "@/components/ui/GoldLine";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils/format";
import styles from "./berita-detail.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getPublishedNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <section className={styles.section}>
      <Container size="narrow">

        {/* Breadcrumb */}
        <Reveal variant="fade">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/berita" className={styles.breadcrumbLink}>
              ← JAECOO Journal
            </Link>
          </nav>
        </Reveal>

        <Reveal variant="fade-up" delay={80}>
          <div className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.category}>{article.category}</span>
              <span className={styles.date}>{formatDate(article.published_at)}</span>
            </div>
            <GoldLine width="short" className={styles.gold} />
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>
          </div>
        </Reveal>

        {/* Article body — Phase 3+ will render rich content */}
        <Reveal variant="fade-up" delay={150}>
          <div className={styles.body}>
            <p className={styles.bodyPlaceholder}>
              Konten artikel lengkap akan tersedia segera.
            </p>
          </div>
        </Reveal>

      </Container>
    </section>
  );
}
