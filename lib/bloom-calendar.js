/**
 * "What's colorful when?" — the month-by-month interest ribbon.
 *
 * The Shopify catalog gives us a bloom COLOUR ("Pink") but no bloom TIMING, so
 * timing comes from this curated genus table: standard Delaware / Zone 7 windows
 * for the genera Annie's actually stocks. Nothing here is per-plant invention —
 * a plant only gets a band if its genus is in the table, and where the catalog
 * has a real `bloom` colour that colour always wins over the genus default.
 *
 * Anything we can't place honestly is reported as `unknownCount` so the UI can
 * say so instead of drawing a pretty lie.
 */

import { genusOf, shortName } from "./plant-visuals";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Swatches stay inside Annie's warm nursery palette — no neon. */
const COLOR_HEX = {
  pink: "#E79AB4",
  rose: "#E288A5",
  white: "#F6EFE2",
  cream: "#F3E7CC",
  red: "#C4485A",
  "cherry red": "#BE3B50",
  crimson: "#B33C50",
  purple: "#8D77B5",
  lavender: "#A996C9",
  "lavender-blue": "#9AA6CE",
  blue: "#7FA3C6",
  yellow: "#F2CF6B",
  gold: "#D9A441",
  orange: "#E0985A",
  peach: "#F0B58D",
  green: "#8CA877",
  silver: "#B9C1B0",
  berry: "#B4506A",
  plum: "#96639F",
  bronze: "#C08A55",
};

/** Kinds of seasonal interest, in the order they should stack in a month. */
export const INTEREST_KINDS = {
  bloom: { label: "in bloom", weight: 4 },
  berry: { label: "in berry", weight: 3 },
  fall: { label: "fall color", weight: 2 },
  plume: { label: "seed heads", weight: 2 },
  foliage: { label: "foliage color", weight: 1 },
  evergreen: { label: "evergreen", weight: 0 },
};

/**
 * Genus → seasonal interest for Zone 7 (Delaware).
 * months are 1-indexed and inclusive; ranges may wrap the new year (e.g. 10→2).
 */
