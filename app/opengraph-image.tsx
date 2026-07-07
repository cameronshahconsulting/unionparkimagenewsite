import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — Landscaping in Wilmington, DE`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #122b21 0%, #1e4d38 60%, #276046 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#ddeee4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1e4d38",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            UP
          </div>
          <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: "#cddad2" }}>
            Union Park Landscaping
          </div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 48, lineHeight: 1.1, maxWidth: 950 }}>
          Landscaping in Wilmington &amp; New Castle County, DE
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 32, color: "#cddad2" }}>
          {`5.0 on Google · Free estimates · ${site.phone}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
