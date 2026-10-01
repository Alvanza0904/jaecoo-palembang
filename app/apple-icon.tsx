import { ImageResponse } from "next/og";

/** Apple touch icon — circular white badge + bold JAECOO J */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const s = size.width;
  const inset = s * 0.19;
  const box = s - inset * 2;

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
