/** Stable garden prompt seeds + style tags (survives Shopify catalog sync). */
export const GARDEN_META = {
  "butterfly-garden": {
    styleTags: ["Pollinator", "Native"],
    defaultShape: "border",
    defaultSqFt: 150,
    blueprintArt: "/gardens/butterfly-garden-blueprint.jpg",
    promptSeed:
      "A sunny butterfly garden with layered nectar shrubs and flowering borders for Delaware Zone 7 — summersweet, spicebush, butterfly bush, and repeating bloom groups that feed pollinators from spring through fall.",
  },
  "pollinator-patch": {
    styleTags: ["Pollinator", "Low-maintenance"],
    defaultShape: "island",
    defaultSqFt: 120,
    blueprintArt: "/gardens/pollinator-patch-blueprint.jpg",
    promptSeed:
      "A bright pollinator patch with Knock Out roses, soft catmint, salvia, and native grasses — easy color for bees and butterflies along a driveway or open bed.",
  },
  "privacy-screen": {
    styleTags: ["Modern", "Low-maintenance"],
    defaultShape: "border",
    defaultSqFt: 200,
    blueprintArt: "/gardens/privacy-screen-blueprint.jpg",
    promptSeed:
      "A living privacy screen of upright evergreens and hollies for a property line — mixed heights for a natural wall, year-round structure without a fence.",
  },
  "shade-garden": {
    styleTags: ["Cottage", "Low-maintenance"],
    defaultShape: "kidney",
    defaultSqFt: 150,
    blueprintArt: "/gardens/shade-garden-blueprint.jpg",
    promptSeed:
      "A layered shade garden under trees: evergreen azaleas, hydrangeas, and hosta texture for a cool north-side bed with mulched soil and soft dappled light.",
  },
  "cottage-garden": {
    styleTags: ["Cottage"],
    defaultShape: "border",
    defaultSqFt: 150,
    blueprintArt: "/gardens/cottage-garden-blueprint.jpg",
    promptSeed:
      "A soft cottage border for a front walk — hydrangeas, roses, spirea, and lilac in odd-number drifts, tall plants in back and low bloomers along the edge.",
  },
  "native-delaware": {
    styleTags: ["Native", "Pollinator"],
    defaultShape: "rectangle",
    defaultSqFt: 200,
    blueprintArt: "/gardens/native-delaware-blueprint.jpg",
    promptSeed:
      "A Delaware-native planting with spicebush, summersweet, chokeberry, winterberry, and prairie grasses — wildlife-friendly and lower long-term care.",
  },
  "four-season": {
    styleTags: ["Modern", "Low-maintenance"],
    defaultShape: "border",
    defaultSqFt: 150,
    blueprintArt: "/gardens/four-season-blueprint.jpg",
    promptSeed:
      "Four-season structure for a foundation bed: evergreen backbone, winter berries, spring bloom, and fall color so the yard looks finished year-round.",
  },
};

export const BED_SHAPES = [
  { key: "rectangle", label: "Rectangle" },
  { key: "border", label: "Long border" },
  { key: "island", label: "Island" },
  { key: "L-shape", label: "L-shape" },
  { key: "U-shape", label: "U-shape" },
  { key: "corner", label: "Corner" },
  { key: "kidney", label: "Kidney" },
  { key: "circle", label: "Circle" },
  { key: "crescent", label: "Crescent" },
  { key: "horseshoe", label: "Horseshoe" },
];

export const SHAPE_KEYS = BED_SHAPES.map((s) => s.key);

export const SQFT_PRESETS = [50, 100, 200, 400, 800];

export const ZONES = ["back", "mid", "front", "edge"];

export function enrichGarden(garden) {
  if (!garden) return null;
  const meta = GARDEN_META[garden.slug] || {};
  return {
    ...garden,
    promptSeed: meta.promptSeed || garden.blurb || garden.story || "",
    styleTags: meta.styleTags || [],
    defaultShape: meta.defaultShape || "rectangle",
    defaultSqFt: meta.defaultSqFt || 150,
    blueprintArt: meta.blueprintArt || null,
  };
}
