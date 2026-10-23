/** Client-side downscale + JPEG compression so uploads stay small and fast. */
export async function compressImage(
  file: File,
  maxDim = 1568,
  quality = 0.85,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (JPG, PNG, or WebP).");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("That photo is over 25MB — please choose a smaller one.");
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("We couldn't read that image — try a different photo.");
  });

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (dataUrl.length > 4 * 1024 * 1024) {
    // Extremely detailed photo — compress harder.
    return canvas.toDataURL("image/jpeg", 0.7);
  }
  return dataUrl;
}

/** Only retrieve images already shown by this site, never arbitrary remote URLs. */
export function resolveEstimateImageSource(
  source: string,
  origin: string,
): string {
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(source))
    return source;
  if (source.startsWith(`blob:${origin}/`)) return source;
  const url = new URL(source, origin);
  if (
    url.origin !== origin ||
    url.search ||
    url.hash ||
    !/^\/api\/design\/media\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(before|install|summer|bloom|night)$/i.test(
      url.pathname,
    )
  ) {
    throw new Error(
      "We couldn’t attach this design. Please reopen your saved design and try again.",
    );
  }
  return url.href;
}

/** Convert saved media URLs to the compact image data accepted by the lead API. */
export async function prepareEstimateImage(source: string): Promise<string> {
  if (!source)
    throw new Error(
      "Your design image is not ready yet. Please wait and try again.",
    );
  const safeSource = resolveEstimateImageSource(source, window.location.origin);
  const response = await fetch(safeSource, {
    credentials: "same-origin",
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(
      "We couldn’t load your saved design. Reopen it and try again, or call us for an estimate.",
    );
  const blob = await response.blob();
  const file = new File([blob], "yard.jpg", { type: blob.type });
  let data = await compressImage(file, 1200, 0.82);
  if (data.length > 1_700_000) data = await compressImage(file, 960, 0.65);
  if (data.length > 1_700_000)
    throw new Error(
      "The design is too large to attach. Please call us and we’ll help with your estimate.",
    );
  return data;
}
