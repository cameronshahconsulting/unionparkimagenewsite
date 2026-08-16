import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}. Landscaping in Wilmington, DE`;
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
          padding: "72px 80px",
          background: "#000000",
          color: "white",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 14,
              background: "#000",
              border: "3px solid #17aacb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dd1a83",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: "3px 3px 0 #17aacb",
            }}
          >
            UPL
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#dd1a83",
              textShadow: "3px 3px 0 #17aacb",
            }}
          >
            Union Park Landscaping
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            marginTop: 44,
            lineHeight: 1.1,
            maxWidth: 980,
            color: "#ffffff",
          }}
        >
          Landscaping in Wilmington &amp; New Castle County, DE
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 28, color: "#17aacb", fontWeight: 700 }}>
          {`5.0 on Google · Free estimates · ${site.phone}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
