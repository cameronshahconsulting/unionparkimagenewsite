/**
 * Thin Resend helper (no SDK) — free tier is plenty for contact + newsletter.
 * https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_URL = "https://api.resend.com/emails";

export function resendConfigured() {
  return Boolean(String(process.env.RESEND_API_KEY || "").trim());
}

/**
 * @param {{
 *   to: string|string[],
 *   subject: string,
 *   text: string,
 *   html?: string,
 *   replyTo?: string,
 *   from?: string,
 * }} opts
 */
export async function sendEmail({ to, subject, text, html, replyTo, from }) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  // Until you verify a domain in Resend, use their onboarding sender for tests.
  const fromAddr =
    from ||
    process.env.RESEND_FROM_EMAIL ||
    "Annie's Online Nursery <onboarding@resend.dev>";

  const payload = {
    from: fromAddr,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    ...(html ? { html } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `Resend failed (${res.status})`;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.resend = data;
    throw err;
  }
  return data;
}

export function contactInbox() {
  return (
    process.env.CONTACT_TO_EMAIL ||
    process.env.RESEND_TO_EMAIL ||
    "anniesonlinenursery@gmail.com"
  );
}
