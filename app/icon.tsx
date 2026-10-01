import { ImageResponse } from "next/og";

/**
 * Favicon — circular white badge + bold JAECOO "J"
 * Style matches common Google knowledge-panel site icons:
 * solid white circle, black geometric J, generous padding.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const s = size.width;
  // Inner drawing box (~62% of circle) so J stays bold and centered
  const inset = s * 0.19;
  const box = s - inset * 2;

  // Geometric J: vertical stem (right) + bottom hook (leftward)
  // Proportions tuned to the official JAECOO wordmark J.
  const stemW = box * 0.28;
  const stemX = inset + box - stemW;
  const stemY = inset;
  const stemH = box * 0.92;

  const barH = box * 0.28;
  const barY = inset + box - barH;
  const barX = inset + box * 0.08;
  const barW = box * 0.92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Circular white badge (reads clean in browser tabs & Google) */}
        <div
          style={{
            width: s,
            height: s,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            position: "relative",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Bottom hook of J */}
          <div
            style={{
              position: "absolute",
              left: barX,
              top: barY,
              width: barW,
              height: barH,
              backgroundColor: "#000000",
              borderRadius: barH * 0.12,
            }}
          />
          {/* Vertical stem of J */}
          <div
            style={{
              position: "absolute",
              left: stemX,
              top: stemY,
              width: stemW,
              height: stemH,
              backgroundColor: "#000000",
              borderRadius: stemW * 0.12,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
