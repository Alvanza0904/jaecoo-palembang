import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-charcoal)",
      color: "var(--color-ink-on-dark)",
      padding: "var(--space-8)",
      textAlign: "center",
      gap: "var(--space-6)"
    }}>
      <p style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--color-gold)" }}>
        404
      </p>
      <h1 style={{ fontSize: "clamp(var(--text-2xl), 6vw, var(--text-4xl))", fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-tight)" }}>
        Halaman Tidak Ditemukan
      </h1>
      <p style={{ color: "var(--color-ink-muted-dark)", maxWidth: "40ch" }}>
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "13px 26px",
          background: "var(--color-white)",
          color: "var(--color-charcoal)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--weight-medium)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          textDecoration: "none"
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
