import { site } from "./site";

export const EMAIL_BRAND = site.name;
export const EMAIL_REPLY_TO = site.email;

/** Keep the verified sending mailbox, but never inherit another brand's name. */
export function unionParkSender() {
  const configured = String(
    process.env.LEAD_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  ).trim();
  const mailbox = (configured.match(/<([^<>]+)>/)?.[1] || configured).trim();
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(mailbox)) {
    throw new Error("The Union Park email sender is not a valid mailbox.");
  }
  return `${EMAIL_BRAND} <${mailbox}>`;
}

export function unionParkSubject(subject) {
  const clean = String(subject || "").replace(/^\[(?:Annie[^\]]*|Union Park(?: Landscaping)?)\]\s*/i, "");
  return `[${EMAIL_BRAND}] ${clean}`;
}
