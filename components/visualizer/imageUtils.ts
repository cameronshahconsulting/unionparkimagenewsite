/** Client-side downscale + JPEG compression so uploads stay small and fast. */
export async function compressImage(
  file: File,
  maxDim = 1568,
  quality = 0.85
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
