// Catalog generated from Shopify Storefront API.
// Regenerate: node scripts/sync-shopify-catalog.mjs
import data from "../data/inventory-generated.json";
import { enrichGarden } from "./garden-meta";
import { friendlyName, cleanSizeLabel } from "./plant-visuals";
import { PLANT_RESTRICTIONS, isProhibitedAnywhere } from "./plant-restrictions";
import { toxicityFor } from "./plant-safety";

/** True when Shopify's raw size string carries the "Buy In" trade-jargon flag (bought from another grower). */
function isBuyIn(rawSize) {
  return /\bbuy\s*in\b/i.test(String(rawSize || ""));
}

/** Stroll / shop category order: affordable beds first, big trees last. */
const CATEGORY_ORDER = ["perennials", "grasses", "roses", "shrubs", "evergreens", "trees"];

/** Customer-facing labels (keys stay Shopify-aligned: trees, shrubs, …). */
const CATEGORY_DISPLAY = {
  perennials: {
    title: "Garden Flowers",
    blurb: "Hostas, daylilies, salvia. Color that comes back every year",
  },
  grasses: {
    title: "Grasses & Soft Edges",
    blurb: "Ornamental grasses and easy fillers for borders and beds",
  },
  roses: {
    title: "Roses",
    blurb: "Knock Out, Drift, and classic garden roses",
  },
  shrubs: {
    title: "Shrubs & Bushes",
    blurb: "Hydrangea, lilac, summersweet, viburnum. The backbone of a pretty yard",
  },
  evergreens: {
    title: "Evergreens & Privacy",
    blurb: "Boxwood, arborvitae, holly, and year-round green",
  },
  trees: {
    title: "Shade & Statement Trees",
    blurb: "Maples, redbuds, dogwoods, and trees that frame the yard",
  },
};

function byPriceThenName(a, b) {
  const dp = (Number(a.price) || 0) - (Number(b.price) || 0);
  if (dp !== 0) return dp;
  return friendlyName(a).localeCompare(friendlyName(b));
}

export const CATEGORIES = CATEGORY_ORDER.map((key) => {
  const c = data.categories.find((x) => x.key === key);
  if (!c) return null;
  return { ...c, ...(CATEGORY_DISPLAY[key] || {}) };
}).filter(Boolean);

/**
 * All variants (SKU + Shopify variant GID), with compliance restrictions layered
 * on top of the Shopify-synced data. Restrictions live in ./plant-restrictions,
 * not in data/inventory-generated.json, so a re-sync from Shopify never silently
 * un-restricts a prohibited SKU. A restricted-anywhere SKU is forced unavailable
 * here (single point of truth) — records are kept, not deleted, so historical
 * orders/designs can still resolve the SKU by name.
 */
export const PLANTS = data.plants.map((p) => {
  const restrictions = PLANT_RESTRICTIONS[p.sku];
  // "Buy In" is Shopify trade jargon for stock purchased from another grower — never
  // customer-facing (P0-2a). Clean it out of the display size once here so every
  // consumer (cart, Designer plant list, order emails, hover copy) gets the clean
  // string automatically, and keep the fact on an internal-only `sourcing` field.
  const sourcing = isBuyIn(p.size) ? "bought-in" : "grown";
  const size = cleanSizeLabel(p.size) || p.size;
  const toxicity = toxicityFor(p);
  return {
    ...p,
    size,
    sourcing,
    toxicity,
    ...(restrictions ? { restrictions, availableForSale: isProhibitedAnywhere(p.sku) ? false : p.availableForSale } : null),
  };
});

/** One preferred size per product — used by the AI designer SKU enum. */
export const DESIGNER_SKUS = data.designerSkus;

export const GARDENS = data.gardens.map(enrichGarden);

export function plantBySku(sku) {
  return PLANTS.find((p) => p.sku === sku);
}

export function companionsFor(plant, limit = 4) {
  if (!plant?.companions?.length) return [];
  return plant.companions
    .map(plantBySku)
    .filter((p) => p && p.availableForSale !== false)
    .slice(0, limit);
}

export function gardensForPlant(plant) {
  if (!plant) return [];
  return GARDENS.filter((g) => g.skus.includes(plant.sku) || g.skus.some((s) => plantBySku(s)?.handle === plant.handle));
}

/** Plants in a garden plan/kit, in-stock only (compliance-restricted SKUs never surface here). */
export function plantsForGarden(garden) {
  return garden.skus.map(plantBySku).filter((p) => p && p.availableForSale !== false);
}

/** Compact desktop hover copy: short fact + one useful tip. */
export function plantHoverCopy(plant) {
  if (!plant) return { fact: "", tip: "" };

  const attracts = plant.attracts || [];
  let fact = plant.tag || "Garden ready";
  if (plant.native && attracts.includes("butterflies")) fact = "Native · butterfly nectar";
  else if (plant.native && attracts.includes("birds")) fact = "Native · birds love it";
  else if (plant.native) fact = "Delaware native pick";
  else if (attracts.includes("hummingbirds")) fact = "Hummingbird favorite";
  else if (attracts.includes("bees") && attracts.includes("butterflies")) fact = "Pollinator magnet";
  else if (attracts.includes("butterflies")) fact = "Butterfly friendly";
  else if (attracts.includes("bees")) fact = "Bee-friendly bloom";
  else if (plant.bloom && plant.bloom !== "Year-round" && plant.bloom !== "Foliage") fact = `${plant.bloom} bloom`;
  else if (plant.sun) fact = plant.sun;
  else if (plant.size) fact = plant.size;

  const pair = plant.companions?.map(plantBySku).find(Boolean);
  const tips = [
    pair ? `Pairs well with ${friendlyName(pair)}` : null,
    plant.zone ? `Hardy in zones ${plant.zone}` : null,
    plant.sun === "Full sun" ? "Give it open sky" : null,
    plant.sun?.toLowerCase().includes("shade") ? "Happy in cooler light" : null,
    plant.size ? `Available as ${plant.size}` : null,
  ].filter(Boolean);

  let tip = tips[0] || "Tap + to add it to your cart";
  if (tips.length > 1) {
    const n = [...plant.sku].reduce((s, c) => s + c.charCodeAt(0), 0);
    tip = tips[n % tips.length];
  }

  return { fact, tip };
}

export const GARDEN_BEDS = CATEGORIES.map((c) => ({
  ...c,
  // One size per plant for the walkable beds (avoids 3–8 size duplicates).
  // Cheapest first so the stroll feels easy to buy into.
  plants: PLANTS.filter(
    (p) => p.cat === c.key && DESIGNER_SKUS.includes(p.sku) && p.availableForSale !== false
  ).sort(byPriceThenName),
})).filter((b) => b.plants.length);

/** All variant SKUs (checkout / pricing). */
export const IN_STOCK_SKUS = PLANTS.map((p) => p.sku);

/** Designer brain is limited to one preferred SKU per product. */
export const DESIGNER_IN_STOCK_SKUS = DESIGNER_SKUS;

CATEGORIES.forEach((c) => {
  c.count = PLANTS.filter((p) => p.cat === c.key && p.availableForSale !== false).length;
});
