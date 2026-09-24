import type { CSSProperties } from "react";
import styles from "./CargoEditorial.module.css";

export const J5_CARGO_STATS = [
  { value: "480 L", label: "Kapasitas bagasi" },
  { value: "1.180 L", label: "Dengan kursi belakang dilipat" },
  { value: "35 L", label: "Front trunk / bagasi depan" },
] as const;

interface CargoEditorialProps {
  desktop?: string | null;
  mobile?: string | null;
  alt?: string;
  focalX?: number | null;
  focalY?: number | null;
  stats?: Array<{ value: string; label: string }>;
}

export function CargoEditorial({
  desktop,
  mobile,
  alt = "Bagasi JAECOO J5",
  focalX,
  focalY,
  stats = [...J5_CARGO_STATS],
}: CargoEditorialProps) {
  const position = `${focalX ?? 50}% ${focalY ?? 50}%`;
  const source = desktop || mobile;
  const imageStyle = { objectPosition: position } as CSSProperties;

  return (
    <section className={styles.section} data-contrast="dark" aria-label="Bagasi JAECOO J5">
      {source ? (
        <picture className={styles.media}>
          {mobile && desktop ? <source media="(max-width: 767px)" srcSet={mobile} /> : null}
          <img src={source} alt={alt} className={styles.image} style={imageStyle} />
        </picture>
      ) : null}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <p className={styles.value}>{stat.value}</p>
              <p className={styles.label}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
