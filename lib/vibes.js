/**
 * Plain-language front door to the designer.
 *
 * Nobody shopping for their front yard thinks "I'd like a four-season
 * structural foundation planting". They think "clean and modern". Vibes are the
 * words they'd actually use; each one maps to a real GARDENS template so the
 * plant list underneath stays honest and in-stock.
 *
 * Lifestyle chips are the second, optional row — real constraints (shade, kids,
 * water, fragrance) that nudge plant selection and the render prompt.
 */

import { genusOf, shortName } from "./plant-visuals";

/** Six vibes covering all seven garden templates (shade arrives via a chip). */
export const VIBES = [
  {
    key: "romantic",
    label: "Soft & romantic",
    hint: "Blowsy blooms, pinks and whites",
    garden: "cottage-garden",
    emoji: "🌸",
    prompt:
      "soft romantic cottage planting — layered pinks, whites and blues, blowsy flower heads, informal drifts",
  },
  {
    key: "modern",
    label: "Clean & modern",
    hint: "Simple shapes, tidy year-round",
    garden: "four-season",
    emoji: "▨",
    prompt:
      "clean modern planting — restrained palette, repeated shapes, crisp evergreen structure, generous spacing, tidy edges",
  },
  {
    key: "pollinator",
    label: "Pollinator party",
    hint: "Butterflies, bees, hummingbirds",
    garden: "butterfly-garden",
    emoji: "🦋",
    prompt:
      "nectar-rich pollinator planting — big drifts of flowers in bloom, butterflies and bees welcome, layered bloom times",
  },
  {
    key: "lowfuss",
    label: "Low fuss",
    hint: "Tough plants, little upkeep",
    garden: "pollinator-patch",
    emoji: "🌿",
    prompt:
      "low-maintenance planting — tough, forgiving plants, long bloom, minimal pruning or fussing",
  },
  {
    key: "wild",
    label: "Wild & native",
    hint: "Delaware natives, birds welcome",
    garden: "native-delaware",
    emoji: "🪶",
    prompt:
      "naturalistic native planting — loose meadow feel, native shrubs and grasses, berries for birds",
  },
  {
    key: "private",
    label: "Green & private",
    hint: "Screen the neighbours",
    garden: "privacy-screen",
    emoji: "🌲",
    prompt:
      "living privacy screen — layered evergreens of mixed heights forming a soft green wall along the property line",
  },
];

/** Optional one-row lifestyle chips. */
export const LIFESTYLE = [
  {
    key: "shady",
    label: "Shady spot",
    emoji: "☁️",
    garden: "shade-garden",
    prompt: "the bed is shaded or gets only morning sun — use shade-tolerant plants",
  },
  {
    key: "kids",
    label: "Kids & pets",
    emoji: "🧸",
    prompt: "kids and pets play here — avoid thorns and spiky foliage, keep everything soft to brush past",
  },
  {
    key: "deer",
    label: "Deer-resistant",
    emoji: "🦌",
    prompt:
      "deer browse nearby — prefer deer-resistant plants and avoid favorites like hosta, daylily, azalea, and hydrangea when possible",
  },
  {
    key: "lowwater",
    label: "Low water",
    emoji: "💧",
    prompt: "low-water planting — drought-tolerant once established, no thirsty plants",
  },
  {
    key: "fragrance",
    label: "Smells amazing",
    emoji: "🌼",
    prompt: "fragrance matters — include genuinely scented plants near the path or door",
  },
];

/**
 * Pull explicit constraints out of the free-text note so we can filter plants
 * and only display tags we actually applied.
 */
