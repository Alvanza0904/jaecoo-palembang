"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-off-white)",
      padding: "var(--space-8)",
      textAlign: "center",
      gap: "var(--space-6)"
    }}>
      <p style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--color-gold)" }}>
        Error
      </p>
      <h2 style={{ fontSize: "clamp(var(--text-xl), 4vw, var(--text-2xl))", fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-tight)", color: "var(--color-ink)" }}>
        Terjadi Kesalahan
      </h2>
      <p style={{ color: "var(--color-ink-muted)", maxWidth: "40ch" }}>
        Mohon maaf, ada yang tidak beres. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "13px 26px",
          background: "var(--color-charcoal)",
          color: "var(--color-white)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--weight-medium)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          cursor: "pointer",
          border: "none"
        }}
      >
        Coba Lagi
      </button>
    </div>
  );
}
