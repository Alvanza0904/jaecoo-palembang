import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNews } from "@/lib/data/news";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { formatDate } from "@/lib/utils/format";
import styles from "./berita.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Berita JAECOO Palembang | Informasi Terbaru" },
  description: "Berita dan informasi terbaru seputar JAECOO di Palembang, dari produk hingga aktivitas dealer.",
  alternates: { canonical: "/berita" },
};

export default async function BeritaPage() {
  const news = await getPublishedNews();
  const [featured, ...rest] = news;

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="BERITA"
        heading="Cerita dari perjalanan."
        subheading="Informasi, tips, dan kabar terbaru JAECOO Palembang."
        size="medium"
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>Berita & Informasi</span>
            <h2 className={styles.heading}>Berita &amp; Artikel</h2>
          </div>

          {!featured ? (
            <div className={styles.empty}><p>Belum ada artikel yang dipublikasikan.</p></div>
          ) : (
            <>
              {/* Featured */}
              <Link href={`/berita/${featured.slug}`} className={styles.featured}>
                {featured.cover?.desktop ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.cover.desktop}
                    alt={featured.cover.alt ?? featured.title}
                    className={styles.featuredImg}
                  />
                ) : (
                  <div className={styles.featuredImgPlaceholder} aria-hidden="true" />
                )}
                <div>
                  <div className={styles.featuredMeta}>
                    <span className={styles.cat}>{featured.category}</span>
                    <span className={styles.date}>{formatDate(featured.published_at)}</span>
                  </div>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                  <span className={styles.readMore}>Baca selengkapnya →</span>
                </div>
              </Link>

              {/* Grid */}
              {rest.length > 0 && (
                <div className={styles.grid}>
                  {rest.map((item) => (
                    <Link key={item.id} href={`/berita/${item.slug}`} className={styles.article}>
                      {item.cover?.desktop && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover.desktop}
                          alt={item.cover.alt ?? item.title}
                          className={styles.articleImg}
                          loading="lazy"
                        />
                      )}
                      <div className={styles.featuredMeta}>
                        <span className={styles.cat}>{item.category}</span>
                        <span className={styles.date}>{formatDate(item.published_at)}</span>
                      </div>
                      <h3 className={styles.articleTitle}>{item.title}</h3>
                      <p className={styles.articleExcerpt}>{item.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
