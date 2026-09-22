/**
 * JAECOO Palembang — HomeDealerLocation
 * Nomor HP dalam text address otomatis jadi link WhatsApp.
 *
 * FIX: Tambah presentation_settings support agar background image mengikuti
 * layout dari Visual Editor (position, scale, object-fit).
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import { SITE_SETTINGS } from "@/lib/data/site";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./HomeDealerLocation.module.css";
import type { ResponsiveImage } from "@/lib/types/media";

/** Resolve CSS styles dari presentation_settings untuk background image */
function bgStyle(image: ResponsiveImage | undefined, breakpoint: "desktop" | "mobile"): CSSProperties {
  if (!image?.presentation_settings) return {};
  const settings = breakpoint === "mobile"
    ? (image.presentation_settings_mobile ?? image.presentation_settings)
    : image.presentation_settings;
  if (!settings) return {};
  return getBackgroundLayerStyle(settings, breakpoint, image.focal_x ?? 50, image.focal_y ?? 50);
}

interface DealerCms {
  title?: string;
  description?: string;
  address?: string;
}

interface Props {
  backgroundImage?: ResponsiveImage;
  cms?: DealerCms;
}

function renderAddressWithWaLinks(text: string) {
  const phoneRegex = /(\+?62|0)[0-9]{8,12}/g;
  const parts = text.split(phoneRegex);
  const matches = text.match(phoneRegex) || [];

  const result: React.ReactNode[] = [];
  let matchIndex = 0;

  parts.forEach((part, i) => {
    part.split("\n").forEach((line, j) => {
      if (j > 0) result.push(<br key={`br-${i}-${j}`} />);
      if (line) result.push(line);
    });

    if (matchIndex < matches.length && i < parts.length - 1) {
      const raw = matches[matchIndex];
      const normalized = raw.startsWith("0")
        ? "62" + raw.slice(1)
        : raw.replace("+", "");
      const waText = encodeURIComponent(
        "Halo, saya ingin melakukan test drive di showroom OMODA JAECOO Palembang. Mohon informasi jadwal yang tersedia. Terima kasih!"
      );
      result.push(
        <a
          key={`wa-${matchIndex}`}
          href={`https://wa.me/${normalized}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.phoneLink}
        >
          {raw}
        </a>
      );
      matchIndex++;
    }
  });

  return result;
}

export function HomeDealerLocation({ backgroundImage, cms }: Props) {
  const { dealerAddress } = SITE_SETTINGS;

  // Fallback ke SITE_SETTINGS kalau CMS kosong
  const address = cms?.address ||
    `${dealerAddress.street}\n${dealerAddress.locality}\n${dealerAddress.region} ${dealerAddress.postalCode}`;
  const title = cms?.title || "OMODA JAECOO\nPalembang";

  return (
    <section className={styles.section} aria-labelledby="dealer-title">
      {backgroundImage?.desktop && (
        <picture>
          {backgroundImage.mobile && (
            <source media="(max-width: 767px)" srcSet={backgroundImage.mobile} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage.desktop}
            alt=""
            className={styles.bgImg}
            aria-hidden="true"
            loading="lazy"
            style={{
              ...bgStyle(backgroundImage, "desktop"),
              // Mobile override via CSS vars jika ada
              ...(backgroundImage.mobile ? {
                "--dealer-bg-mobile-fit":      bgStyle(backgroundImage, "mobile").objectFit,
                "--dealer-bg-mobile-position": bgStyle(backgroundImage, "mobile").objectPosition,
                "--dealer-bg-mobile-transform": bgStyle(backgroundImage, "mobile").transform,
              } as CSSProperties : {}),
            }}
          />
        </picture>
      )}

      <div className={styles.inner}>
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
