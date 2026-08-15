import { supabaseAdmin, supabaseConfigured } from "./supabase";
import { hashEmail } from "./guard";
import { TERMS_VERSION, PRIVACY_VERSION, DESIGNER_TERMS_VERSION } from "./legal-versions";

function isMissingTable(error) {
  const code = String(error?.code || "");
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") return true;
  const msg = `${error?.message || ""} ${error?.hint || ""}`;
  return /could not find the table|does not exist|schema cache/i.test(msg);
}

let warnedMissing = false;

/**
 * Record a clickwrap acceptance (P0-8 — Berman two-prong: conspicuous notice +
 * an explicit "checking this box means you agree" statement, which the checkout
 * and Designer UIs both show next to the checkbox).
 *
 * Soft-fails like the rest of the audit tables here (see lib/designs.js) so a
 * missing table in local dev doesn't block checkout — but the CALLER must still
 * reject the request if `checked` isn't true. This function only persists the
 * evidentiary record; it isn't the enforcement point.
 */
export async function recordAssent({ context, email, ipHash, userAgent, orderRef }) {
  const row = {
    context,
    email: email || null,
    email_hash: email ? hashEmail(email) : null,
    ip_hash: ipHash || null,
    user_agent: String(userAgent || "").slice(0, 500),
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    designer_terms_version: DESIGNER_TERMS_VERSION,
    order_ref: orderRef || null,
  };

  if (!supabaseConfigured) return { ok: true, saved: false, id: null, ...row };

  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin.from("legal_assents").insert(row).select("id").single();
    if (error) {
      if (isMissingTable(error)) {
        if (!warnedMissing) {
          warnedMissing = true;
          console.warn(
            "\n[legal] legal_assents table missing — run supabase/schema.sql to persist clickwrap assent records.\n"
          );
        }
        return { ok: true, saved: false, id: null, ...row };
      }
      console.error("recordAssent", error);
      return { ok: true, saved: false, id: null, ...row };
    }
    return { ok: true, saved: true, id: data.id, ...row };
  } catch (err) {
    console.error("recordAssent", err);
    return { ok: true, saved: false, id: null, ...row };
  }
}
