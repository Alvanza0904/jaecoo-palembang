"use client";

import { useState } from "react";
import { deliveryAlt, type SalesDelivery } from "@/lib/sales/deliveries";
import styles from "./SalesPage.module.css";

const PREVIEW_COUNT = 5;

function line(item: SalesDelivery) {
  return [item.model, item.variant, item.location].map((part) => part.trim()).filter(Boolean).join(" · ");
}

function Frame({ item, featured }: { item: SalesDelivery; featured?: boolean }) {
  const src = item.image?.desktop || item.image?.mobile;
  if (!src) return null;
  const meta = line(item);
  const showCopy = Boolean(item.title.trim() || meta || item.caption.trim());
  return (
    <figure className={featured ? styles.deliveryFeature : styles.deliveryTile}>
      <img
        src={src}
        alt={deliveryAlt(item)}
        style={{ objectPosition: `${item.image?.focal_x ?? 50}% ${item.image?.focal_y ?? 40}%` }}
      />
      {showCopy && (
        <figcaption>
          {item.title.trim() && <strong>{item.title}</strong>}
          {meta && <span>{meta}</span>}
          {item.caption.trim() && <em>{item.caption}</em>}
        </figcaption>
      )}
    </figure>
  );
}

export function DeliverySection({ deliveries }: { deliveries: SalesDelivery[] }) {
  const visible = deliveries.filter((item) => item.published && (item.image?.desktop || item.image?.mobile));
  const [open, setOpen] = useState(false);
  if (visible.length === 0) return null;
  const shown = open ? visible : visible.slice(0, PREVIEW_COUNT);
  const [feature, ...rest] = shown;

  return (
    <section className={styles.delivery} aria-labelledby="serah-terima-heading">
      <div className={styles.deliveryIntro}>
        <p className={styles.kickerDark}>Sales JAECOO Palembang</p>
        <h2 id="serah-terima-heading">Serah Terima JAECOO</h2>
        <p>Beberapa momen bersama pelanggan saat memulai perjalanan bersama JAECOO.</p>
      </div>
      <div className={styles.deliveryStage}>
        {feature && <Frame item={feature} featured />}
        {rest.length > 0 && (
          <div className={styles.deliveryRest}>
            {rest.map((item) => <Frame key={item.id} item={item} />)}
          </div>
        )}
      </div>
      {visible.length > PREVIEW_COUNT && (
        <button type="button" className={styles.deliveryMore} onClick={() => setOpen((value) => !value)}>
          {open ? "Tampilkan lebih sedikit" : "Lihat semua"}
        </button>
      )}
    </section>
  );
}
