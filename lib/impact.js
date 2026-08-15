/**
 * Annie's cancer research pledge.
 *
 * Voluntary company commitment paid from revenue (target range), not a
 * per-order or per-transaction donation — no customer-facing copy should imply
 * a dollar figure tied to a specific purchase (ToS § 11).
 *
 * Progress bar math uses IMPACT_ALLOCATION_RATE (default 2%, midpoint of 1–3%)
 * × paid Shopify sales revenue toward IMPACT_GOAL.
 */

export const IMPACT_RATE_MIN = 0.01;
export const IMPACT_RATE_MAX = 0.03;
/** Display label for the allocation range (of revenue). */
export const IMPACT_RATE_LABEL = "1–3%";
/** Midpoint used to estimate progress from Shopify revenue (override via IMPACT_ALLOCATION_RATE). */
export const IMPACT_ALLOCATION_RATE = 0.02;
export const IMPACT_BASIS = "revenue";
export const IMPACT_CAUSE = "cancer research";
export const IMPACT_PATH = "https://anniesonlinenursery.com/cancer-research";
export const IMPACT_GOAL_DEFAULT = 25_000;
export const IMPACT_GOAL = IMPACT_GOAL_DEFAULT;

export const IMPACT_ORG = {
  name: "Esophageal Cancer Awareness Association",
  shortName: "EC Aware",
  url: "https://www.ecaware.org/",
  donateUrl: "https://www.ecaware.org/give/donate/",
};

/** Trust-strip headline. */
export const IMPACT_TRUST_TITLE = "Supports cancer research";
export const IMPACT_TRUST_SUB = "1–3% of revenue, in Annie's memory";

/** Short topbar / compact line. */
export const IMPACT_TOPBAR =
  "Supports cancer research — we allocate 1–3% of revenue";

/** Standard in-product pledge sentence (no trailing period unless includePeriod). */
export function impactPledge({ includePeriod = true } = {}) {
  const text = `In Annie's memory, we allocate ${IMPACT_RATE_LABEL} of revenue to cancer research`;
  return includePeriod ? `${text}.` : text;
}

/** Rate used for live progress estimates (env override allowed). */
export function impactAllocationRate() {
  const r = Number(process.env.IMPACT_ALLOCATION_RATE);
  if (Number.isFinite(r) && r > 0 && r <= 1) return r;
  return IMPACT_ALLOCATION_RATE;
}

/** Fundraising goal in USD (env-overridable). */
export function impactGoal() {
  const g = Number(
    process.env.NEXT_PUBLIC_DONATION_GOAL || process.env.DONATION_GOAL || IMPACT_GOAL_DEFAULT
  );
  return Number.isFinite(g) && g > 0 ? g : IMPACT_GOAL_DEFAULT;
}

/**
 * Baseline raised amount when live Shopify totals aren't available.
 * Set NEXT_PUBLIC_DONATION_RAISED (or DONATION_RAISED) as a fallback.
 */
export function impactRaisedBaseline() {
  const r = Number(process.env.NEXT_PUBLIC_DONATION_RAISED || process.env.DONATION_RAISED || 0);
  return Number.isFinite(r) && r >= 0 ? r : 0;
}

export function impactAllocatedFromRevenue(revenue) {
  const n = Number(revenue) || 0;
  return Math.round(n * impactAllocationRate() * 100) / 100;
}
