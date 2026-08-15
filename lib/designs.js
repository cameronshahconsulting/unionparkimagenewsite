import { supabaseAdmin, supabaseConfigured } from "./supabase";

function isProd() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

function isMissingTable(error) {
  const code = String(error?.code || "");
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") return true;
  const msg = `${error?.message || ""} ${error?.hint || ""}`;
  return /could not find the table|does not exist|schema cache|column .* does not exist/i.test(msg);
}

let warnedMissing = false;

function warnSoft(where, error) {
  if (isMissingTable(error)) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn(
        "\n[designer] design plan persistence unavailable (missing table/column).\n" +
          "  → Run supabase/schema.sql to enable /designer/d/{uuid} permalinks.\n"
      );
    }
    return;
  }
  console.error(where, error);
}

/** Drop data: URLs — store same-origin /https media paths only. */
export function sanitizePlanForStorage(plan) {
  if (!plan || typeof plan !== "object") return null;
  const out = { ...plan };
  for (const key of ["beforeUrl", "installUrl", "summerUrl", "bloomUrl", "nightUrl"]) {
    const v = out[key];
    if (typeof v === "string" && (v.startsWith("data:") || v.length > 2048)) {
      out[key] = null;
    }
  }
  // Never persist install/summer image base64 payloads if present.
  delete out.installImage;
  delete out.summerImage;
  delete out.areaImage;
  delete out.inspoImages;
  return out;
}

/**
 * Persist the full plan JSON onto the design_generations row for this design_id.
 * Soft-fails when Supabase isn't configured or the table/column is missing.
 */
export async function saveDesignPlan(designId, plan) {
  if (!supabaseConfigured || !designId) return { ok: true, saved: false };
  const sanitized = sanitizePlanForStorage(plan);
  if (!sanitized) return { ok: true, saved: false };
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("design_generations")
      .update({ plan: sanitized })
      .eq("design_id", designId)
      .select("id");

    if (error) {
      warnSoft("saveDesignPlan update", error);
      return isProd() ? { ok: false, error: error.message } : { ok: true, saved: false };
    }
    if (Array.isArray(data) && data.length > 0) {
      return { ok: true, saved: true };
    }

    // No reserved row yet — insert a minimal permalink row (merge-style).
    const { error: insertError } = await admin.from("design_generations").insert({
      email_hash: `permalink:${designId}`,
      design_id: designId,
      plant_count: Array.isArray(sanitized.items) ? sanitized.items.length : 0,
      plan: sanitized,
    });
    if (insertError) {
      // Unique conflict: another writer won the race — try one more update.
      if (String(insertError.code) === "23505") {
        const { error: retryError } = await admin
          .from("design_generations")
          .update({ plan: sanitized })
          .eq("design_id", designId);
        if (retryError) {
          warnSoft("saveDesignPlan retry", retryError);
          return isProd() ? { ok: false, error: retryError.message } : { ok: true, saved: false };
        }
        return { ok: true, saved: true };
      }
      warnSoft("saveDesignPlan insert", insertError);
      return isProd() ? { ok: false, error: insertError.message } : { ok: true, saved: false };
    }
    return { ok: true, saved: true };
  } catch (err) {
    warnSoft("saveDesignPlan", err);
    return isProd() ? { ok: false, error: String(err?.message || err) } : { ok: true, saved: false };
  }
}

/**
 * Load a saved plan by design UUID. Returns the plan object or null.
 */
export async function loadDesignPlan(designId) {
  if (!supabaseConfigured || !designId) return null;
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("design_generations")
      .select("plan, email_hash")
      .eq("design_id", designId)
      .maybeSingle();

    if (error) {
      warnSoft("loadDesignPlan", error);
      return null;
    }
    if (!data?.plan || typeof data.plan !== "object") return null;
    return data.plan;
  } catch (err) {
    warnSoft("loadDesignPlan", err);
    return null;
  }
}

/**
 * Shallow-merge keys into the existing plan jsonb (e.g. installUrl updates).
 */
