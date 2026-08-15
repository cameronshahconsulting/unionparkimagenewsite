import { createHash } from "crypto";
import { supabaseAdmin } from "./supabase";
import { STYLES, BED_SHAPES } from "./design-constants";
import { normalizeShape } from "./garden-plan";

export { STYLES };

const MAX_BODY_BYTES = 6 * 1024 * 1024;
const MAX_INSPO = 4;
const MAX_DESC = 1200;

/** One free design generation = one plan + its install & bloom images. */
export const WEEKLY_LIMIT = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const MIN_BUDGET = 50;
// $20k ceiling, not $100k — a 1,500 sq ft bed (our own max area) tops out
// around $7-8k even densely planted, so this stays a generous headroom for a
// real large project without pairing a tiny declared area with an absurd
// budget the plan could never actually spend (scaleGardenPlan sizes plant
// COUNT off sqFt, not budget, so budget can only ever trim a plan down — but
// an unbounded number here was still a real gap, not just a display issue).
const MAX_BUDGET = 20000;

const MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

function saltedHash(value) {
  const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-salt";
  return createHash("sha256").update(`${salt}:${value ?? "unknown"}`).digest("hex");
}

/** Hash client IP with a salt so raw IPs are never stored. */
export function hashIp(ip) {
  return saltedHash(ip || "unknown");
}

export function clientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}

export function isValidEmail(raw) {
  const e = normalizeEmail(raw);
  return e.length >= 5 && e.length <= 254 && EMAIL_RE.test(e);
}

/** Stable hash of an email for quota lookups (raw email stored separately as a lead). */
export function hashEmail(email) {
  return saltedHash(normalizeEmail(email));
}

function sniffMime(buf) {
  if (buf.length < 12) return null;
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

function decodeBase64Image(b64) {
  if (typeof b64 !== "string" || !b64.length) {
    return { error: "Missing image data." };
  }
  const raw = b64.includes(",") ? b64.split(",").pop() : b64;
  let buf;
  try {
    buf = Buffer.from(raw, "base64");
  } catch {
    return { error: "Invalid image encoding." };
  }
  if (!buf.length || buf.length > MAX_BODY_BYTES) {
    return { error: "Image is too large (max 6MB after resize)." };
  }
  const mimeType = sniffMime(buf);
  if (!mimeType) {
    return { error: "Only JPEG, PNG, or WebP images are allowed." };
  }
  return { buffer: buf, base64: raw, mimeType };
}

// Matches the Designer UI's slider ceiling (X-Large preset) — this is a
// garden-bed sizer, not a full-acreage landscaping tool, and the plant-count
// math in scaleGardenPlan assumes a bed-scale area.
function parseSqFt(raw) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 25 || n > 1500) {
    return { error: "Enter a garden size between 25 and 1,500 sq ft." };
  }
  return { sqFt: n };
}

/** Budget is optional; when present it clamps to a sensible range. */
function parseBudget(raw) {
  if (raw === undefined || raw === null || raw === "") return { budget: null };
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n <= 0) return { budget: null };
  return { budget: Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, n)) };
}

/**
 * Validate design request body. Yard photo required (before / install / bloom).
 * Garden slug + sqFt + budget drive the planting plan.
 */
