/**
 * Per-state legal restrictions on regulated nursery stock.
 *
 * Delaware's prohibition attaches to Annie's as the seller of record regardless
 * of ship-to state, so a "DE: prohibited" row takes the SKU off sale everywhere,
 * not just for Delaware-bound orders. Other states are destination-dependent —
 * evaluate the customer's delivery state's row in addition to DE.
 *
 * `notice-required` rows should render `noticeText` (or MD_TIER2_NOTICE_DEFAULT)
 * visibly on product card, product page, cart line, and packing slip — never in
 * a tooltip or accordion. `prohibited` rows take the item off sale entirely.
 */
export const PLANT_RESTRICTIONS = {
  // Delaware SB 22 / Pennsylvania Class B noxious weed list.
  "BERBERISTH-3G": { DE: "prohibited", PA: "prohibited" }, // Berberis thunbergii 'Concorde'
  "BERBERISTH-3G-2": { DE: "prohibited", PA: "prohibited" }, // Berberis thunb. var. atrop. 'Crimson Pygmy'
  "BERBERISTH-3G-3": { DE: "prohibited", PA: "prohibited" }, // Berberis thunb. var. atrop. 'Rose Glow'
  "PYRUSCALLE-20GC1752": { DE: "prohibited", PA: "prohibited" }, // Pyrus calleryana 'Chanticleer'

  // NOTE — BERBERISXG-3G1215, Berberis x gladwynensis 'William Penn', is a
  // DIFFERENT species from the Berberis thunbergii cultivars above. Per the
  // compliance brief this is flagged for human/legal review only — do not
  // auto-restrict it. No entry here on purpose.
};

/** Default Maryland Tier 2 invasive-species notice (P0-5). Override per-SKU via noticeText below if needed. */
export const MD_TIER2_NOTICE_DEFAULT =
  "Invasive in Maryland (Tier 2). Plant responsibly and do not allow to spread.";

/** Per-SKU notice text override for notice-required states. Falls back to MD_TIER2_NOTICE_DEFAULT. */
export const PLANT_NOTICE_TEXT = {};

export function restrictionFor(sku) {
  return PLANT_RESTRICTIONS[sku] || null;
}

/** DE attaches regardless of destination — if any state says prohibited, it's off sale everywhere. */
export function isProhibitedAnywhere(sku) {
  const r = PLANT_RESTRICTIONS[sku];
  if (!r) return false;
  return Object.values(r).some((v) => v === "prohibited");
}

/** Is this SKU prohibited for a specific delivery state (2-letter code)? */
export function isProhibitedForState(sku, stateCode) {
  const r = PLANT_RESTRICTIONS[sku];
  if (!r) return false;
  if (r.DE === "prohibited") return true; // Delaware's attaches regardless of ship-to.
  return r[stateCode] === "prohibited";
}

export function noticeTextFor(sku) {
  return PLANT_NOTICE_TEXT[sku] || MD_TIER2_NOTICE_DEFAULT;
}
