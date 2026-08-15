"use client";

import { useCallback, useRef, useState } from "react";

/**
 * The thing she texts to the group chat.
 *
 * A 1080×1920 story card drawn on canvas: her real yard on top, the full-bloom
 * render below, Annie's mark at the bottom. Both images are same-origin (or
 * data URLs), so the canvas never taints and the download always works.
 */

const W = 1080;
const H = 1920;

const CREAM = "#FFFBF1";
const FERN = "#3B4A32";
const FERN_D = "#2C3826";
const SPROUT = "#6E8B5B";
const GOLD = "#F6D46B";
const CEDAR = "#94693F";

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
    ctx.fillStyle = "#E7EFD9";
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
  ctx.font = "700 30px 'Nunito Sans', system-ui, sans-serif";
  const w = ctx.measureText(text).width + 52;
  ctx.fillStyle = "rgba(20,28,16,.72)";
  roundRect(ctx, x, y, w, 60, 30);
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

    // ---- header ----
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = SPROUT;
    ctx.font = "800 26px 'Nunito Sans', system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("MY YARD, PLANNED", pad, 112);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = FERN;
    ctx.font = "600 76px Fraunces, Georgia, serif";
    ctx.fillText("Before & after", pad, 200);

    // ---- the two photos ----
    const topY = 262;
    const topH = 560;
    ctx.save();
    roundRect(ctx, pad, topY, imgW, topH, 28);
    ctx.clip();
    drawCover(ctx, before, pad, topY, imgW, topH);
    ctx.restore();
    pill(ctx, "Today", pad + 28, topY + topH - 88);

    const botY = topY + topH + 28;
    const botH = 760;
    ctx.save();
    roundRect(ctx, pad, botY, imgW, botH, 28);
    ctx.clip();
    drawCover(ctx, bloom, pad, botY, imgW, botH);
    ctx.restore();
    pill(ctx, "In full bloom", pad + 28, botY + botH - 88);

    // ---- the plan, in one honest line ----
    let y = botY + botH + 86;
    ctx.fillStyle = FERN;
    ctx.font = "600 46px Fraunces, Georgia, serif";
    const count = items.reduce((s, i) => s + (i.qty || 0), 0);
    ctx.fillText(`${count} plants · $${Math.round(subtotal).toLocaleString()}`, pad, y);

    if (peakMonth) {
      y += 52;
      ctx.fillStyle = CEDAR;
      ctx.font = "700 32px 'Nunito Sans', system-ui, sans-serif";
      ctx.fillText(`Peak color in ${peakMonth}`, pad, y);
    }

    // ---- Annie's mark ----
    const markY = H - 132;
    ctx.fillStyle = FERN_D;
    roundRect(ctx, 0, H - 232, W, 232, 0);
    ctx.fill();

    ctx.fillStyle = GOLD;
    ctx.font = "700 66px 'Dancing Script', cursive";
    ctx.fillText("Annie's", pad, markY);

    ctx.fillStyle = "#DCE7CF";
    ctx.font = "800 22px 'Nunito Sans', system-ui, sans-serif";
    ctx.letterSpacing = "7px";
    ctx.fillText("ONLINE NURSERY", pad + 4, markY + 42);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "rgba(220,231,207,.75)";
    ctx.font = "600 26px 'Nunito Sans', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Designed with Annie's", W - pad, markY - 14);
    ctx.fillText("anniesonlinenursery.com", W - pad, markY + 28);
    ctx.textAlign = "left";

    // P1-3 / P2-3 — this card can end up on social media detached from the
    // site, so the disclaimer has to travel with the pixels, not just live
    // on the page. Small print, still legible.
    ctx.fillStyle = "rgba(220,231,207,.6)";
    ctx.font = "600 19px 'Nunito Sans', system-ui, sans-serif";
    ctx.fillText("AI-generated illustration · not a photograph · Call 811 before you dig", pad, H - 24);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, [beforeSrc, bloomSrc, items, subtotal, peakMonth]);

  const share = async () => {
    setBusy(true);
    setDone("");
    try {
      const blob = await render();
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "my-garden-annies.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My garden plan from Annie's",
          text: "Look what my yard could look like 🌿",
        });
        setDone("Shared!");
      } else {
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlRef.current;
        a.download = "my-garden-annies.png";
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
