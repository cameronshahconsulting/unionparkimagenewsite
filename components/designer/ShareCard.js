"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Story card for group chat: before photo on top, full-bloom render below,
 * Union Park mark at the bottom.
 */

const W = 1080;
const H = 1920;

const CREAM = "#f4f8fa";
const FERN = "#0c4c5f";
const FERN_D = "#062733";
const SPROUT = "#1489a8";
const ACCENT = "#dd1a83";
const CEDAR = "#5a7581";

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** object-fit: cover, in canvas. */
function drawCover(ctx, img, x, y, w, h) {
  if (!img) {
    ctx.fillStyle = "#E7F0F4";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pill(ctx, text, x, y) {
  ctx.font = "700 30px Outfit, system-ui, sans-serif";
  const w = ctx.measureText(text).width + 52;
  ctx.fillStyle = "rgba(6,39,51,.78)";
  roundRect(ctx, x, y, w, 60, 8);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 26, y + 31);
}

export default function ShareCard({
  beforeSrc,
  bloomSrc,
  items = [],
  subtotal = 0,
  peakMonth,
  designId = null,
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const urlRef = useRef(null);

  const render = useCallback(async () => {
    const [before, bloom] = await Promise.all([loadImage(beforeSrc), loadImage(bloomSrc)]);
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* system fonts are a fine fallback */
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);

    const pad = 56;
    const imgW = W - pad * 2;

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = SPROUT;
    ctx.font = "800 26px Outfit, system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("MY YARD, PLANNED", pad, 112);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = FERN;
    ctx.font = "800 76px Outfit, system-ui, sans-serif";
    ctx.fillText("Before & after", pad, 200);

    const topY = 262;
    const topH = 560;
    ctx.save();
    roundRect(ctx, pad, topY, imgW, topH, 12);
    ctx.clip();
    drawCover(ctx, before, pad, topY, imgW, topH);
    ctx.restore();
    pill(ctx, "Today", pad + 28, topY + topH - 88);

    const botY = topY + topH + 28;
    const botH = 760;
    ctx.save();
    roundRect(ctx, pad, botY, imgW, botH, 12);
    ctx.clip();
    drawCover(ctx, bloom, pad, botY, imgW, botH);
    ctx.restore();
    pill(ctx, "In full bloom", pad + 28, botY + botH - 88);

    let y = botY + botH + 86;
    ctx.fillStyle = FERN;
    ctx.font = "700 46px Outfit, system-ui, sans-serif";
    const count = items.reduce((s, i) => s + (i.qty || 0), 0);
    ctx.fillText(`${count} plants · $${Math.round(subtotal).toLocaleString()}`, pad, y);

    if (peakMonth) {
      y += 52;
      ctx.fillStyle = CEDAR;
      ctx.font = "700 32px Outfit, system-ui, sans-serif";
      ctx.fillText(`Peak color in ${peakMonth}`, pad, y);
    }

    const markY = H - 132;
    ctx.fillStyle = FERN_D;
    roundRect(ctx, 0, H - 232, W, 232, 0);
    ctx.fill();

    ctx.fillStyle = ACCENT;
    ctx.font = "800 52px Outfit, system-ui, sans-serif";
    ctx.fillText("Union Park", pad, markY);

    ctx.fillStyle = "#cfeef7";
    ctx.font = "800 22px Outfit, system-ui, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("LANDSCAPING", pad + 4, markY + 42);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "rgba(207,238,247,.85)";
    ctx.font = "600 26px Outfit, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Designed with UPL", W - pad, markY - 14);
    ctx.fillText("unionparklandscape.com", W - pad, markY + 28);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(207,238,247,.55)";
    ctx.font = "600 19px Outfit, system-ui, sans-serif";
    ctx.fillText("AI-generated illustration · not a photograph · Call 811 before you dig", pad, H - 24);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, [beforeSrc, bloomSrc, items, subtotal, peakMonth]);

  const share = async () => {
    setBusy(true);
    setDone("");
    try {
      const blob = await render();
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "my-garden-upl.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My garden plan from Union Park Landscaping",
          text: "Look what my yard could look like",
        });
        setDone("Shared!");
      } else {
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlRef.current;
        a.download = "my-garden-upl.png";
        a.click();
        setDone("Saved to your photos");
      }
    } catch (err) {
      if (err?.name !== "AbortError") setDone("Couldn't make the card — try again.");
    }
    setBusy(false);
  };

  const copyLink = async () => {
    try {
      const path = designId ? `/designer/d/${designId}` : "/designer";
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setDone("Link copied");
    } catch {
      setDone("Couldn't copy the link.");
    }
  };

  return (
    <div className="shr">
      <div className="shr-copy">
        <strong>Show someone.</strong>
        <span>A before &amp; after card, ready for the group chat.</span>
      </div>
      <div className="shr-acts">
        <button type="button" className="btn btn-primary shr-btn" onClick={share} disabled={busy}>
          {busy ? "Making it…" : "Share"}
        </button>
        <button type="button" className="shr-link" onClick={copyLink}>
          Copy link
        </button>
      </div>
      {done ? (
        <p className="shr-done" role="status">
          {done}
        </p>
      ) : null}
    </div>
  );
}
