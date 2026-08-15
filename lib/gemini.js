import { GoogleGenAI } from "@google/genai";
import { PLANTS, DESIGNER_IN_STOCK_SKUS } from "./inventory";
import { ZONES } from "./garden-meta";
import { installLine, bloomLineFor, summerLineFor, paletteSummary } from "./plant-visuals";

/** Read at call time — avoids Next inlining a missing key at build/start. */
function geminiApiKey() {
  return String(process.env["GEMINI_API_KEY"] || "").trim();
}

function getAI() {
  const key = geminiApiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
}

export function geminiConfigured() {
  return Boolean(geminiApiKey());
}

/** Nano Banana 2 — yard render images. */
function imageModel() {
  return process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
}

/** Nano Banana — fallback when Nano Banana 2 is busy. */
function imageFallbackModel() {
  return process.env.GEMINI_IMAGE_FALLBACK_MODEL || "gemini-2.5-flash-image";
}

function planModel() {
  return process.env.GEMINI_PLAN_MODEL || "gemini-3-flash-preview";
}

function planFallbackModel() {
  return process.env.GEMINI_PLAN_FALLBACK_MODEL || "gemini-flash-latest";
}

function errorStatus(err) {
  const direct =
    err?.status ??
    err?.code ??
    err?.error?.code ??
    err?.response?.status ??
    null;
  if (direct) return direct;
  const msg = String(err?.message || err || "");
  const m = msg.match(/status:\s*(\d{3})/i) || msg.match(/"code"\s*:\s*(\d{3})/);
  return m ? Number(m[1]) : null;
}

function isRetryable(err) {
  const status = errorStatus(err);
  if (status === 404) return false;
  if (status === 503 || status === 429 || status === 500) return true;
  if (err?.name === "ServerError") return true;
  const msg = String(err?.message || err || "");
  if (/NOT_FOUND|no longer available/i.test(msg)) return false;
  return /UNAVAILABLE|high demand|RESOURCE_EXHAUSTED|rate.?limit|try again/i.test(msg);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class GeminiTimeoutError extends Error {
  constructor(label, ms) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "GeminiTimeoutError";
  }
}

/**
 * Bound a single Gemini attempt so a stalled connection can't hang forever.
 * The @google/genai SDK has no built-in request timeout — without this, a
 * connection that never resolves or rejects blocks the whole route (and the
 * customer's browser) indefinitely instead of failing and retrying. This is
 * the root cause behind generations that appeared "stuck" for 10+ minutes.
 */
function withTimeout(fn, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new GeminiTimeoutError(label, ms)), ms);
    fn().then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** Retry transient Gemini failures (503 high demand, 429, 500, and now timeouts). */
