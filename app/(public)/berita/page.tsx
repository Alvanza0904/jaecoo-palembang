import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNews } from "@/lib/data/news";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import styles from "./berita.module.css";

export const metadata: Metadata = {
  title: "JAECOO Journal — Berita & Artikel",
  description: "Berita, artikel, tips, review, promo dan update terbaru seputar JAECOO Palembang.",
  alternates: { canonical: "/berita" },
};

export default async function BeritaPage() {
  const news = await getPublishedNews();
  const featured = news[0];
  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="JAECOO JOURNAL"
        heading={<>Stories from<br /><strong>the road.</strong></>}
        subheading="News, insights, tips, review dan update JAECOO Palembang."
        size="medium"
        accent="default"
      />
      <section className={styles.section}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>THE JOURNAL</p>
          <h2>Stories, insights<br /><em>& latest updates.</em></h2>
          <div className={styles.filters}><span>ALL</span><span>NEWS</span><span>PROMO</span><span>REVIEW</span><span>TIPS & INFO</span></div>
        </div>
        {!featured ? (
          <div className={styles.empty}><p>Belum ada artikel yang dipublikasikan.</p></div>
        ) : (
          <div className={styles.grid}>
            <Link href={`/berita/${featured.slug}`} className={styles.featured}>
              <div className={styles.cover}>
                {featured.cover?.desktop?.startsWith("http") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.cover.desktop} alt={featured.cover.alt ?? featured.title} />
                )}
              </div>
              <div className={styles.featuredCopy}>
                <p>{featured.category}</p><h3>{featured.title}</h3><span>{featured.excerpt}</span><b>Read story ↗</b>
              </div>
            </Link>
            {news.slice(1).map((item) => (
              <Link href={`/berita/${item.slug}`} className={styles.article} key={item.id}>
                <div className={styles.articleCover}>
                  {item.cover?.desktop?.startsWith("http") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover.desktop} alt={item.cover.alt ?? item.title} />
                  )}
                </div>
                <p>{item.category}</p><h3>{item.title}</h3><span>{item.excerpt}</span><b>Read story ↗</b>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