const GENUS_INTEREST = {
  // ---- spring bloom ----
  forsythia: [{ kind: "bloom", from: 3, to: 4, color: "yellow" }],
  lindera: [
    { kind: "bloom", from: 3, to: 4, color: "yellow" },
    { kind: "fall", from: 10, to: 10, color: "gold" },
  ],
  rhus: [
    { kind: "bloom", from: 3, to: 4, color: "yellow" },
    { kind: "fall", from: 10, to: 11, color: "red" },
  ],
  corylus: [{ kind: "bloom", from: 2, to: 3, color: "bronze" }],
  cercis: [{ kind: "bloom", from: 4, to: 4, color: "rose" }],
  azalea: [{ kind: "bloom", from: 4, to: 5, color: "pink" }],
  rhododendron: [{ kind: "bloom", from: 4, to: 5, color: "pink" }],
  pyrus: [{ kind: "bloom", from: 4, to: 4, color: "white" }],
  prunus: [{ kind: "bloom", from: 4, to: 5, color: "white" }],
  malus: [
    { kind: "bloom", from: 4, to: 5, color: "white" },
    { kind: "berry", from: 9, to: 10, color: "red" },
  ],
  syringa: [{ kind: "bloom", from: 4, to: 5, color: "purple" }],
  berberis: [{ kind: "foliage", from: 4, to: 10, color: "red" }],
  fothergilla: [
    { kind: "bloom", from: 4, to: 5, color: "white" },
    { kind: "fall", from: 10, to: 10, color: "orange" },
  ],
  viburnum: [
    { kind: "bloom", from: 4, to: 5, color: "white" },
    { kind: "berry", from: 9, to: 10, color: "red" },
  ],
  aronia: [
    { kind: "bloom", from: 5, to: 5, color: "white" },
    { kind: "berry", from: 9, to: 10, color: "plum" },
    { kind: "fall", from: 10, to: 11, color: "red" },
  ],
  deutzia: [{ kind: "bloom", from: 5, to: 5, color: "white" }],
  cotoneaster: [
    { kind: "bloom", from: 5, to: 5, color: "white" },
    { kind: "berry", from: 9, to: 12, color: "red" },
  ],
  cornus: [{ kind: "bloom", from: 5, to: 6, color: "white" }],
  iris: [{ kind: "bloom", from: 5, to: 6, color: "blue" }],
  weigela: [{ kind: "bloom", from: 5, to: 6, color: "pink" }],
  salix: [{ kind: "foliage", from: 4, to: 6, color: "pink" }],
  nepeta: [{ kind: "bloom", from: 5, to: 9, color: "lavender" }],

  // ---- summer bloom ----
  rosa: [{ kind: "bloom", from: 6, to: 10, color: "pink" }],
  hydrangea: [{ kind: "bloom", from: 6, to: 9, color: "pink" }],
  spiraea: [{ kind: "bloom", from: 6, to: 8, color: "pink" }],
  diervilla: [{ kind: "bloom", from: 6, to: 8, color: "yellow" }],
  ceanothus: [{ kind: "bloom", from: 6, to: 7, color: "white" }],
  ligustrum: [{ kind: "bloom", from: 6, to: 6, color: "white" }],
  tilia: [{ kind: "bloom", from: 6, to: 6, color: "cream" }],
  yucca: [{ kind: "bloom", from: 6, to: 7, color: "white" }],
  wisteria: [{ kind: "bloom", from: 6, to: 8, color: "lavender-blue" }],
  hemerocallis: [{ kind: "bloom", from: 6, to: 8, color: "yellow" }],
  astilbe: [{ kind: "bloom", from: 6, to: 7, color: "pink" }],
  veronica: [{ kind: "bloom", from: 6, to: 8, color: "purple" }],
  coreopsis: [{ kind: "bloom", from: 6, to: 9, color: "yellow" }],
  gaillardia: [{ kind: "bloom", from: 6, to: 9, color: "orange" }],
  salvia: [{ kind: "bloom", from: 6, to: 10, color: "red" }],
  hosta: [{ kind: "bloom", from: 6, to: 7, color: "lavender" }],
  clethra: [{ kind: "bloom", from: 7, to: 8, color: "white" }],
  buddleia: [{ kind: "bloom", from: 7, to: 9, color: "purple" }],
  hibiscus: [{ kind: "bloom", from: 7, to: 9, color: "lavender" }],

  // ---- late season ----
  sedum: [{ kind: "bloom", from: 8, to: 10, color: "rose" }],
  liriope: [{ kind: "bloom", from: 8, to: 9, color: "purple" }],
  osmanthus: [{ kind: "bloom", from: 9, to: 10, color: "white" }],
  callicarpa: [{ kind: "berry", from: 9, to: 11, color: "plum" }],
  hamamelis: [{ kind: "bloom", from: 10, to: 11, color: "yellow" }],

  // ---- berry + winter ----
  ilex: [{ kind: "berry", from: 10, to: 2, color: "red" }],
  nandina: [
    { kind: "berry", from: 10, to: 2, color: "red" },
    { kind: "foliage", from: 11, to: 3, color: "red" },
  ],

  // ---- fall colour trees ----
  acer: [{ kind: "fall", from: 10, to: 11, color: "red" }],
  quercus: [{ kind: "fall", from: 10, to: 11, color: "bronze" }],
  zelkova: [{ kind: "fall", from: 10, to: 11, color: "orange" }],
  carpinus: [{ kind: "fall", from: 10, to: 11, color: "gold" }],

  // ---- grasses: plumes then winter structure ----
  miscanthus: [{ kind: "plume", from: 8, to: 11, color: "cream" }],
  pennisetum: [{ kind: "plume", from: 8, to: 11, color: "bronze" }],
  panicum: [{ kind: "plume", from: 8, to: 11, color: "bronze" }],
  calamagrostis: [{ kind: "plume", from: 6, to: 11, color: "cream" }],
  schizachyrium: [{ kind: "plume", from: 9, to: 11, color: "bronze" }],
  andropogon: [{ kind: "plume", from: 9, to: 11, color: "bronze" }],
  sporobolus: [{ kind: "plume", from: 9, to: 10, color: "gold" }],
  muhlenbergia: [{ kind: "plume", from: 9, to: 10, color: "rose" }],
  deschampsia: [{ kind: "plume", from: 6, to: 8, color: "gold" }],
  leymus: [{ kind: "foliage", from: 4, to: 10, color: "silver" }],
  festuca: [{ kind: "foliage", from: 4, to: 10, color: "silver" }],
  carex: [{ kind: "foliage", from: 4, to: 10, color: "green" }],
  acorus: [{ kind: "foliage", from: 4, to: 10, color: "yellow" }],
  artemesia: [{ kind: "foliage", from: 4, to: 10, color: "silver" }],
  ophiopogon: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],

  // ---- structural evergreens ----
  thuja: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  juniperus: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  buxus: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  taxus: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  chamaecyparis: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  cryptomeria: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  cupressocyparis: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
  euonymus: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
};

