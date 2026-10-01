import { ImageResponse } from "next/og";

/** Apple touch icon — JAECOO J on solid white */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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

export default function AppleIcon() {
  const rows = J_MAP.length;
  const cols = J_MAP[0].length;
  const pad = 22;
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
            width: cellW + 0.6,
            height: cellH + 0.6,
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