async function withRetry(fn, { retries = 4, baseMs = 1000, label = "gemini", timeoutMs = 45000 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await withTimeout(() => fn(i), timeoutMs, `${label} attempt ${i + 1}`);
    } catch (err) {
      lastErr = err;
      const retryable = err instanceof GeminiTimeoutError || isRetryable(err);
      if (!retryable || i === retries) throw err;
      const delay = baseMs * 2 ** i + Math.random() * 250;
      console.warn(
        `${label} retry ${i + 1}/${retries} after ${Math.round(delay)}ms`,
        err instanceof GeminiTimeoutError ? "timeout" : errorStatus(err) || err?.message
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function generateImageContent(contents) {
  const primary = imageModel();
  const fallback = imageFallbackModel();
  return withRetry(
    async (attempt) => {
      const useFallback = attempt >= 1 && fallback && fallback !== primary;
      const model = useFallback ? fallback : primary;
      if (useFallback) {
        console.warn(`gemini image fallback model: ${fallback} (attempt ${attempt + 1})`);
      }
      return getAI().models.generateContent({
        model,
        contents,
        config: { responseModalities: ["TEXT", "IMAGE"] },
      });
    },
    // retries lowered from 6→3 now that each attempt is individually capped at
    // 45s — worst case ~190s total, safely inside the route's 300s ceiling.
    { retries: 3, baseMs: 1500, label: "gemini image", timeoutMs: 45000 }
  );
}

async function generateTextContent(args) {
  const primary = args.model || planModel();
  const fallback = planFallbackModel();
  const models = [primary];
  if (fallback && fallback !== primary) models.push(fallback);

  let lastErr;
  for (const model of models) {
    try {
      if (model !== primary) console.warn(`gemini text fallback model: ${model}`);
      return await withRetry(
        () => getAI().models.generateContent({ ...args, model }),
        { retries: 2, baseMs: 800, label: `gemini text (${model})`, timeoutMs: 30000 }
      );
    } catch (err) {
      lastErr = err;
      const status = errorStatus(err);
      if (status === 503 || status === 429 || status === 404 || status === 500) continue;
      throw err;
    }
  }
  throw lastErr;
}

function asInline(image) {
  if (!image) return null;
  if (typeof image === "string") {
    return { inlineData: { mimeType: "image/jpeg", data: image } };
  }
  return { inlineData: { mimeType: image.mimeType || "image/jpeg", data: image.base64 || image.data } };
}

function catalogFromSkus(skus) {
  const allow = skus?.length ? skus : DESIGNER_IN_STOCK_SKUS;
  return PLANTS.filter((p) => allow.includes(p.sku)).map((p) => ({
    sku: p.sku,
    name: p.name,
    size: p.size,
    cat: p.cat,
    bloom: p.bloom || "",
    sun: p.sun || "",
    price: p.price,
  }));
}

function firstImagePart(res, label = "gemini image") {
  const candidate = res?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (img?.inlineData?.data) {
    return { base64: img.inlineData.data, mimeType: img.inlineData.mimeType || "image/png" };
  }
  const finishReason = candidate?.finishReason || "unknown";
  const partKinds = parts.map((p) =>
    p.inlineData ? "inlineData" : p.text ? "text" : Object.keys(p).join(",") || "empty"
  );
  const textPreview = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 160);
  console.error(`${label} returned no image`, { finishReason, partKinds, textPreview });
  throw new Error(`${label} returned no image (${finishReason})`);
}

/* ------------------------------------------------------------------ *
 * STAGE PROMPTS — the accuracy layer.
 * Four consistent frames of the SAME bed in the SAME place in frame:
 *   install → honest day-of-planting
 *   summer  → first summer, filling in
 *   bloom   → 2–3 seasons later, full glory
 * ------------------------------------------------------------------ */

const PRESERVE = `HARD CONSTRAINTS — break any of these and the render is unusable:
- Keep the existing house, deck, patio, porch, pergola, walls, fence, driveway, path, lawn, and any existing mature trees EXACTLY as in the photo — same colours, materials, positions, and full extent (do not crop, shrink, or shorten any of these structures to make room for the new bed).
- Keep every OTHER existing shrub, hedge, foundation planting, and retaining wall — anywhere else in the yard, not just near the house — EXACTLY as in the photo too: same size, same shape, same foliage, same position. These are not part of this order; do not grow, thicken, trim, replace, or otherwise touch them.
- Keep the EXACT same camera: angle, height, perspective, framing, crop, and lens. Do NOT zoom, pan, tilt, recompose, or change aspect ratio.
- Keep the same time of day, weather, sun direction, and shadows as the original photo.
- Do NOT add people, animals, vehicles, furniture, pots, signage, text, watermarks, or logos.
- Only change plant growth / foliage / bloom INSIDE the one locked planting bed described below. Everything else in the frame — including other existing landscaping — stays identical pixel-for-pixel.`;

const CAMERA_LOCK = `CAMERA LOCK (critical — do not recompose or zoom the shot):
- Frame this EXACTLY as Image 1: identical crop, identical zoom level, identical amount of house/sky/lawn visible at identical size and position in frame.
- Do NOT zoom in on the bed, crop in tighter, dolly closer, or otherwise fill more of the frame with the plants than Image 1 does. This is a growth edit of the plants only — the camera did not move.
- If Image 1 shows the whole house, your output must show the whole house, the same size, in the same place. If the treeline, driveway, or sky is visible at the top/edges of Image 1, it must still be visible there in your output.`;

const LAYOUT_LOCK = `LAYOUT LOCK (critical — the bed must not drift between frames):
- The planting bed must occupy the SAME place in the frame in every stage — same edges, same corners, same distance from house/fence/path.
- Do NOT move the bed left/right/up/down. Do NOT reshape, widen, round, straighten, or resize the bed outline.
- Do NOT invent a second bed or plant a different area of the yard.
- ONE BED TOTAL, EVERYWHERE ELSE STAYS BARE: this design has exactly one planting bed — the one already established in Image 1. Do NOT add a second bed anywhere else in the frame for ANY reason, including to "balance" or mirror the composition on the opposite side of steps, a walkway, a doorway, or other symmetrical feature. Every other patch of lawn, mulch, gravel, or bare ground that is not already part of Image 1's locked bed must stay pixel-identical to Image 1 there — same grass, same bare ground, nothing planted, no matter how natural a spot it looks like for a garden.
- Plant positions stay fixed; only plant SIZE and fullness change over time.
- When Image 1 is an already-planted stage (install day or later), Image 1's bed outline and plant layout are the locked geometric truth — grow plants in place on THAT bed. Never reshape Image 1's bed to match grass, mulch, or a different outline in the original yard photo.
- RESIST THE URGE TO "FINISH" THE YARD: you may be tempted to add plantings elsewhere in the frame because the result would look more complete, more professionally landscaped, or more symmetrical. Do not act on that. This customer paid for ONE bed only — a result with any planting anywhere else is wrong and unusable, even if it looks better. A photo with large stretches of plain, empty lawn or bare hardscape next to a lush bed is the CORRECT, expected result. Never add landscaping "for free" that wasn't ordered.`;

const NO_INVENT = `NO INVENTED PLANTS (critical — the plant list below is the ENTIRE order, nothing else may bloom or grow):
- The numbered list below is the complete, exact set of plants the customer is buying. Do not add, substitute, or imagine any species, colour, or bloom beyond it.
- If a shrub, tree, or plant was already in the photo and is NOT in the list below, it is being kept as-is, not replanted — render it exactly as it appears in the prior-stage image: same foliage, same size, no new flowers or colour added to it, even at "full glory".
- Every flower or bloom visible in the output must trace back to one of the listed plants, in its listed spot.`;

const PLANT_IDENTITY_LOCK = `PLANT IDENTITY LOCK (critical — this is a growth edit, not a repaint):
- Every individual plant already visible in the prior-stage image is the SAME individual plant in this stage — same species, same foliage shape/colour, same flower colour, same exact spot in the bed. It only gets larger/fuller/more in bloom.
- Do NOT swap which plant occupies which position, do NOT re-assign the plant list to different specimens than what's already rendered, and do NOT change a plant's species or bloom colour partway through the sequence.
- Match the prior-stage image plant-for-plant, left to right, before applying any growth.`;

const NIGHT_LOCK = `NIGHT CONVERSION (critical — this is a time-of-day/lighting edit only, NOT a growth edit):
- Keep the EXACT same camera, framing, house, fence, driveway, path, lawn, and the full planting bed from Image 1 — same plants, same size, same positions, same bed shape. Do not regrow, shrink, add, remove, or rearrange any plant.
- Convert the scene to early evening, just after dusk: dark blue-black sky, no sun, natural dusk ambient light.
- Add realistic, tasteful low-voltage landscape lighting: warm-white path lights along the walkway or bed edge if one is visible, soft uplighting on one to three of the larger shrubs or trees in the bed, and the porch/entry light glowing at the front door. Warm colour temperature (2700–3000K) — not blue, not coloured, not neon.
- Do NOT add string lights, holiday lights, floodlights on the house facade, or any fixture that wouldn't realistically be part of a residential landscape lighting install.
- Any visible windows show soft warm interior light glowing through them.
- Photorealistic dusk photography — not an illustration, not overexposed, and not simply a daytime photo with a dark filter over it; real light sources cast real glow and soft shadows.`;

/** Bed copy for later stages — never suggest reshaping to a abstract "rectangle". */
function bedFootprintCopy(stage, { sqFt, shape, style }) {
  if (stage === "install") {
    return `Bed: about ${sqFt} sq ft, ${shape} shape, ${style} style, Delaware Zone 7.`;
  }
  return `Bed footprint: copy Image 1's planting bed EXACTLY (same outline/edges — do not redesign to a ${shape} or any other new shape). About ${sqFt} sq ft intended, ${style} style, Delaware Zone 7.`;
}

function formatBedBox(bedBox) {
  if (!bedBox || typeof bedBox !== "object") return "";
  const x = Math.round(Number(bedBox.x));
  const y = Math.round(Number(bedBox.y));
  const w = Math.round(Number(bedBox.w));
  const h = Math.round(Number(bedBox.h));
  if (![x, y, w, h].every((n) => Number.isFinite(n))) return "";
  return `LOCKED BED REGION in this photo (percent of frame): left ${x}%, top ${y}%, width ${w}%, height ${h}%. Plant ONLY inside this rectangle. Do not plant outside it. Do not shift this rectangle.`;
}

function planLines(plants, stage) {
  const fn =
    stage === "bloom" ? bloomLineFor : stage === "summer" ? summerLineFor : installLine;
  return plants.slice(0, 16).map((p) => `- ${fn(p)}`).join("\n");
}

/**
 * Build the image-edit prompt for a given stage.
 * `sceneNotes` / `bedBox` come from the plan model reading the actual photo.
 */
export function buildStagePrompt({
  stage,
  plants = [],
  sceneNotes = "",
  bedBox = null,
  sqFt = 200,
  shape = "rectangle",
  style = "Cottage",
  description = "",
  wantWalkway = false,
  keepExisting = false,
}) {
  const scene = sceneNotes ? `\nWhat's in the customer's photo (preserve exactly outside the bed): ${sceneNotes}\n` : "";
  // bedBox is in original-photo coordinates. On install it guides placement; on
  // summer/bloom Image 1 already has the locked planted bed — repeating a
  // rectangle can fight that outline and reshape it. Skip it after install.
  const bedRegion = formatBedBox(bedBox);
  const bedLock = stage === "install" && bedRegion ? `\n${bedRegion}\n` : "";
  const walkway = wantWalkway
    ? "If a walkway is included, keep it in the SAME place as in Image 1 (the planted prior stage)."
    : "No walkway — planting bed only.";
  const wish = description
    ? `\nCustomer's wish (mood/colour only — do not relocate or reshape the bed for this): "${description}"`
    : "";
  const bed = bedFootprintCopy(stage, { sqFt, shape, style });
  const preserveExisting = keepExisting
    ? `\nKEEP EXISTING PLANTS/BED (critical — the customer asked to design ON TOP of what's already there, not replace it): Do NOT clear, remove, dig up, or replace anything already planted or established in the locked bed region — every existing plant, shrub, or bed edge stays exactly as it appears in the photo, same size, same spot. Add the NEW plants listed below only into genuinely bare/open ground within the region, working around the existing plantings. If the region already looks fully planted, add new plants sparingly at its edges rather than displacing anything established.\n`
    : "";

  if (stage === "night") {
    return `Photorealistic lighting / time-of-day edit of Image 1 (this exact garden, already in full bloom — unchanged).

This is NOT a growth edit. Every plant, the bed shape and edges, the house, fence, driveway, and camera framing stay pixel-identical to Image 1. Only the time of day and lighting change.

${NIGHT_LOCK}
Output only the finished photograph — same framing, same garden as Image 1, now at dusk with the landscape lighting on.`;
  }

  if (stage === "bloom") {
    return `Photorealistic IN-PLACE GROWTH edit of Image 1 (INSTALL DAY of this exact garden).

IMAGE ROLES:
- Image 1 = INSTALL DAY — the ONLY camera/framing reference. LOCKED bed outline, bed shape, plant positions, and what was planted. Grow plants IN PLACE on this bed, in this exact frame.
- Next image (if present) = FIRST SUMMER of this garden — maturity reference ONLY, not a camera reference. Your output MUST look CLEARLY fuller, denser, and more in bloom than it, while keeping Image 1's exact camera and bed geometry.
- Last image (if present) = the customer's REAL, unedited yard photo — content ground truth only, not a camera reference. Wherever it shows plain bare lawn or hardscape, that area must stay plain and bare in your output too.

Show FULL GLORY (2 to 3 growing seasons later) at peak — lush, full, and in bloom.

CRITICAL MATURITY ORDER (never reverse this):
- Surpass Image 2 in canopy fill, flower cover, and closed mulch gaps.
- Do NOT return a garden that looks like first summer or install day.

CRITICAL BED SHAPE:
- Copy Image 1's bed edges pixel-faithfully. Do not square it off, curve it differently, enlarge it, or plant a new area.

${PRESERVE}
${CAMERA_LOCK}
${LAYOUT_LOCK}
${NO_INVENT}
${PLANT_IDENTITY_LOCK}
${scene}${bedLock}${bed}
Grow ONLY these listed plants further toward maturity, each IN ITS CURRENT SPOT from Image 1 — do not move, add, remove, or rearrange plants, and do not give bloom or new growth to anything not on this list:
${planLines(plants, "bloom")}
MAINTAINED LANDSCAPE SCALE: within that ONE bed only — full and well-filled with minimal bare mulch, plants neatly touching at trimmed edges; natural flower colours. Magazine-quality bed, ordinary/untouched everywhere else in frame — Image 1's bed footprint and camera.${wish}
${walkway}
Output only the finished photograph — same framing and camera as Image 1.`;
  }

  if (stage === "summer") {
    return `Photorealistic IN-PLACE GROWTH edit of Image 1 (INSTALL DAY of this exact garden).

IMAGE ROLES:
- Image 1 = INSTALL DAY — the ONLY camera/framing reference. LOCKED bed outline, bed shape, plant positions. Grow plants IN PLACE, in this exact frame; do not redesign the bed.
- Last image (if present) = the customer's REAL, unedited yard photo — content ground truth only, not a camera reference. Wherever it shows plain bare lawn or hardscape, that area must stay plain and bare in your output too.

Show FIRST SUMMER only — plants filling out, NOT full mature size, NOT "full glory."

CRITICAL — KEEP THIS FRAME YOUNGER THAN FULL GLORY:
- About half to two-thirds of mature landscape size. Mulch still visibly showing between many plants.
- Light / early flowering is fine; do NOT carpet the bed in peak bloom.

CRITICAL BED SHAPE:
- Copy Image 1's bed edges exactly. Do not reshape, relocate, or invent a new planting area.

${PRESERVE}
${CAMERA_LOCK}
${LAYOUT_LOCK}
${NO_INVENT}
${PLANT_IDENTITY_LOCK}
${scene}${bedLock}${bed}
Grow ONLY these listed plants partway, each IN ITS CURRENT SPOT from Image 1 — do not move, add, remove, or rearrange plants, and do not give bloom or new growth to anything not on this list:
${planLines(plants, "summer")}
Honest first-summer growth — Image 1's bed edges and plant layout.${wish}
${walkway}
Output only the finished photograph — same framing and camera as Image 1.`;
  }

  return `Photorealistic edit of the customer's real yard photo (Image 1). Any later images are inspiration for colour/mood ONLY — never copy their camera angle or bed location.

Plant the new garden on INSTALL DAY — freshly planted nursery stock, honest and true to size — in the locked bed region only.

${PRESERVE}
${LAYOUT_LOCK}
${NO_INVENT}
${preserveExisting}${scene}${bedLock}${bed}
Plant ONLY this exact nursery stock at real just-delivered size (small young plants, visible spacing, fresh dark mulch — NOT overgrown):
${planLines(plants, "install")}
Tidy fresh mulch, young plants correctly spaced for mature size (honest gaps), crisp bed edge. Believable, not exaggerated. The bed must sit exactly where described above relative to house/path/fence.${wish}
${walkway}
Natural daylight matching the original photo. Output only the finished photograph — same framing as the customer's photo.`;
}

/** Local fallback prompt builder when the plan model is unavailable. */
export function buildFallbackStagePrompt(stage, opts) {
  return buildStagePrompt({ stage, ...opts });
}

/* CALL A — read the photo, plan plants, describe the scene. */
export async function planDesign({
  areaImage,
  inspoImages = [],
  description,
  style,
  sqFt,
  shape,
  wantWalkway = false,
  keepExisting = false,
  allowedSkus,
}) {
  const catalog = catalogFromSkus(allowedSkus);
  const skuEnum = catalog.map((c) => c.sku);
  if (!skuEnum.length) throw new Error("No plants available for this garden.");

  const walkwayNote = wantWalkway
    ? "The customer also wants a walkway (pavers, flagstone, or mulch path). Leave room for it and place low plants along its edges."
    : "No walkway requested — focus on the planting bed only.";

  const keepExistingNote = keepExisting
    ? "The customer wants to KEEP their existing plants/bed and design ONLY around what's already there — do not plan replacements for anything already established and healthy-looking in the photo. In \"sceneNotes\", explicitly call out which existing plants/shrubs/beds must be preserved as-is. Only plan NEW plants for genuinely bare/open ground, and scale quantities down accordingly — this is an addition to an existing bed, not a full replant."
    : "";

  const parts = [
    {
      text: `You are a professional landscape designer for a Delaware (Zone 7) nursery.

Look closely at the customer's yard photo. Design a ${style || "Cottage"} planting for the bed — about ${sqFt} square feet, ${shape} shape.
Use ONLY plants from this in-stock catalog:
${JSON.stringify(catalog)}
Customer request: "${description || "a beautiful, low-maintenance planting"}".
${walkwayNote}${keepExistingNote ? `\n${keepExistingNote}` : ""}

Return:
1. "plants": quantities scaled to the square footage (more perennials/grasses in larger beds; only a few specimen trees; group in odd numbers). Assign each a zone: back (tall/structure), mid, front (low), or edge (border).
2. "sceneNotes": 2–3 sentences describing what is actually in the photo that MUST be preserved — house/wall colour and style, deck/patio/porch if present, fence, driveway or path, existing trees, camera angle, lighting/time of day, AND exactly where the planting bed sits relative to those landmarks (e.g. "along the foundation left of the front steps, between the walkway and the house").
3. "designSummary": one warm, plain-English sentence a homeowner would love, describing the finished garden (mention the main colours and feel). No jargon.
4. "bedBox": where the new planting bed will sit IN THIS PHOTO, as percentages of the image (x and y are the top-left corner, 0–100 from the left and top edges). Be precise — later AI renders MUST plant only inside this box so the bed never drifts. Prefer the actual empty bed / planting strip in the photo over inventing a new spot. The box must sit entirely on open lawn or existing bare bed — it must NOT overlap any deck, patio, porch, steps, driveway, or other structure, even partially. If unsure, give a smaller, safely-clear box rather than one that risks touching a structure.`,
    },
  ];
  const area = asInline(areaImage);
  if (area) parts.push(area);
  inspoImages.forEach((d) => {
    const p = asInline(d);
    if (p) parts.push(p);
  });

  const res = await generateTextContent({
    model: planModel(),
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          sceneNotes: { type: "string" },
          designSummary: { type: "string" },
          bedBox: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
            },
            required: ["x", "y", "w", "h"],
          },
          plants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string", enum: skuEnum },
                qty: { type: "integer" },
                zone: { type: "string", enum: ZONES },
              },
              required: ["sku", "qty", "zone"],
            },
          },
        },
        required: ["plants"],
      },
    },
  });
  const plan = JSON.parse(res.text);
  plan.plants = (plan.plants || []).filter((p) => skuEnum.includes(p.sku));
  plan.sceneNotes = String(plan.sceneNotes || "").slice(0, 600);
  plan.designSummary = String(plan.designSummary || "").slice(0, 400);
  plan.bedBox = sanitizeBedBox(plan.bedBox);
  return plan;
}