/** Last-resort by category so evergreens still read as year-round structure. */
const CATEGORY_FALLBACK = {
  evergreens: [{ kind: "evergreen", from: 1, to: 12, color: "green" }],
};

export { genusOf };

/** Normalise a catalog bloom string ("Pink/White", "Red Berries") to a hex. */
function hexFromBloom(bloom) {
  const raw = String(bloom || "").toLowerCase().trim();
  if (!raw) return null;
  if (COLOR_HEX[raw]) return COLOR_HEX[raw];
  // Take the first word we recognise: "pink/white" → pink, "red berries" → red.
  for (const token of raw.split(/[\s/,-]+/)) {
    if (COLOR_HEX[token]) return COLOR_HEX[token];
  }
  return null;
}

function hexFor(colorKey) {
  return COLOR_HEX[colorKey] || COLOR_HEX.green;
}

/** Expand a possibly year-wrapping from→to into a list of 1-indexed months. */
function monthsIn(from, to) {
  const out = [];
  let m = from;
  for (let guard = 0; guard < 12; guard++) {
    out.push(m);
    if (m === to) break;
    m = m === 12 ? 1 : m + 1;
  }
  return out;
}

/**
 * Seasonal interest bands for one plant. Returns [] when we have no honest
 * timing for it — the caller counts those rather than guessing.
 */
export function interestFor(plant) {
  const bands = GENUS_INTEREST[genusOf(plant?.name)] || CATEGORY_FALLBACK[plant?.cat] || [];
  const catalogHex = hexFromBloom(plant?.bloom);
  return bands.map((b) => ({
    ...b,
    // A real catalog colour beats the genus default, but only for the flower/berry
    // itself — fall colour and evergreen green are not the bloom colour.
    hex: (b.kind === "bloom" || b.kind === "berry") && catalogHex ? catalogHex : hexFor(b.color),
    months: monthsIn(b.from, b.to),
  }));
}

const KIND_ORDER = ["bloom", "berry", "plume", "fall", "foliage", "evergreen"];

/**
 * Build the 12-month colour ribbon for a plan.
 *
 * Returns { months, peak, quietest, gaps, unknownCount, evergreenCount } where
 * each month has the swatches to draw and the plants responsible for them.
 */