export function constraintsFromText(description = "") {
  const t = String(description || "").toLowerCase();
  if (!t.trim()) return { lifestyleKeys: [], notes: [] };
  const lifestyleKeys = [];
  const notes = [];
  if (/deer[- ]?resist|deer[- ]?proof|hide from deer|deer (keep|eat|browse|problem)/i.test(t)) {
    lifestyleKeys.push("deer");
    notes.push("deer-resistant");
  }
  if (/no thorn|nothing thorn|kids|toddlers|pets|dog|barefoot|soft to (the )?touch/i.test(t)) {
    lifestyleKeys.push("kids");
    notes.push("soft for kids & pets");
  }
  if (/shade|shady|north[- ]facing|little sun|not much sun/i.test(t)) {
    lifestyleKeys.push("shady");
    notes.push("shade-tolerant");
  }
  if (/drought|low[- ]water|xeric|dry (bed|spot|yard)/i.test(t)) {
    lifestyleKeys.push("lowwater");
    notes.push("low-water");
  }
  if (/fragranc|scented|smells? (amazing|good|sweet)|perfume/i.test(t)) {
    lifestyleKeys.push("fragrance");
    notes.push("fragrant");
  }
  return { lifestyleKeys: [...new Set(lifestyleKeys)], notes };
}
/**
 * Which way the garden faces / how much sun it gets.
 * Critical for plant choice in Zone 7 — afternoon west sun is harsh; north is cool shade.
 */
export const SUN_ASPECTS = [
  {
    key: "south",
    label: "South-facing",
    hint: "All-day sun",
    prompt:
      "the garden faces south and gets strong all-day sun — choose full-sun, heat-tolerant plants",
  },
  {
    key: "west",
    label: "West-facing",
    hint: "Hot afternoon sun",
    prompt:
      "the garden faces west with hot afternoon sun — prefer plants that handle heat and strong light",
  },
  {
    key: "east",
    label: "East-facing",
    hint: "Gentle morning sun",
    prompt:
      "the garden faces east with gentle morning sun and softer afternoons — part-sun plants thrive",
  },
  {
    key: "north",
    label: "North-facing",
    hint: "Mostly shade",
    garden: "shade-garden",
    prompt:
      "the garden faces north and stays mostly shaded — use shade-tolerant plants only",
  },
  {
    key: "unsure",
    label: "Not sure",
    hint: "We'll read the photo",
    prompt: "sun exposure is uncertain — infer light from the photo and choose forgiving plants",
  },
];

const VIBE_BY_KEY = new Map(VIBES.map((v) => [v.key, v]));
const LIFESTYLE_BY_KEY = new Map(LIFESTYLE.map((l) => [l.key, l]));
const SUN_BY_KEY = new Map(SUN_ASPECTS.map((s) => [s.key, s]));

export const VIBE_KEYS = VIBES.map((v) => v.key);
export const LIFESTYLE_KEYS = LIFESTYLE.map((l) => l.key);
export const SUN_KEYS = SUN_ASPECTS.map((s) => s.key);

export function vibeByKey(key) {
  return VIBE_BY_KEY.get(String(key || "")) || null;
}

export function sunByKey(key) {
  return SUN_BY_KEY.get(String(key || "")) || null;
}

export function sanitizeVibes(raw) {
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const key of list) {
    const v = vibeByKey(key);
    if (v && !out.includes(v.key)) out.push(v.key);
    if (out.length >= 2) break; // one primary + one accent, no more
  }
  return out;
}

export function sanitizeLifestyle(raw) {
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const key of list) {
    const k = String(key || "");
    if (LIFESTYLE_BY_KEY.has(k) && !out.includes(k)) out.push(k);
  }
  return out;
}

export function sanitizeSun(raw) {
  const k = String(raw || "").trim();
  return SUN_BY_KEY.has(k) ? k : "";
}

/**
 * Which garden template to build from. North / shady overrides the vibe's
 * template, because the wrong light kills a bed no matter how pretty the vibe.
 */
export function gardenSlugFor(vibeKeys = [], lifestyleKeys = [], sunKey = "") {
  if (lifestyleKeys.includes("shady") || sunKey === "north") return "shade-garden";
  const sun = sunByKey(sunKey);
  if (sun?.garden) return sun.garden;
  const primary = vibeByKey(vibeKeys[0]);
  return primary?.garden || "cottage-garden";
}

/** The human sentence we hand the model, built from what she actually tapped. */
export function briefFrom({
  vibeKeys = [],
  lifestyleKeys = [],
  sunKey = "",
  description = "",
} = {}) {
  const bits = [];
  for (const key of vibeKeys) {
    const v = vibeByKey(key);
    if (v) bits.push(v.prompt);
  }
  const sun = sunByKey(sunKey);
  if (sun) bits.push(sun.prompt);
  for (const key of lifestyleKeys) {
    const l = LIFESTYLE_BY_KEY.get(key);
    if (l) bits.push(l.prompt);
  }
  const own = String(description || "").trim();
  if (own) bits.push(`in her own words: "${own}"`);
  return bits.join("; ");
}

