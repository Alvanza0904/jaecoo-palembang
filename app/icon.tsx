import { ImageResponse } from "next/og";

/** JAECOO wordmark — letter J only, white background */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Pixel map of the official JAECOO "J" glyph (1 = ink, 0 = empty).
 * Derived from the brand logo; rendered on solid white.
 */
const J_MAP = [
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00000000000000000111",
  "00111111111111110111",
  "00111111111111110111",
  "00011111111111110111",
  "00001111111111110111",
];

export default function Icon() {
  const rows = J_MAP.length;
  const cols = J_MAP[0].length;
  const pad = 4;
  const cellW = (size.width - pad * 2) / cols;
  const cellH = (size.height - pad * 2) / rows;

  const cells: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (J_MAP[r][c] !== "1") continue;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            left: pad + c * cellW,
            top: pad + r * cellH,
            width: cellW + 0.5,
            height: cellH + 0.5,
            backgroundColor: "#000000",
          }}
        />,
      );
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          position: "relative",
          display: "flex",
        }}
      >
        {cells}
      </div>
    ),
    { ...size },
  );
}
