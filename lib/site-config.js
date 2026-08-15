/**
 * Single source of truth for legally-required identifiers that must render
 * everywhere: nursery license number (3 Del. C. § 1308(c) — required in every
 * advertisement, and the whole site counts) and the CAN-SPAM postal address
 * (15 U.S.C. § 7704(a)(5)) for commercial email.
 *
 * Override via NEXT_PUBLIC_NURSERY_LICENSE / NEXT_PUBLIC_COMPANY_ADDRESS in
 * .env.local or Vercel if these ever change.
 */

export const NURSERY_LICENSE =
  process.env.NEXT_PUBLIC_NURSERY_LICENSE || "2026953503";

export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "1202 N West St, Wilmington, DE 19801";

export const NURSERY_LICENSE_LINE = `Delaware Nursery License No. ${NURSERY_LICENSE}`;

/** Structured postal address for JSON-LD / SEO. */
export const COMPANY_POSTAL = {
  streetAddress: "1202 N West St",
  addressLocality: "Wilmington",
  addressRegion: "DE",
  postalCode: "19801",
  addressCountry: "US",
};

/** Plain-text + HTML snippet for commercial email footers (CAN-SPAM). */
export function emailComplianceFooter() {
  return {
    text: `${NURSERY_LICENSE_LINE}\n${COMPANY_ADDRESS}`,
    html: `<p style="font-family:system-ui,sans-serif;font-size:11px;color:#9a9182;margin-top:16px">${NURSERY_LICENSE_LINE}<br>${COMPANY_ADDRESS}</p>`,
  };
}