/** Short chip labels for the result screen ("Soft & romantic · Kids & pets"). */
export function chipLabels({ vibeKeys = [], lifestyleKeys = [], sunKey = "" } = {}) {
  return [
    ...vibeKeys.map((k) => vibeByKey(k)?.label).filter(Boolean),
    sunByKey(sunKey)?.label,
    ...lifestyleKeys.map((k) => LIFESTYLE_BY_KEY.get(k)?.label).filter(Boolean),
  ].filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Plant-level preference.
 *
 * Genus lists below are ordinary horticultural fact for Zone 7, not catalog
 * data — we only ever use them to re-rank plants Annie's already stocks, never
 * to claim something the catalog doesn't say.
 * ------------------------------------------------------------------ */

/** Thorny or sharp enough that a barefoot six-year-old would notice. */
const SPIKY = new Set(["rosa", "berberis", "ilex", "yucca", "juniperus"]);

/** Often browsed hard by deer in Zone 7 — deprioritize when asked for deer-resistant. */
const DEER_CANDY = new Set([
  "hosta", "hemerocallis", "azalea", "rhododendron", "hydrangea", "tulipa", "lilium",
  "euonymus", "taxus", "arborvitae", "thuja",
]);

/** Generally left alone by deer once established (not a guarantee). */
const DEER_TOUGH = new Set([
  "buxus", "narcissus", "lavandula", "salvia", "nepeta", "dryopteris", "athyrium",
  "helleborus", "paeonia", "tagetes", "buddleia", "spiraea", "berberis", "juniperus",
  "picea", "pinus", "leucanthemum", "achillea", "coreopsis", "gaillardia",
]);

/** Reliably drought-tolerant once established. */
const DROUGHT_TOUGH = new Set([
  "juniperus", "schizachyrium", "andropogon", "panicum", "sporobolus", "muhlenbergia",
  "festuca", "leymus", "sedum", "artemesia", "nepeta", "gaillardia", "coreopsis",
  "yucca", "rhus", "ceanothus", "berberis", "cotoneaster",
]);

/** Thirstier than average — first to sulk in a dry August. */
const THIRSTY = new Set(["hydrangea", "astilbe", "hosta", "salix", "iris", "carex", "acorus"]);

/** Genuinely fragrant — flower or foliage you can smell walking past. */
const FRAGRANT = new Set([
  "syringa", "clethra", "viburnum", "osmanthus", "rosa", "hamamelis",
  "lindera", "rhus", "nepeta", "tilia", "wisteria",
]);

/** Happy in shade or part shade. */
const SHADE_HAPPY = new Set([
  "hosta", "astilbe", "hydrangea", "azalea", "rhododendron", "taxus", "buxus",
  "carex", "ophiopogon", "liriope", "clethra", "lindera", "fothergilla",
  "hamamelis", "acer", "cornus",
]);

/** Wants real sun — will flop or stop blooming in shade. */
const SUN_HUNGRY = new Set([
  "rosa", "buddleia", "spiraea", "nepeta", "salvia", "sedum", "coreopsis",
  "gaillardia", "veronica", "hemerocallis", "schizachyrium", "andropogon",
  "panicum", "muhlenbergia", "yucca", "ceanothus",
]);

/**
 * Genera worth pulling into the candidate pool for these chips.
 * Without this, asking for fragrance can't help if no fragrant plant was ever
 * a candidate — the chip would be decoration.
 */
export function preferredGeneraFor(lifestyleKeys = []) {
  const out = new Set();
  if (lifestyleKeys.includes("fragrance")) FRAGRANT.forEach((g) => out.add(g));
  if (lifestyleKeys.includes("lowwater")) DROUGHT_TOUGH.forEach((g) => out.add(g));
  if (lifestyleKeys.includes("shady")) SHADE_HAPPY.forEach((g) => out.add(g));
  if (lifestyleKeys.includes("deer")) DEER_TOUGH.forEach((g) => out.add(g));
  // Never pre-load something she asked us to avoid.
  if (lifestyleKeys.includes("kids")) SPIKY.forEach((g) => out.delete(g));
  if (lifestyleKeys.includes("lowwater")) THIRSTY.forEach((g) => out.delete(g));
  if (lifestyleKeys.includes("deer")) DEER_CANDY.forEach((g) => out.delete(g));
  return out;
}

/**
 * Score a plant against the chosen lifestyle chips.
 * Positive = prefer, negative = push down the list. 0 when nothing applies.
 */
export function lifestyleScore(plant, lifestyleKeys = []) {
  if (!lifestyleKeys.length) return 0;
  const g = genusOf(plant?.name);
  let score = 0;

  if (lifestyleKeys.includes("kids") && SPIKY.has(g)) score -= 3;
  if (lifestyleKeys.includes("deer")) {
    if (DEER_TOUGH.has(g)) score += 3;
    if (DEER_CANDY.has(g)) score -= 5;
  }
  if (lifestyleKeys.includes("lowwater")) {
    if (DROUGHT_TOUGH.has(g)) score += 2;
    if (THIRSTY.has(g)) score -= 3;
  }
  if (lifestyleKeys.includes("fragrance") && FRAGRANT.has(g)) score += 3;
  if (lifestyleKeys.includes("shady")) {
    if (SHADE_HAPPY.has(g)) score += 2;
    if (SUN_HUNGRY.has(g)) score -= 4;
  }
  return score;
}

/**
 * Re-rank and trim a scaled plan by lifestyle fit.
 * Drops only clearly-wrong plants (a rose in deep shade, a thorny barberry
 * where toddlers play) and never empties the bed.
 */
export function applyLifestyle(plan, lifestyleKeys = []) {
  if (!lifestyleKeys.length || !plan?.plants?.length) return plan;

  const scored = plan.plants.map((p) => ({ plant: p, score: lifestyleScore(p, lifestyleKeys) }));
  const keep = scored.filter((s) => s.score > -3);
  const chosen = (keep.length >= 3 ? keep : scored)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.plant);

  return { ...plan, plants: chosen };
}

