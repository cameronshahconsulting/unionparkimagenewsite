/**
 * Toxicity / irritant / thorn flags (P1-6).
 *
 * IMPORTANT — data honesty: per-species ingestion-toxicity and skin-irritant
 * claims are safety-relevant medical/veterinary facts, and getting one wrong
 * (in either direction) is worse than leaving it blank. This file intentionally
 * only pre-populates "thorny", which is a physical fact about the plant's
 * structure, not a toxicology claim — that part is safe to state from general
 * horticultural knowledge (you can see the thorns).
 *
 * "toxic-if-ingested" and "skin-irritant" are left for the owner to populate
 * genus-by-genus against a real source (ASPCA's toxic/non-toxic plant list,
 * a Cooperative Extension fact sheet, or a poison-control reference) — do not
 * bulk-fill these from a guess. The Designer results disclaimer below covers
 * the gap responsibly in the meantime.
 */

const THORNY_GENERA = new Set(["rosa", "berberis", "ilex", "yucca", "pyracantha", "crataegus"]);

/** First word of a botanical name, lowercased — mirrors lib/plant-visuals genusOf. */
function genusOf(name = "") {
  return String(name).trim().split(/[\s',]/)[0].replace(/[^A-Za-z-]/g, "").toLowerCase();
}

/**
 * Per-SKU override, for when the owner has verified a specific plant against a
 * real source. Keyed by SKU so it can be as precise as needed. Empty on
 * purpose — see file header.
 */
export const TOXICITY_OVERRIDES = {};

export function toxicityFor(plant) {
  if (!plant) return null;
  const override = TOXICITY_OVERRIDES[plant.sku];
  if (override) return override;
  if (THORNY_GENERA.has(genusOf(plant.name))) return "thorny";
  return null;
}

export const TOXICITY_LABELS = {
  "toxic-if-ingested": { icon: "☠", label: "Toxic if ingested" },
  "skin-irritant": { icon: "⚠", label: "Skin irritant" },
  thorny: { icon: "🌵", label: "Thorny" },
};