/** Default bed region when the model declines or returns nonsense: lower-centre. */
export const DEFAULT_BED_BOX = { x: 10, y: 55, w: 80, h: 36 };

/** Clamp the model's bed rectangle to something that can actually hold pins. */
export function sanitizeBedBox(box) {
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const x = num(box?.x);
  const y = num(box?.y);
  const w = num(box?.w);
  const h = num(box?.h);
  if (x === null || y === null || w === null || h === null) return { ...DEFAULT_BED_BOX };
  // Too small to tap, or effectively the whole frame — neither is useful.
  if (w < 12 || h < 8 || w > 100 || h > 100) return { ...DEFAULT_BED_BOX };
  const cx = Math.max(0, Math.min(96, x));
  const cy = Math.max(0, Math.min(96, y));
  return {
    x: cx,
    y: cy,
    w: Math.max(12, Math.min(100 - cx, w)),
    h: Math.max(8, Math.min(100 - cy, h)),
  };
}

/* CALL B — install-day photo, edited from the customer's real yard photo. */
export async function renderInstall({ areaImage, inspoImages = [], prompt }) {
  if (!areaImage) return null;
  const parts = [{ text: prompt }, asInline(areaImage)];
  inspoImages.forEach((d) => {
    const p = asInline(d);
    if (p) parts.push(p);
  });
  const res = await generateImageContent([{ role: "user", parts }]);
  return firstImagePart(res, "renderInstall");
}

