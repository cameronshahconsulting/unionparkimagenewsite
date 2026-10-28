/** Google Ads tag for the Union Park Landscaping account. */
export const GOOGLE_ADS_ID = "AW-16692298478";

/** "Submit lead form" conversion action in Google Ads. */
const LEAD_CONVERSION = `${GOOGLE_ADS_ID}/UAwyCJu29_MbEO6FwZc-`;

type Gtag = (...args: unknown[]) => void;

/**
 * Report a successful lead form submission to Google Ads.
 * Call only after /api/lead has returned ok, so failed sends never count.
 */
export function trackLeadConversion(kind: "contact" | "visualizer") {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", {
    send_to: LEAD_CONVERSION,
    value: 1.0,
    currency: "USD",
    lead_source: kind,
  });
}
