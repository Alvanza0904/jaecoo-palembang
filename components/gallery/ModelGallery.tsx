"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModelGalleryData, GalleryItem } from "@/lib/types/gallery";
import { flattenGalleryItems } from "@/lib/gallery/build-model-gallery";
import { GalleryLightbox } from "./GalleryLightbox";
import { Button } from "@/components/ui/Button";
import styles from "./ModelGallery.module.css";

interface Props {
  gallery: ModelGalleryData;
  modelHref: string;
  whatsappUrl: string;
  selector: Array<{ slug: string; short_name: string; href: string }>;
}

function thumbSrc(item: GalleryItem) {
  return item.image.desktop ?? item.image.tablet ?? item.image.mobile ?? "";
}

export function ModelGallery({ gallery, modelHref, whatsappUrl, selector }: Props) {
  const flat = useMemo(() => flattenGalleryItems(gallery), [gallery]);
  const [index, setIndex] = useState<number | null>(null);

  const openItem = (item: GalleryItem) => {
    const i = flat.findIndex((x) => x.id === item.id);
    if (i >= 0) setIndex(i);
  };

  return (
    <div className={styles.root}>
      <nav className={styles.selector} aria-label="Pilih model gallery">
        <span className={styles.selectorLabel}>Explore</span>
        <div className={styles.selectorList}>
          {selector.map((m) => (
            <Link
              key={m.slug}
              href={m.href}
              className={[styles.selectorItem, m.slug === gallery.slug ? styles.selectorActive : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {m.short_name}
            </Link>
          ))}
        </div>
      </nav>

      <header className={styles.hero}>
        {gallery.hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbSrc({ id: "hero", image: gallery.hero, published: true, sort_order: 0 })}
            alt={gallery.hero.alt || gallery.name}
            className={styles.heroImg}
          />
        ) : (
          <div className={styles.heroFallback} aria-hidden="true" />
        )}
        <div className={styles.heroOverlay}>
          <p className={styles.heroEyebrow}>JAECOO Gallery</p>
          <h1 className={styles.heroTitle}>{gallery.name}</h1>
          <p className={styles.heroCaption}>{gallery.hero_caption}</p>
        </div>
      </header>

      {gallery.sections.length === 0 && (
        <div className={styles.empty}>
          <p>Foto untuk model ini sedang dilengkapi. Sementara itu, lihat detail modelnya.</p>
          <Button as="link" href={modelHref} variant="darkPrimary" size="md">
            Lihat Detail {gallery.short_name} →
          </Button>
        </div>
      )}

      {gallery.sections.map((section) => (
        <section key={section.id} className={styles.section} id={section.id}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>{section.heading}</h2>
            {section.body && <p className={styles.sectionBody}>{section.body}</p>}
          </div>
          <div className={styles.mosaic}>
            {section.items.map((item) => {
              const src = thumbSrc(item);
              if (!src) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[styles.tile, styles[`layout_${item.layout ?? "square"}`]].join(" ")}
                  onClick={() => openItem(item)}
                  aria-label={item.title ? `Perbesar ${item.title}` : "Perbesar gambar"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={item.image.alt || item.title || gallery.name} loading="lazy" />
                  {(item.title || item.color_hex) && (
                    <span className={styles.tileMeta}>
                      {item.color_hex && (
                        <span
                          className={styles.swatch}
                          style={{ backgroundColor: item.color_hex }}
                          aria-hidden="true"
                        />
                      )}
                      {item.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <footer className={styles.cta}>
        <p className={styles.ctaEyebrow}>Sudah lihat semuanya?</p>
        <h2 className={styles.ctaHeading}>
          Kalau {gallery.short_name} terasa cocok, lanjutkan ke detail modelnya.
        </h2>
        <div className={styles.ctaActions}>
          <Button as="link" href={modelHref} variant="darkPrimary" size="lg">
            Lihat Detail {gallery.short_name} →
          </Button>
          <Button as="a" href={whatsappUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
            Chat dengan Alvan
          </Button>
        </div>
      </footer>

      <GalleryLightbox
        items={flat}
        index={index}
        onClose={() => setIndex(null)}
        onChange={setIndex}
      />
    </div>
  );
}
