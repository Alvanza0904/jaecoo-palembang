/**
 * JAECOO Palembang — Berita / JAECOO Journal
 * Route: /berita
 * Phase 2: Visual foundation — hero + editorial layout placeholder.
 */

import type { Metadata } from "next";
import { getPublishedNews } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import styles from "./berita.module.css";

export const metadata: Metadata = {
  title: "JAECOO Journal — Berita & Artikel",
  description: "Berita, artikel, dan update terbaru seputar JAECOO Palembang.",
};

export default function BeritaPage() {
  const news = getPublishedNews();

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="The JAECOO Journal"
        heading="Stories from the road."
        size="medium"
        accent="default"
      />

      <section className={styles.section}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.header}>
              <GoldLine width="short" className={styles.gold} />
              <SectionHeading
                eyebrow="Journal"
                heading="Berita Terbaru"
                subheading="Artikel, update produk, dan cerita dari JAECOO Palembang."
              />
            </div>
          </Reveal>

          {news.length === 0 ? (
            <Reveal variant="fade" delay={150}>
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  Belum ada artikel. Pantau terus untuk update terbaru dari JAECOO Palembang.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className={styles.grid}>
              {/* NewsCard grid — Phase 3+ */}
              {news.map((item) => (
                <article key={item.id} className={styles.articleRow}>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleCategory}>{item.category}</span>
                    <span className={styles.articleDate}>
                      {new Date(item.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className={styles.articleTitle}>{item.title}</h2>
                  <p className={styles.articleExcerpt}>{item.excerpt}</p>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