export function validateDesignInput(body, { requirePhoto = true } = {}) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  let areaImage = null;
  if (body.areaImage) {
    const area = decodeBase64Image(body.areaImage);
    if (area.error) return { ok: false, error: area.error };
    areaImage = { base64: area.base64, mimeType: area.mimeType, buffer: area.buffer };
  } else if (requirePhoto) {
    return { ok: false, error: "Upload a photo of your yard first." };
  }

  const inspoRaw = Array.isArray(body.inspoImages) ? body.inspoImages : [];
  if (inspoRaw.length > MAX_INSPO) {
    return { ok: false, error: `At most ${MAX_INSPO} inspiration images.` };
  }
  const inspoImages = [];
  for (const img of inspoRaw) {
    const decoded = decodeBase64Image(img);
    if (decoded.error) return { ok: false, error: `Inspiration image: ${decoded.error}` };
    inspoImages.push({ base64: decoded.base64, mimeType: decoded.mimeType, buffer: decoded.buffer });
  }

  const description = String(body.description || "").slice(0, MAX_DESC);
  const style = String(body.style || "Cottage");
  if (style && !STYLES.includes(style)) {
    return { ok: false, error: `Style must be one of: ${STYLES.join(", ")}.` };
  }

  const sq = parseSqFt(body.sqFt ?? 200);
  if (sq.error) return { ok: false, error: sq.error };

  const { budget } = parseBudget(body.budget);
  const gardenSlug = String(body.gardenSlug || "").trim() || null;
  const shape = normalizeShape(body.shape);
  const shapeOk = BED_SHAPES.some((s) => s.key === shape);
  if (!shapeOk) return { ok: false, error: "Choose a valid bed shape." };

  const wantWalkway = Boolean(body.wantWalkway);
  const keepExisting = Boolean(body.keepExisting);

  return {
    ok: true,
    data: {
      areaImage,
      inspoImages,
      description,
      style,
      sqFt: sq.sqFt,
      budget,
      gardenSlug,
      shape,
      wantWalkway,
      keepExisting,
    },
  };
}

export function validateEnhanceInput(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }
  const description = String(body.description || "").trim().slice(0, MAX_DESC);
  if (description.length < 8) {
    return { ok: false, error: "Write a short description first (at least a sentence)." };
  }
  const sq = parseSqFt(body.sqFt ?? 200);
  if (sq.error) return { ok: false, error: sq.error };
  const gardenSlug = String(body.gardenSlug || "").trim() || null;
  const shape = normalizeShape(body.shape);
  const wantWalkway = Boolean(body.wantWalkway);
  return {
    ok: true,
    data: { description, sqFt: sq.sqFt, gardenSlug, shape, wantWalkway },
  };
}

function supaConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function isProd() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

/** True when Postgres/PostgREST is telling us design_generations doesn't exist. */
function isMissingTable(error) {
  const code = String(error?.code || "");
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") return true;
  const msg = `${error?.message || ""} ${error?.hint || ""}`;
  return /could not find the table|does not exist|schema cache/i.test(msg);
}

/**
 * Count rows matching a filter.
 *
 * Deliberately NOT a `head: true` request. PostgREST answers HEAD with an empty
 * body, so a missing table comes back as `{ count: null, error: null }` — the
 * error is invisible and `count ?? 0` silently reads as "zero rows", which
 * quietly disables the quota and makes every ownership check fail. Asking for
 * one real row costs nothing and surfaces the actual PostgREST error.
 *
 * Returns { count, error, unavailable }.
 */
async function countRows(admin, table, applyFilters) {
  const query = applyFilters(admin.from(table).select("id", { count: "exact" }).limit(1));
  const { data, count, error } = await query;
  if (error) return { count: null, error, unavailable: true };
  // No error but no count either — treat as "cannot verify", never as zero.
  if (count === null || count === undefined) {
    return { count: null, error: null, unavailable: !Array.isArray(data) };
  }
  return { count, error: null, unavailable: false };
}

let warnedMissingTable = false;

/** Loud one-time console hint — the fix is always "run supabase/schema.sql". */
function warnSetup(where, error) {
  if (isMissingTable(error)) {
    if (!warnedMissingTable) {
      warnedMissingTable = true;
      console.warn(
        "\n[designer] Supabase table `design_generations` is missing.\n" +
          "  → Run supabase/schema.sql in the Supabase SQL editor to enable the weekly email gate.\n" +
          "  → Until then the designer still generates locally, but quota is NOT enforced.\n"
      );
    }
    return;
  }
  console.error(where, error);
}

/**
 * Weekly quota keyed by email. Counts design generations in the last 7 days.
 * Fail-closed in production if Supabase errors; open in dev / when unconfigured.
 */
