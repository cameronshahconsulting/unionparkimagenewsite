import { uploadDesignImage, downloadDesignImage, supabaseConfigured } from "./supabase";
import { watermarkStageImage } from "./watermark";

const MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

/** Sniff real bytes — Gemini often returns JPEG while claiming PNG. */
export function sniffImageMime(buf) {
  if (!buf?.length || buf.length < 12) return null;
  if (MAGIC.jpeg.every((b, i) => buf[i] === b)) return "image/jpeg";
  if (MAGIC.png.every((b, i) => buf[i] === b)) return "image/png";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function designMediaUrl(id, name) {
  return `/api/design/media/${id}/${name}`;
}

/**
 * Upload to Supabase (audit) and return a same-origin media URL so the browser
 * always gets the correct Content-Type (fixes Safari blank images).
 */
export async function storeDesignImage(id, name, image) {
  if (!image?.base64) return null;
  // Burn the "AI illustration, not a photo" disclaimer into every AI-rendered
  // stage (P2-3) — this is the only path that stores install/summer/bloom
  // output, and never the customer's real "before" photo (that goes through
  // storeDesignBuffer instead).
  const watermarked = await watermarkStageImage(image);
  const buffer = Buffer.from(watermarked.base64, "base64");
  const mimeType = sniffImageMime(buffer) || image.mimeType || "image/png";
  const path = `${id}/${name}`;

  if (supabaseConfigured) {
    try {
      await uploadDesignImage(buffer, path, mimeType);
      return designMediaUrl(id, name);
    } catch (err) {
      console.error(`storeDesignImage ${name}`, err);
      // Still show the image to the customer even if storage is misconfigured.
      return `data:${mimeType};base64,${watermarked.base64}`;
    }
  }
  return `data:${mimeType};base64,${image.base64}`;
}

export async function storeDesignBuffer(id, name, buffer, mimeHint) {
  if (!buffer?.length) return null;
  const mimeType = sniffImageMime(buffer) || mimeHint || "image/png";
  const path = `${id}/${name}`;

  if (supabaseConfigured) {
    try {
      await uploadDesignImage(buffer, path, mimeType);
      return designMediaUrl(id, name);
    } catch (err) {
      console.error(`storeDesignBuffer ${name}`, err);
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
  }
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/** Load a stored design image; tries extensionless path then legacy .jpg/.png. */
export async function loadDesignImage(id, name) {
  const candidates = [name, `${name}.jpg`, `${name}.jpeg`, `${name}.png`, `${name}.webp`];
  for (const file of candidates) {
    const path = `${id}/${file}`;
    try {
      const buffer = await downloadDesignImage(path);
      if (buffer?.length) {
        return {
          buffer,
          mimeType: sniffImageMime(buffer) || "application/octet-stream",
        };
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export function geminiImageErrorResponse(err) {
  const msg = String(err?.message || err || "");
  if (/403|PERMISSION_DENIED|denied access/i.test(msg)) {
    return {
      status: 502,
      error: "Google Gemini blocked this API key/project (403). Update GEMINI_API_KEY.",
    };
  }
  if (/404|NOT_FOUND|no longer available/i.test(msg)) {
    return {
      status: 502,
      error: "Image model not available for this key. Check GEMINI_IMAGE_MODEL.",
    };
  }
  if (/503|UNAVAILABLE|high demand/i.test(msg) || err?.status === 503) {
    return {
      status: 503,
      error: "Google's image model is busy right now. Wait a moment and try again.",
    };
  }
  return {
    status: 502,
    error: "Could not generate that garden image. Try again.",
  };
}