export async function patchDesignPlan(designId, patch) {
  if (!supabaseConfigured || !designId || !patch || typeof patch !== "object") {
    return { ok: true, patched: false };
  }
  try {
    const existing = await loadDesignPlan(designId);
    if (!existing) return { ok: true, patched: false };
    const merged = sanitizePlanForStorage({ ...existing, ...patch });
    const admin = supabaseAdmin();
    const { error } = await admin
      .from("design_generations")
      .update({ plan: merged })
      .eq("design_id", designId);
    if (error) {
      warnSoft("patchDesignPlan", error);
      return isProd() ? { ok: false, error: error.message } : { ok: true, patched: false };
    }
    return { ok: true, patched: true };
  } catch (err) {
    warnSoft("patchDesignPlan", err);
    return isProd() ? { ok: false, error: String(err?.message || err) } : { ok: true, patched: false };
  }
}

/**
 * List a customer's designs by verified email hash (P1-5 — "Your designs").
 * Unlike verifyDesignOwnership (used to chain install→summer→bloom within the
 * same session) this has no recency window: a customer must be able to find
 * and delete a design from months ago, not just the last week.
 */
export async function listDesignsByEmailHash(emailHash, { limit = 100 } = {}) {
  if (!supabaseConfigured || !emailHash) return [];
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("design_generations")
      .select("design_id, created_at, plan")
      .eq("email_hash", emailHash)
      .not("plan", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      warnSoft("listDesignsByEmailHash", error);
      return [];
    }
    return (data || [])
      .filter((row) => row.plan && typeof row.plan === "object")
      .map((row) => ({
        id: row.design_id,
        createdAt: row.created_at,
        beforeUrl: row.plan.beforeUrl || null,
        gardenTitle: row.plan.gardenTitle || row.plan.style || "Garden design",
        plantCount: Array.isArray(row.plan.items) ? row.plan.items.length : 0,
      }));
  } catch (err) {
    warnSoft("listDesignsByEmailHash", err);
    return [];
  }
}

/** Does this verified email own this design? No recency window — see above. */
export async function ownsDesign(emailHash, designId) {
  if (!supabaseConfigured || !emailHash || !designId) return false;
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from("design_generations")
      .select("design_id")
      .eq("email_hash", emailHash)
      .eq("design_id", designId)
      .maybeSingle();
    if (error) {
      warnSoft("ownsDesign", error);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    warnSoft("ownsDesign", err);
    return false;
  }
}

/** Hard-delete a design row. Caller is responsible for deleting its storage images first. */
export async function deleteDesignRecord(designId) {
  if (!supabaseConfigured || !designId) return { ok: true, deleted: false };
  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from("design_generations").delete().eq("design_id", designId);
    if (error) {
      warnSoft("deleteDesignRecord", error);
      return isProd() ? { ok: false, error: error.message } : { ok: true, deleted: false };
    }
    return { ok: true, deleted: true };
  } catch (err) {
    warnSoft("deleteDesignRecord", err);
    return isProd() ? { ok: false, error: String(err?.message || err) } : { ok: true, deleted: false };
  }
}

/** Designs older than this are purged automatically (P1-5 / Privacy Policy § 8). */
export const RETENTION_MONTHS = 24;

/** Every design_id older than RETENTION_MONTHS, for the scheduled purge job. */
export async function listExpiredDesignIds({ months = RETENTION_MONTHS } = {}) {
  if (!supabaseConfigured) return [];
  try {
    const admin = supabaseAdmin();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const { data, error } = await admin
      .from("design_generations")
      .select("design_id")
      .lt("created_at", cutoff.toISOString())
      .not("design_id", "is", null)
      .limit(500);
    if (error) {
      warnSoft("listExpiredDesignIds", error);
      return [];
    }
    return (data || []).map((r) => r.design_id).filter(Boolean);
  } catch (err) {
    warnSoft("listExpiredDesignIds", err);
    return [];
  }
}
