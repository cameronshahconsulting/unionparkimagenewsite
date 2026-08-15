/**
 * Browser-side image helpers. Downscale before upload so phone photos
 * (4–12MB) fit under Vercel's ~4.5MB body limit and cost less on Gemini.
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

/**
 * @param {File|Blob} file
 * @param {{ maxEdge?: number, quality?: number }} [opts]
 * @returns {Promise<{ dataUrl: string, base64: string, mimeType: string, width: number, height: number }>}
 */
export async function downscaleImage(file, opts = {}) {
  const maxEdge = opts.maxEdge ?? MAX_EDGE;
  const quality = opts.quality ?? JPEG_QUALITY;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const mimeType = "image/jpeg";
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const base64 = dataUrl.split(",")[1] || "";
  return { dataUrl, base64, mimeType, width, height };
}