export async function checkWeeklyQuota(emailHash) {
  const open = { allowed: true, used: 0, remaining: WEEKLY_LIMIT, limit: WEEKLY_LIMIT };
  const closed = {
    allowed: false,
    used: WEEKLY_LIMIT,
    remaining: 0,
    limit: WEEKLY_LIMIT,
    error: "The designer is temporarily unavailable. Please try again shortly.",
  };
  if (!supaConfigured()) return open;
  try {
    const admin = supabaseAdmin();
    const since = new Date(Date.now() - WEEK_MS).toISOString();
    const { count, error, unavailable } = await countRows(admin, "design_generations", (q) =>
      q.eq("email_hash", emailHash).gte("created_at", since)
    );

    if (unavailable) {
      warnSetup("weekly quota query failed", error);
      return isProd() ? closed : open;
    }

    const used = count ?? 0;
    const remaining = Math.max(0, WEEKLY_LIMIT - used);
    if (used >= WEEKLY_LIMIT) {
      return {
        allowed: false,
        used,
        remaining: 0,
        limit: WEEKLY_LIMIT,
        error: `You've used all ${WEEKLY_LIMIT} free designs this week. New designs unlock in a few days — or reply to your design email and we'll help.`,
        retryAfter: Math.round(WEEK_MS / 1000),
      };
    }
    return { allowed: true, used, remaining, limit: WEEKLY_LIMIT };
  } catch (err) {
    console.error("weekly quota error", err);
    return isProd() ? closed : open;
  }
}

/**
 * Consume one weekly unit by recording the generation (also captures the lead).
 * install + bloom images for this design do NOT consume more — they verify
 * against this row instead (see verifyDesignOwnership).
 */
export async function reserveDesign({ emailHash, email, ipHash, designId, plantCount = 0 }) {
  if (!supaConfigured()) return { ok: true, recorded: false };
  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from("design_generations").insert({
      email_hash: emailHash,
      email: normalizeEmail(email),
      ip_hash: ipHash,
      design_id: designId,
      plant_count: plantCount,
    });
    if (error) {
      warnSetup("reserveDesign insert", error);
      return isProd()
        ? { ok: false, error: "The designer is temporarily unavailable. Please try again shortly." }
        : { ok: true, recorded: false };
    }
    return { ok: true, recorded: true };
  } catch (err) {
    warnSetup("reserveDesign", err);
    return isProd()
      ? { ok: false, error: "The designer is temporarily unavailable. Please try again shortly." }
      : { ok: true, recorded: false };
  }
}

/**
 * Image routes call this so nobody can bypass the email gate by hitting them
 * directly: an image can only be produced for a design this email already
 * reserved within the quota window.
 *
 * Production is strict. Outside production it always lets the render through —
 * a missing `design_generations` table (or a reservation insert that silently
 * failed) must never break local development with a bogus "expired" error.
 */
export async function verifyDesignOwnership({ emailHash, designId }) {
  if (!supaConfigured()) return { ok: true };
  if (!emailHash || !designId) {
    return isProd() ? { ok: false, error: "Missing design ownership." } : { ok: true };
  }
  try {
    const admin = supabaseAdmin();
    const since = new Date(Date.now() - WEEK_MS).toISOString();
    const { count, error, unavailable } = await countRows(admin, "design_generations", (q) =>
      q.eq("email_hash", emailHash).eq("design_id", designId).gte("created_at", since)
    );
    if (unavailable) {
      warnSetup("verifyDesignOwnership query", error);
      return isProd()
        ? { ok: false, error: "Could not verify this design. Please generate a new one." }
        : { ok: true };
    }
    if ((count ?? 0) < 1) {
      if (!isProd()) {
        console.warn(
          "[designer] no design_generations row for this design — allowing anyway (non-production)."
        );
        return { ok: true };
      }
      return { ok: false, error: "This design has expired. Please generate a new one." };
    }
    return { ok: true };
  } catch (err) {
    warnSetup("verifyDesignOwnership", err);
    return isProd()
      ? { ok: false, error: "Could not verify this design. Please generate a new one." }
      : { ok: true };
  }
}
