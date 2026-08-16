import sharp from "sharp";

/**
 * Burn a disclaimer into the pixels of an AI-rendered stage image (P2-3).
 * If this image reaches social media or a group chat detached from the site,
 * this is the only disclaimer that travels with it — matches the wording used
 * on the share card and in the emailed design.
 *
 * Never call this on the customer's real "before" photo — only on AI output
 * (install/summer/bloom).
 */
const LABEL = "AI-generated illustration · not a photograph · Union Park Landscaping";

function svgBar(width) {
  const barHeight = Math.max(28, Math.round(width * 0.028));
  const fontSize = Math.max(12, Math.round(barHeight * 0.42));
  return Buffer.from(`
    <svg width="${width}" height="${barHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${barHeight}" fill="rgb(6,36,24)" />
      <text x="12" y="${Math.round(barHeight / 2 + fontSize / 3)}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" fill="#ffffff" font-weight="600">${LABEL}</text>
    </svg>
  `);
}

/**
 * @param {{base64: string, mimeType: string}} image
 * @returns {Promise<{base64: string, mimeType: string}>} watermarked image, same mimeType
 */
export async function watermarkStageImage(image) {
  if (!image?.base64) return image;
  try {
    const input = Buffer.from(image.base64, "base64");
    const meta = await sharp(input).metadata();
    const width = meta.width || 1024;
    const bar = svgBar(width);
    const out = await sharp(input)
      .composite([{ input: bar, gravity: "south" }])
      .toFormat(meta.format === "png" ? "png" : "jpeg", { quality: 92 })
      .toBuffer();
    return { base64: out.toString("base64"), mimeType: image.mimeType };
  } catch (err) {
    console.warn("watermarkStageImage failed — storing unwatermarked", err?.message || err);
    return image;
  }
}
