import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveEstimateImageSource,
  prepareEstimateImage,
} from "../components/visualizer/imageUtils.ts";

// Browser globals are supplied by the browser in production.
for (const key of ["window", "document", "createImageBitmap"]) {
  Object.defineProperty(globalThis, key, {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

const origin = "https://www.unionparklandscape.com";
const media = "/api/design/media/12345678-1234-4234-8234-123456789abc/install";
const sample = "data:image/jpeg;base64,/9j/AA==";

test("saved design media and embedded images remain valid estimate sources", () => {
  assert.equal(resolveEstimateImageSource(media, origin), origin + media);
  assert.equal(
    resolveEstimateImageSource(origin + media, origin),
    origin + media,
  );
  assert.equal(resolveEstimateImageSource(sample, origin), sample);
  assert.equal(
    resolveEstimateImageSource(`blob:${origin}/photo`, origin),
    `blob:${origin}/photo`,
  );
});

test("rejects external, unexpected, redirected, and malformed image paths", () => {
  for (const url of [
    "https://example.com" + media,
    "//example.com/photo",
    "/api/admin",
    media + "?redirect=1",
    media + "#fragment",
    "/api/design/media/invalid/install",
    "data:text/html;base64,AAAA",
    "blob:https://example.com/photo",
  ]) {
    assert.throws(
      () => resolveEstimateImageSource(url, origin),
      undefined,
      url,
    );
  }
});

test("converts an authorized saved image to bounded JPEG data for the lead API", async (t) => {
  t.mock.property(globalThis, "window", { location: { origin } });
  t.mock.method(globalThis, "fetch", async (source, options) => {
    assert.equal(source, origin + media);
    assert.equal(options.redirect, "error");
    assert.equal(options.credentials, "same-origin");
    return new Response(new Blob(["test-image"], { type: "image/png" }));
  });
  let closed = false;
  t.mock.property(globalThis, "createImageBitmap", async () => ({
    width: 2400,
    height: 1800,
    close() {
      closed = true;
    },
  }));
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage() {} }),
    toDataURL: () => sample,
  };
  t.mock.property(globalThis, "document", { createElement: () => canvas });
  assert.equal(await prepareEstimateImage(media), sample);
  assert.equal(canvas.width, 1200);
  assert.equal(canvas.height, 900);
  assert.equal(closed, true);
});

test("fails clearly when saved media cannot be loaded", async (t) => {
  t.mock.property(globalThis, "window", { location: { origin } });
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 403 }),
  );
  await assert.rejects(prepareEstimateImage(media), /couldn’t load/);
  await assert.rejects(prepareEstimateImage(""), /not ready/);
});