export function bloomRibbon(items = []) {
  const months = MONTHS.map((label, i) => ({
    month: i + 1,
    label,
    long: MONTHS_LONG[i],
    swatches: [],
    plants: [],
    score: 0,
    evergreenOnly: false,
  }));

  let unknownCount = 0;
  let evergreenCount = 0;

  for (const item of items) {
    const bands = interestFor(item);
    if (!bands.length) {
      unknownCount += 1;
      continue;
    }
    if (bands.every((b) => b.kind === "evergreen")) evergreenCount += 1;

    for (const band of bands) {
      for (const m of band.months) {
        const slot = months[m - 1];
        slot.plants.push({
          sku: item.sku,
          name: shortName(item),
          genus: genusOf(item?.name),
          kind: band.kind,
          hex: band.hex,
        });
        if (band.kind !== "evergreen") {
          slot.score += INTEREST_KINDS[band.kind]?.weight || 1;
          if (!slot.swatches.some((s) => s.hex === band.hex && s.kind === band.kind)) {
            slot.swatches.push({ hex: band.hex, kind: band.kind });
          }
        }
      }
    }
  }

  for (const slot of months) {
    slot.swatches.sort(
      (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
    );
    slot.swatches = slot.swatches.slice(0, 4);
    slot.evergreenOnly = slot.swatches.length === 0 && slot.plants.length > 0;
    slot.headline = headlineFor(slot);
  }

  const scored = months.filter((m) => m.score > 0);
  const peak = scored.length
    ? scored.reduce((best, m) => (m.score > best.score ? m : best))
    : null;
  // Growing-season months with nothing going on are the honest, useful gaps.
  const gaps = months.filter((m) => m.score === 0 && m.month >= 3 && m.month <= 10);

  return {
    months,
    peak: peak ? { month: peak.month, label: peak.long } : null,
    gaps: gaps.map((m) => ({ month: m.month, label: m.long })),
    unknownCount,
    evergreenCount,
    coveredMonths: scored.length,
  };
}

/** Plain-English "what's happening" line for one month. */
function headlineFor(slot) {
  if (!slot.plants.length) return "Nothing yet";
  const kinds = new Set(slot.plants.map((p) => p.kind));
  // One entry per genus — "Hydrangea", not five near-identical hydrangeas.
  const names = [];
  const seenGenus = new Set();
  for (const p of slot.plants) {
    if (p.kind === "evergreen") continue;
    if (seenGenus.has(p.genus)) continue;
    seenGenus.add(p.genus);
    names.push(p.name);
  }
  if (!names.length) return "Evergreen structure";
  const lead = names.slice(0, 2).join(" + ");
  const more = names.length > 2 ? ` +${names.length - 2} more` : "";
  if (kinds.has("bloom")) return `${lead}${more} in bloom`;
  if (kinds.has("berry")) return `${lead}${more} in berry`;
  if (kinds.has("plume")) return `${lead}${more} in seed head`;
  if (kinds.has("fall")) return `${lead}${more} turning color`;
  return `${lead}${more}`;
}

/**
 * For each quiet month, the in-stock plant that would actually fix it.
 * This is the honest half of the pitch: we show the gap, then sell the cure.
 */
const GAP_KIND_COST = { bloom: 0, berry: 12, plume: 22, fall: 22, foliage: 60 };

export function gapFillers(ribbon, catalog = [], { exclude = [], limit = 2 } = {}) {
  if (!ribbon?.gaps?.length || !catalog.length) return [];
  const taken = new Set(exclude);
  const out = [];

  for (const gap of ribbon.gaps.slice(0, limit)) {
    let best = null;
    for (const plant of catalog) {
      if (taken.has(plant.sku)) continue;
      const bands = interestFor(plant);
      // Only real colour counts as filling a gap — evergreen green doesn't.
      const covering = bands.filter(
        (b) => b.kind !== "evergreen" && b.months.includes(gap.month)
      );
      if (!covering.length) continue;
      // A flower beats berries beats foliage; and a tight, showy window beats
      // something that would have been on all season anyway.
      const kindCost = Math.min(...covering.map((b) => GAP_KIND_COST[b.kind] ?? 60));
      const spread = bands.reduce((s, b) => s + b.months.length, 0);
      const score = (plant.price || 999) + spread * 4 + kindCost;
      if (!best || score < best.score) best = { plant, score };
    }
    if (best) {
      taken.add(best.plant.sku);
      out.push({ month: gap.month, label: gap.label, plant: best.plant });
    }
  }
  return out;
}

/**
 * Honest one-liner about the plan's year — used above the ribbon.
 * Never overstates: an evergreen-only plan is described as evergreen-only.
 */
export function ribbonSummary(ribbon) {
  if (!ribbon) return "";
  if (!ribbon.coveredMonths) {
    return "This plan is all evergreen structure — green every month, but no flower color.";
  }
  const peak = ribbon.peak ? `Peak color lands in ${ribbon.peak.label}.` : "";
  const span = `Something's happening ${ribbon.coveredMonths} months of the year.`;
  return `${span} ${peak}`.trim();
}
