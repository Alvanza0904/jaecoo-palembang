/**
 * JAECOO Palembang — HomeDealerLocation
 * Local SEO + dealer address section.
 * Nomor HP dalam text address otomatis jadi link WhatsApp.
 */

import Link from "next/link";
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
}

// Detect pola nomor HP Indonesia (08xx / +628xx / 628xx) dan convert ke link WA
function renderAddressWithWaLinks(text: string) {
  const phoneRegex = /(\+?62|0)[0-9]{8,12}/g;
  const parts = text.split(phoneRegex);
  const matches = text.match(phoneRegex) || [];

  const result: React.ReactNode[] = [];
  let matchIndex = 0;

  parts.forEach((part, i) => {
    // Split by \n untuk handle newline
    part.split("\n").forEach((line, j) => {
      if (j > 0) result.push(<br key={`br-${i}-${j}`} />);
      if (line) result.push(line);
    });

    if (matchIndex < matches.length && i < parts.length - 1) {
      const raw = matches[matchIndex];
      // Normalisasi ke format 62xxx
      const normalized = raw.startsWith("0")
        ? "62" + raw.slice(1)
        : raw.replace("+", "");
      const waText = encodeURIComponent(
        "Halo, saya ingin melakukan test drive di showroom OMODA JAECOO Palembang. Mohon informasi jadwal yang tersedia. Terima kasih!"
      );
      const waUrl = `https://wa.me/${normalized}?text=${waText}`;
      result.push(
        <a
          key={`wa-${matchIndex}`}
          href={waUrl}
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
  const address = cms?.address || "";
  const title = cms?.title || "OMODA JAECOO\nPalembang";

  return (
    <section className={styles.section} aria-labelledby="dealer-title">
      {backgroundImage?.desktop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage.desktop}
          alt=""
          className={styles.bgImg}
          aria-hidden="true"
          loading="lazy"
        />
      )}

      <div className={styles.inner}>
        <div>
          <span className={styles.eyebrow}>Dealer Resmi</span>
          <h2 id="dealer-title" className={styles.title}>
            {title.split("\n").map((line, i) => (
              <span key={i}>{line}{i < title.split("\n").length - 1 && <br />}</span>
            ))}
          </h2>
          {address && (
            <address className={styles.address} style={{ fontStyle: "normal" }}>
              {renderAddressWithWaLinks(address)}
            </address>
          )}
          <Link href="/sales-jaecoo-palembang" className={styles.cta}>
            Konsultasi dengan Alvan →
          </Link>
        </div>
      </div>
    </section>
  );
}
