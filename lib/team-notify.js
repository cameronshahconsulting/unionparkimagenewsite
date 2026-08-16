import { supabaseConfigured, supabaseAdmin } from "./supabase";
import { sendEmail, resendConfigured, contactInbox } from "./resend";

/**
 * Email Union Park team (CONTACT_TO_EMAIL / LEAD_EMAIL_TO) and optionally log to form_submissions.
 * Soft-fails — never blocks the customer flow.
 */
export async function notifyTeam({
  kind = "notice",
  subject,
  text,
  html,
  replyTo,
  name = null,
  email = null,
  phone = null,
  message = null,
  meta = {},
} = {}) {
  let savedId = null;

  if (supabaseConfigured) {
    try {
      const admin = supabaseAdmin();
      const { data, error } = await admin
        .from("form_submissions")
        .insert({
          kind: String(kind || "notice").slice(0, 40),
          name: name || null,
          email: email || null,
          phone: phone || null,
          subject: String(subject || kind).slice(0, 120),
          message: message || text || null,
          meta: meta && typeof meta === "object" ? meta : {},
        })
        .select("id")
        .maybeSingle();
      if (error) console.error("notifyTeam form_submissions", error);
      else savedId = data?.id ?? null;
    } catch (err) {
      console.error("notifyTeam form_submissions", err);
    }
  }

  if (!resendConfigured()) {
    return { ok: true, emailed: false, savedId };
  }

  try {
    const body =
      text +
      (savedId ? `\n\n(Saved as form_submissions #${savedId})` : "");
    const prefixed =
      subject.startsWith("[UPL") || subject.startsWith("[Union")
        ? subject
        : `[UPL] ${subject}`;
    await sendEmail({
      to: contactInbox(),
      subject: prefixed,
      text: body,
      html: html || undefined,
      replyTo: replyTo || email || undefined,
    });
    return { ok: true, emailed: true, savedId };
  } catch (err) {
    console.error("notifyTeam email", err);
    return { ok: false, emailed: false, savedId, error: err?.message };
  }
}