/** "Astilbe and Hosta" — up to two names, one per genus. */
function nameList(plants) {
  const seen = new Set();
  const names = [];
  for (const p of plants) {
    const g = genusOf(p.name);
    if (seen.has(g)) continue;
    seen.add(g);
    names.push(shortName(p));
    if (names.length === 2) break;
  }
  return names.length === 2 ? `${names[0]} and ${names[1]}` : names[0];
}

/**
 * What the chips actually delivered — checked against the finished plan, not
 * the buttons she pressed. If a shade bed ended up with thirsty astilbe, we say
 * so rather than printing "drought-tough" over a plant that isn't.
 */
export function lifestyleNote(lifestyleKeys = [], plants = []) {
  const matching = (set) => plants.filter((p) => set.has(genusOf(p.name)));
  const out = [];

  for (const key of lifestyleKeys) {
    if (key === "shady") out.push("picked for shade");

    if (key === "kids") {
      const spiky = matching(SPIKY);
      out.push(spiky.length ? `mostly soft — mind the ${nameList(spiky)}` : "nothing thorny");
    }

    if (key === "deer") {
      const candy = matching(DEER_CANDY);
      out.push(
        candy.length
          ? `aimed deer-resistant — still watch the ${nameList(candy)} in a hungry winter`
          : "picked for deer resistance"
      );
    }

    if (key === "lowwater") {
      const thirsty = matching(THIRSTY);
      out.push(
        thirsty.length
          ? `drought-tough except the ${nameList(thirsty)}, which will want water in a dry spell`
          : "drought-tough once established"
      );
    }

    if (key === "fragrance") {
      const fragrant = matching(FRAGRANT);
      out.push(
        fragrant.length
          ? `fragrant: ${nameList(fragrant)}`
          : "no truly fragrant plant fit this budget — ask us and we'll swap one in"
      );
    }
  }

  return out.join(" · ");
}
