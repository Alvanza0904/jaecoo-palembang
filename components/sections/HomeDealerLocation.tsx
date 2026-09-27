/**
 * JAECOO Palembang — HomeDealerLocation
 * Nomor HP dalam text address otomatis jadi link WhatsApp.
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import { SITE_SETTINGS } from "@/lib/data/site";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./HomeDealerLocation.module.css";
import type { ResponsiveImage } from "@/lib/types/media";

interface DealerCms {
  title?: string;
  description?: string;
  address?: string;
}

interface Props {
  backgroundImage?: ResponsiveImage;
  cms?: DealerCms;
  /** Preview-only: nilai untuk data-text-focus attribute pada text container. Undefined di live website. */
  textFocusAttr?: string;
}

function renderAddressWithWaLinks(text: string) {
  const phoneRegex = /(?:\+62|62|0)[0-9]{8,13}/g;
  const result: React.ReactNode[] = [];
  let last = 0;
  let index = 0;

  const pushText = (value: string, key: string) => {
    value.split("\n").forEach((line, lineIndex) => {
      if (lineIndex > 0) result.push(<br key={`${key}-br-${lineIndex}`} />);
      if (line) result.push(line);
    });
  };

  for (const match of text.matchAll(phoneRegex)) {
    const start = match.index ?? 0;
    const raw = match[0];
    if (start > last) pushText(text.slice(last, start), `t-${index}`);

    const normalized = raw.startsWith("+")
      ? raw.slice(1)
      : raw.startsWith("0")
        ? `62${raw.slice(1)}`
        : raw;
    const waText = encodeURIComponent(
      "Halo, saya ingin melakukan test drive di showroom OMODA JAECOO Palembang. Mohon informasi jadwal yang tersedia. Terima kasih!",
    );
    result.push(
      <a
        key={`wa-${index}`}
        href={`https://wa.me/${normalized}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.phoneLink}
      >
        {raw}
      </a>,
    );
    last = start + raw.length;
    index += 1;
  }

  if (last < text.length) pushText(text.slice(last), "tail");
  return result;
}

export function HomeDealerLocation({ backgroundImage, cms, textFocusAttr }: Props) {
  const { dealerAddress } = SITE_SETTINGS;

  // Fallback ke SITE_SETTINGS kalau CMS kosong
  const address = cms?.address ||
    `${dealerAddress.street}\n${dealerAddress.locality}\n${dealerAddress.region} ${dealerAddress.postalCode}`;
  const title = cms?.title || "OMODA JAECOO\nPalembang";

  return (
    <section className={styles.section} aria-labelledby="dealer-title">
      {backgroundImage?.desktop && (() => {
        const ps = backgroundImage.presentation_settings;
        const desktopStyle: CSSProperties = ps
          ? getBackgroundLayerStyle(ps, "desktop", backgroundImage.focal_x ?? 50, backgroundImage.focal_y ?? 50)
          : {};
        const mobilePs = backgroundImage.presentation_settings_mobile ?? ps;
        const mobileStyle: CSSProperties = mobilePs
          ? getBackgroundLayerStyle(mobilePs, "mobile", backgroundImage.focal_x ?? 50, backgroundImage.focal_y ?? 50)
          : {};
        const imgStyle: CSSProperties = {
          ...desktopStyle,
          "--dealer-mobile-fit":       mobileStyle.objectFit,
          "--dealer-mobile-position":  mobileStyle.objectPosition,
          "--dealer-mobile-transform": mobileStyle.transform,
          "--dealer-mobile-origin":    mobileStyle.transformOrigin,
        } as CSSProperties;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage.desktop}
            alt=""
            className={styles.bgImg}
            aria-hidden="true"
            loading="lazy"
            style={Object.keys(imgStyle).length > 0 ? imgStyle : undefined}
          />
        );
      })()}

      <div
        className={styles.inner}
        {...(textFocusAttr ? { 'data-text-focus': textFocusAttr } : {})}
      >
        <span className={styles.eyebrow}>Dealer Resmi</span>
        <h2 id="dealer-title" className={styles.title}>
          {title.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h2>
        <address className={styles.address} style={{ fontStyle: "normal" }}>
          {renderAddressWithWaLinks(address)}
        </address>
        <Link href="/sales-jaecoo-palembang" className={styles.cta}>
          Konsultasi dengan Alvan →
        </Link>
      </div>
    </section>
  );
}