/**
 * Shared chained edit: grow from a planted prior stage (install). A
 * SINGLE-image edit for CAMERA purposes — the prior-stage image is the only
 * thing that controls framing/crop/zoom (see CAMERA_LOCK). The original yard
 * photo (areaImage) used to be sent as a competing camera reference every
 * time; handing the model two photos of the same yard with different content
 * (one bare, one planted) made it recompose the shot — it would zoom into the
 * bed and lose the wider framing, since it had two compositions to reconcile.
 * Dropping it fixed that drift, but it also removed the only unretouched,
 * non-generated photo the model ever saw for summer/bloom — with nothing
 * photographic to check against, "don't invent a bed elsewhere" became a
 * purely textual rule the model started ignoring (see the phantom
 * mirrored-bed bug this file's history documents). So areaImage comes back
 * here, but strictly demoted to bare-ground content reference, sent last and
 * explicitly told it is NOT a camera reference — CAMERA_LOCK + Image 1 alone
 * still own framing.
 */
async function renderFromPrior({ priorImage, areaImage, growthRefImage, prompt, label }) {
  const base = priorImage || areaImage;
  if (!base) return null;
  const parts = [{ text: prompt }, asInline(base)];
  if (growthRefImage) {
    parts.push({
      text:
        "Image 2 is a mid-growth stage of this SAME planted bed (first summer). Use it ONLY as a maturity floor — how full these plants already were. Your output must look clearly MORE grown and more in bloom than Image 2. Ignore any framing difference in Image 2; keep Image 1's exact camera and bed geometry. Image 1 is the ONLY source of truth for WHERE the bed is: if Image 2 shows any planted area, bed, or mulch that is not present in Image 1, that is a rendering mistake in Image 2 — do not copy it. Anywhere Image 1 shows bare grass or hardscape, your output must also show bare grass or hardscape there, even if Image 2 shows plants there.",
    });
    parts.push(asInline(growthRefImage));
  }
  if (priorImage && areaImage) {
    parts.push({
      text:
        "One more image follows: the customer's ORIGINAL, real, unedited photo of this yard, taken before any of this design existed. This is NOT a camera or framing reference — ignore any difference in crop, zoom, or angle between it and Image 1; Image 1 alone controls framing. Its only purpose is ground truth for what is REAL: wherever this real photo shows plain lawn, mulch-free ground, or bare hardscape, your output must show that exact area as plain and unplanted too, no matter what any AI-generated image in this request suggests. If you're about to add or grow plants somewhere that this real photo shows as bare and outside the described bed, stop — that area stays bare.",
    });
    parts.push(asInline(areaImage));
  }
  const res = await generateImageContent([{ role: "user", parts }]);
  return firstImagePart(res, label);
}

