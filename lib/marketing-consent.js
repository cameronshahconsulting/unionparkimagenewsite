import { supabaseAdmin, supabaseConfigured } from "./supabase";
import { hashEmail, normalizeEmail } from "./guard";

function isMissingTable(error) {
  const code = String(error?.code || "");
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") return true;
  const msg = `${error?.message || ""} ${error?.hint || ""}`;
  return /could not find the table|does not exist|schema cache/i.test(msg);
}

let warnedMissing = false;
function warnSoft(where, error) {
  if (isMissingTable(error)) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn("\n[marketing] marketing_consent table missing — run supabase/schema.sql.\n");
    }
    return;
  }
  console.error(where, error);
}

/**
 * Record an opt-in checkbox being checked (P1-7). Source is where it happened
 * ('designer_email' | 'checkout' | 'newsletter_form'). Never flips
 * unsubscribed_at back to null — once someone unsubscribes they stay
 * unsubscribed, full stop, even if they check a box again later.
 */
export async function recordMarketingConsent({ email, source }) {
  if (!supabaseConfigured || !email) return { ok: true, saved: false };
  const normalized = normalizeEmail(email);
  const emailHash = hashEmail(normalized);
  try {
    const admin = supabaseAdmin();
    const { data: existing } = await admin
      .from("marketing_consent")
      .select("unsubscribed_at")
      .eq("email_hash", emailHash)
      .maybeSingle();

    if (existing?.unsubscribed_at) {
      // Suppressed — do not resurrect. This is intentional, not a bug.
      return { ok: true, saved: false, suppressed: true };
    }

    const { error } = await admin.from("marketing_consent").upsert(
      {
        email_hash: emailHash,
        email: normalized,
        source: source || null,
        consented_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email_hash" }
    );
    if (error) {
      warnSoft("recordMarketingConsent", error);
      return { ok: true, saved: false };
    }
    return { ok: true, saved: true };
  } catch (err) {
    warnSoft("recordMarketingConsent", err);
    return { ok: true, saved: false };
  }
}

/** Permanent suppression (P1-7 — "never re-add an unsubscribed address"). */
export async function unsubscribeEmail(email) {
  if (!supabaseConfigured || !email) return { ok: true, saved: false };
  const normalized = normalizeEmail(email);
  const emailHash = hashEmail(normalized);
  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from("marketing_consent").upsert(
      {
        email_hash: emailHash,
        email: normalized,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email_hash" }
    );
    if (error) {
      warnSoft("unsubscribeEmail", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, saved: true };
  } catch (err) {
    warnSoft("unsubscribeEmail", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

/** Check before ANY marketing send — transactional email (OTP, order updates) never calls this. */
export async function isSuppressed(email) {
  if (!supabaseConfigured || !email) return false;
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("marketing_consent")
      .select("unsubscribed_at")
      .eq("email_hash", hashEmail(normalizeEmail(email)))
      .maybeSingle();
    return Boolean(data?.unsubscribed_at);
  } catch (err) {
    warnSoft("isSuppressed", err);
    return false;
  }
}

/** Stable, unguessable-enough unsubscribe token — same hash used elsewhere, no new secret to manage. */
export function unsubscribeToken(email) {
  return hashEmail(email);
}
