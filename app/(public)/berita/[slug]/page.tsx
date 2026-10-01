/**
 * JAECOO Palembang — Berita Detail Page
 * Route: /berita/[slug]
 *
 * ANIMASI OTOMATIS: Semua konten artikel — judul, excerpt, body_html —
 * dibungkus AnimatedNewsBody yang parse dan animasikan setiap block.
 * Artikel baru dari Supabase otomatis mendapat animasi tanpa edit kode.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug, getAllNewsSlugs } from "@/lib/data/news";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNewsBody } from "@/components/motion/AnimatedNewsBody";
import { formatDate } from "@/lib/utils/format";
import styles from "./berita-detail.module.css";

export const revalidate = 60;

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
    title: article.meta_title ?? `${article.title} | Berita JAECOO Palembang`,
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
      <div className={styles.shell}>
        {/* Breadcrumb */}
        <Reveal variant="fade" threshold={0}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/berita" className={styles.breadcrumbLink}>← Berita JAECOO</Link>
          </nav>
        </Reveal>

        {/* Cover */}
        {article.cover?.desktop && (
          <Reveal variant="scale" delay={60}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover.desktop}
              alt={article.cover.alt ?? article.title}
              className={styles.cover}
            />
          </Reveal>
        )}

        <header className={styles.header}>
          <Reveal variant="fade-up" delay={0}>
            <div className={styles.meta}>
              <span className={styles.category}>{article.category}</span>
              <span className={styles.date}>{formatDate(article.published_at)}</span>
            </div>
            <hr className={styles.gold} />
          </Reveal>

          <Reveal variant="mask" delay={80}>
            <h1 className={styles.title}>{article.title}</h1>
          </Reveal>

          <Reveal variant="fade-up" delay={160}>
            <p className={styles.excerpt}>{article.excerpt}</p>
          </Reveal>
        </header>

        {/* Body — AnimatedNewsBody: semua artikel baru otomatis mendapat animasi */}
        <div className={styles.body}>
          {article.body_html ? (
            <AnimatedNewsBody
              html={article.body_html}
              className={styles.bodyAnimated}
            />
          ) : (
            <Reveal variant="fade-up">
              <p className={styles.bodyPlaceholder}>
                Konten artikel lengkap akan tersedia segera.
              </p>
            </Reveal>
          )}
        </div>

        {/* Back */}
        <Reveal variant="fade" delay={0}>
          <div className={styles.backRow}>
            <Link href="/berita" className={styles.breadcrumbLink}>
              ← Semua Artikel
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