/* CALL C — first summer, matured partway from the install image. */
export async function renderSummer({ installImage, areaImage, prompt }) {
  return renderFromPrior({
    priorImage: installImage,
    areaImage,
    prompt,
    label: "renderSummer",
  });
}

/*
 * CALL D — full-bloom. Base on INSTALL for bed/layout lock (one hop from a
 * good frame). Pass summer as Image 2 so glory must exceed first-summer
 * fullness — avoids both bed drift (from chaining summer→bloom) and the
 * summer/glory maturity swap (from independent install→bloom regenerations).
 */
export async function renderBloom({ summerImage, installImage, areaImage, prompt }) {
  return renderFromPrior({
    priorImage: installImage || summerImage,
    growthRefImage: installImage && summerImage ? summerImage : null,
    areaImage,
    prompt,
    label: "renderBloom",
  });
}

/*
 * CALL E — night lighting. Single-image lighting/time-of-day conversion of
 * the full-glory photo only — no plant list, no growth, no bed changes, so it
 * doesn't go through renderFromPrior's growth-reference plumbing.
 */
export async function renderNight({ bloomImage, prompt }) {
  if (!bloomImage) return null;
  const parts = [{ text: prompt }, asInline(bloomImage)];
  const res = await generateImageContent([{ role: "user", parts }]);
  return firstImagePart(res, "renderNight");
}

