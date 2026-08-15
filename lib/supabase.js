import { createClient } from "@supabase/supabase-js";

/** Accepts host or full URL; always returns https://… origin. */
function normalizeSupabaseUrl(raw) {
  const s = String(raw || "").trim().replace(/\/+$/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

const URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const ANON = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const SERVICE = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const supabaseConfigured = Boolean(URL && SERVICE);

// Public browser client (anon key). Null until configured — RLS gates what it can do.
export const supabase = URL && ANON ? createClient(URL, ANON) : null;

// Server-only admin client (service role). Never import into a client component.
export function supabaseAdmin() {
  if (!URL || !SERVICE) throw new Error("Supabase is not configured (set env vars).");
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

/**
 * Upload to the private `designs` bucket.
 * Prefer serving via /api/design/media (correct Content-Type) over signed URLs.
 */
export async function uploadDesignImage(buffer, path, contentType = "image/png") {
  if (!supabaseConfigured) return null;

  const admin = supabaseAdmin();
  const { error } = await admin.storage.from("designs").upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

/** Download bytes from the private designs bucket (service role). */
export async function downloadDesignImage(path) {
  if (!supabaseConfigured) return null;
  const admin = supabaseAdmin();
  const { data, error } = await admin.storage.from("designs").download(path);
  if (error) throw error;
  const ab = await data.arrayBuffer();
  return Buffer.from(ab);
}

/**
 * Hard-delete every stored file for a design id (P1-5 — Privacy Policy § 9.1
 * deletion promise). Tries every stage name and every extension we've ever
 * uploaded with, so nothing gets left behind. Best-effort per path — a 404 on
 * a path that was never written isn't an error.
 */
export async function deleteDesignImages(id) {
  if (!supabaseConfigured || !id) return { ok: true, removed: [] };
  const admin = supabaseAdmin();
  const stages = ["before", "install", "summer", "bloom"];
  const exts = ["", ".jpg", ".jpeg", ".png", ".webp"];
  const paths = stages.flatMap((s) => exts.map((e) => `${id}/${s}${e}`));
  const { data, error } = await admin.storage.from("designs").remove(paths);
  if (error) throw error;
  return { ok: true, removed: (data || []).map((d) => d.name) };
}
