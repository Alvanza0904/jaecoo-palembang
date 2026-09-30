"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types/gallery";
import styles from "./GalleryLightbox.module.css";

interface Props {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

function srcOf(item: GalleryItem) {
  return item.image.desktop ?? item.image.tablet ?? item.image.mobile ?? "";
}

export function GalleryLightbox({ items, index, onClose, onChange }: Props) {
  const open = index !== null && items[index];

  const go = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      const next = (index + delta + items.length) % items.length;
      onChange(next);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go, onClose]);

  if (!open || index === null) return null;
  const item = items[index];
  const src = srcOf(item);
  if (!src) return null;

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={item.title ?? "Galeri"}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Tutup" />
      <div className={styles.stage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={item.image.alt || item.title || "JAECOO"} className={styles.image} />
        {(item.title || item.description) && (
          <div className={styles.caption}>
            {item.title && <p className={styles.title}>{item.title}</p>}
            {item.description && <p className={styles.desc}>{item.description}</p>}
          </div>
        )}
      </div>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Tutup">
        ×
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className={styles.prev} onClick={() => go(-1)} aria-label="Sebelumnya">
            ‹
          </button>
          <button type="button" className={styles.next} onClick={() => go(1)} aria-label="Berikutnya">
            ›
          </button>
          <p className={styles.counter}>
            {index + 1} / {items.length}
          </p>
        </>
      )}
    </div>
  );
}

export function useGalleryLightbox(items: GalleryItem[]) {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    openAt: (i: number) => setIndex(i),
    close: () => setIndex(null),
    setIndex,
    items,
  };
}