/*
 * CALL F — locate "tap for plants" pins on the ACTUAL bloom photo, once it
 * exists. hotspotsFor() (garden-plan.js) places pins by formula against the
 * pre-render bedBox estimate — close enough for the bed's rough outline, but
 * the image model doesn't lay plants out in a perfect grid, so formula pins
 * routinely land on mulch or the wrong plant. Grounding pins in the real
 * pixels the same way bedBox is grounded in the real photo (planDesign) fixes
 * that at the source instead of tuning the formula further.
 */
export async function locateHotspots({ bloomImage, plants = [] }) {
  if (!bloomImage || !plants.length) return null;
  const list = plants.map((p) => `${p.sku} — ${p.qty}× ${p.name}`).join("\n");
  const parts = [
    {
      text: `Look at this photo of a finished garden bed. For each plant below, find where it actually appears in THIS photo and give its centre point as a percentage of the image (x = 0–100 from the left edge, y = 0–100 from the top edge). Point at the plant itself — never at bare mulch, grass, or hardscape. If a plant appears in more than one clump, pick its single most visually prominent clump.

Plants:
${list}`,
    },
    asInline(bloomImage),
  ];
  const res = await generateTextContent({
    model: planModel(),
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          pins: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sku: { type: "string" },
                x: { type: "number" },
                y: { type: "number" },
              },
              required: ["sku", "x", "y"],
            },
          },
        },
        required: ["pins"],
      },
    },
  });
  const parsed = JSON.parse(res.text);
  return (parsed.pins || [])
    .filter((p) => p?.sku && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
    .map((p) => ({
      sku: p.sku,
      x: Math.round(Math.min(96, Math.max(4, Number(p.x))) * 10) / 10,
      y: Math.round(Math.min(94, Math.max(6, Number(p.y))) * 10) / 10,
    }));
}

/** Enhance a short customer description into a richer planting brief (used server-side). */
export async function enhancePrompt({ description, gardenTitle, gardenSeed, sqFt, shape, wantWalkway = false }) {
  const parts = [
    {
      text: `Rewrite this customer's short garden request into a clear, vivid 2–3 sentence planting brief for a Delaware Zone 7 nursery.
Keep their intent. Mention approximate size (${sqFt} sq ft, ${shape} bed).
${wantWalkway ? "They want a walkway through or beside the bed — mention it." : ""}
${gardenTitle ? `Garden template: ${gardenTitle}.` : ""}
${gardenSeed ? `Template guidance: ${gardenSeed}` : ""}
Do not invent plant Latin names they didn't imply. No markdown, no bullet lists — plain paragraphs only.

Customer wrote: "${description}"`,
    },
  ];
  const res = await generateTextContent({
    model: planModel(),
    contents: [{ role: "user", parts }],
  });
  return String(res.text || "").trim();
}

export { paletteSummary };
