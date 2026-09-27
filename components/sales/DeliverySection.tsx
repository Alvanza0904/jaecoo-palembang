"use client";

import { useState } from "react";
import { deliveryAlt, type SalesDelivery } from "@/lib/sales/deliveries";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./SalesPage.module.css";

const PREVIEW_COUNT = 5;

function line(item: SalesDelivery) {
  return [item.model, item.variant, item.location].map((part) => part.trim()).filter(Boolean).join(" · ");
}

function Frame({ item, featured, index = 0 }: { item: SalesDelivery; featured?: boolean; index?: number }) {
  const src = item.image?.desktop || item.image?.mobile;
  if (!src) return null;
  const meta = line(item);
  const showCopy = Boolean(item.title.trim() || meta || item.caption.trim());
  const variants = ["fade-up", "fade", "scale", "slide-left", "slide-right"] as const;
  const variant = featured ? "scale" : variants[index % variants.length];
  return (
    <Reveal variant={variant} delay={featured ? 0 : (index % 3) * 70}>
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
    </Reveal>
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
        <Reveal variant="fade-up" delay={0}>
          <p className={styles.kickerDark}>Sales JAECOO Palembang</p>
        </Reveal>
        <Reveal variant="mask" delay={80}>
          <h2 id="serah-terima-heading">Serah Terima JAECOO</h2>
        </Reveal>
        <Reveal variant="fade-up" delay={160}>
          <p>Beberapa momen bersama pelanggan saat memulai perjalanan bersama JAECOO.</p>
        </Reveal>
      </div>
      <div className={styles.deliveryStage}>
        {feature && <Frame item={feature} featured />}
        {rest.length > 0 && (
          <div className={styles.deliveryRest}>
            {rest.map((item, i) => <Frame key={item.id} item={item} index={i} />)}
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
