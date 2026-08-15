/**
 * Plant visual language for the two-stage designer imagery.
 *
 * The emotional core of the product is an honest "install day" vs "full bloom"
 * comparison. Both stages are driven off real inventory fields:
 *   - `size`  → the container + height a customer actually receives (install day)
 *   - `cat`   → mature footprint / habit (full bloom)
 *   - `bloom` → flower colour / interest (full bloom)
 *
 * Kept dependency-free and framework-agnostic so the whole designer pipeline
 * can be lifted into a standalone SaaS without dragging the site along.
 */

/** First word of a botanical name, lowercased: "Clethra alnifolia" → "clethra". */
export function genusOf(name = "") {
  return String(name).trim().split(/[\s',]/)[0].replace(/[^A-Za-z-]/g, "").toLowerCase();
}

/**
 * Garden-centre English for a botanical genus. A tired mom should never have to
 * read "Clethra alnifolia" to know she's getting summersweet.
 */
const COMMON_NAMES = {
  acer: "Maple",
  acorus: "Sweet Flag",
  andropogon: "Big Bluestem",
  aronia: "Chokeberry",
  artemesia: "Silver Mound",
  astilbe: "Astilbe",
  azalea: "Azalea",
  berberis: "Barberry",
  buddleia: "Butterfly Bush",
  buxus: "Boxwood",
  calamagrostis: "Feather Reed Grass",
  callicarpa: "Beautyberry",
  carex: "Sedge",
  carpinus: "Hornbeam",
  ceanothus: "New Jersey Tea",
  cercis: "Redbud",
  chamaecyparis: "False Cypress",
  clethra: "Summersweet",
  cornus: "Dogwood",
  corylus: "Hazelnut",
  cotoneaster: "Cotoneaster",
  cryptomeria: "Japanese Cedar",
  cupressocyparis: "Leyland Cypress",
  deschampsia: "Tufted Hair Grass",
  deutzia: "Deutzia",
  diervilla: "Bush Honeysuckle",
  euonymus: "Euonymus",
  festuca: "Blue Fescue",
  forsythia: "Forsythia",
  fothergilla: "Fothergilla",
  gaillardia: "Blanket Flower",
  hamamelis: "Witch Hazel",
  hemerocallis: "Daylily",
  hibiscus: "Rose of Sharon",
  hosta: "Hosta",
  hydrangea: "Hydrangea",
  ilex: "Holly",
  iris: "Iris",
  juniperus: "Juniper",
  leymus: "Blue Lyme Grass",
  ligustrum: "Privet",
  lindera: "Spicebush",
  liriope: "Lilyturf",
  malus: "Apple",
  miscanthus: "Maiden Grass",
  muhlenbergia: "Muhly Grass",
  nandina: "Heavenly Bamboo",
  nepeta: "Catmint",
  ophiopogon: "Mondo Grass",
  osmanthus: "False Holly",
  panicum: "Switchgrass",
  pennisetum: "Fountain Grass",
  prunus: "Cherry Laurel",
  pyrus: "Ornamental Pear",
  quercus: "Oak",
  rhododendron: "Rhododendron",
  rhus: "Fragrant Sumac",
  rosa: "Rose",
  salix: "Dappled Willow",
  salvia: "Salvia",
  schizachyrium: "Little Bluestem",
  sedum: "Stonecrop",
  spiraea: "Spirea",
  sporobolus: "Prairie Dropseed",
  syringa: "Lilac",
  taxus: "Yew",
  thuja: "Arborvitae",
  tilia: "Linden",
  veronica: "Speedwell",
  viburnum: "Viburnum",
  weigela: "Weigela",
  wisteria: "Wisteria",
  yucca: "Yucca",
  zelkova: "Zelkova",
};

/**
 * The cultivar out of a botanical name:
 *   "Hydrangea panic. 'Limelight'"            → "Limelight"
 *   "Hydrangea macro. Endless Summer®(PP15…)" → "Endless Summer"
 *   "Clethra alnifolia"                       → null (species only)
 */
function cultivarOf(name = "") {
  // Greedy on purpose: cultivars contain apostrophes ("Stella D'Oro"), so we
  // take everything from the first quote to the last one.
  const quoted = String(name).match(/['"](.{2,})['"]/);
  if (quoted) return quoted[1].trim();

  const cleaned = String(name)
    .replace(/\([^)]*\)/g, " ") // patent numbers
    .replace(/[®™©]/g, " ")
    .trim();

  // Drop the genus, then any lowercase species epithet ("alnifolia", "macro.", "x").
  const words = cleaned.split(/\s+/).slice(1).filter((w) => w && !/^[a-z]/.test(w));
  return words.length ? words.join(" ") : null;
}

/**
 * Customer-facing plant name: "Hydrangea panic. 'Limelight'" → "Limelight Hydrangea".
 * Falls back to the catalog name when we have no common name for the genus.
 */
/** A few genera mean different plants in different aisles. */
const COMMON_BY_CAT = {
  prunus: { trees: "Flowering Cherry" },
  acer: { trees: "Maple" },
};

function isJapaneseMaple(name = "") {
  return /palm|dissectum|japonic/i.test(String(name));
}

export function friendlyName(plant) {
  const raw = String(plant?.name || "").trim();
  if (!raw) return "";
  const genus = genusOf(raw);
  let common = COMMON_BY_CAT[genus]?.[plant?.cat] || COMMON_NAMES[genus];
  if (genus === "acer" && isJapaneseMaple(raw)) common = "Japanese Maple";
  if (!common) return raw;
  const cultivar = cultivarOf(raw);
  if (!cultivar) return common;
  if (cultivar.toLowerCase() === common.toLowerCase()) return common;
  return `${cultivar} ${common}`;
}

/**
 * Compact label for tight spaces (ribbon headlines, hotspot pins). Drops the
 * cultivar rather than truncating mid-name — "Heavenly Bamboo", never
 * "Fire Power Heavenly".
 */
export function shortName(plant) {
  const full = friendlyName(plant);
  if (full.split(/\s+/).length <= 3) return full;
  const genus = genusOf(plant?.name);
  return (
    COMMON_BY_CAT[genus]?.[plant?.cat] ||
    COMMON_NAMES[genus] ||
    full.split(/\s+/).slice(0, 3).join(" ")
  );
}

/**
 * Mature habit per category — what the plant looks like at full maturity, AS A
 * MAINTAINED LANDSCAPE PLANT: pruned and kept to a tidy residential scale, the
 * way an actual homeowner's foundation planting looks, not an unpruned
 * specimen left to grow wild. Heights are deliberately the maintained range,
 * not the species' unpruned ceiling.
 */
const MATURE_HABIT = {
  trees: { form: "an established young specimen tree, pruned and shaping up nicely — still filling out at this age, not full 10+ year landscape maturity", height: "6–9 ft tall" },
  evergreens: { form: "a dense evergreen, trimmed and kept to a tidy landscape size", height: "4–7 ft tall" },
  shrubs: { form: "a full, rounded flowering shrub, pruned to a tidy landscape size", height: "3–4 ft tall and wide" },
  roses: { form: "an established rose bush covered in blooms, kept pruned and tidy", height: "3 ft tall and wide" },
  perennials: { form: "a lush, established perennial clump in full flower", height: "1–2.5 ft tall" },
  grasses: { form: "a full, arching ornamental grass", height: "2–3 ft tall" },
};

const DEFAULT_HABIT = { form: "an established, well-filled plant", height: "2–3 ft tall" };

/** How a plant reads on the day it is planted, by category. */
const INSTALL_HABIT = {
  trees: "a freshly-planted young tree, true to its actual nursery delivery size (larger caliper stock already has real height and structure — not artificially small)",
  evergreens: "a small young evergreen, open and not yet dense",
  shrubs: "a compact young shrub in a nursery pot's worth of foliage, gaps between plants",
  roses: "a young rose with a few canes and light foliage",
  perennials: "a small starter perennial, low mound, not yet spread",
  grasses: "a small young grass clump, thin and upright",
};

const DEFAULT_INSTALL = "a small, freshly-planted young plant with visible mulch around it";

const ZONE_PLACEMENT = {
  back: "toward the back of the bed as height/structure",
  mid: "through the middle of the bed",
  front: "toward the front, lower edge of the bed",
  edge: "spilling along the very front edge / border",
};

function cleanBloom(bloom) {
  const b = String(bloom || "").trim();
  if (!b || /^(foliage|year-?round|none|n\/?a)$/i.test(b)) return null;
  return b;
}

/** Strip Shopify option junk like "Buy In" from catalog size labels. */
export function cleanSizeLabel(size) {
  const s = String(size || "")
    .replace(/\bbuy\s*in\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return s || null;
}

/** e.g. "3 gal. 15-18\"" or "1 gallon Buy In" → "3-gallon" / "1-gallon, about 15–18 in tall". */
function readableSize(size) {
  const s = cleanSizeLabel(size);
  if (!s) return null;
  return s
    .replace(/(\d+)\s*gal(?:lon)?s?\.?\b/gi, "$1-gallon")
    .replace(/(\d+)\s*-\s*(\d+)\s*["”]/g, "$1–$2 in tall")
    .replace(/\s+/g, " ")
    .trim();
}

/** Customer-facing size for shop cards and cart lines. */
export function displaySize(size) {
  return readableSize(size) || cleanSizeLabel(size) || "";
}

export function bloomDescriptor(plant) {
  const bloom = cleanBloom(plant?.bloom);
  if (!bloom) return null;
  // Single word colours read as "pink blooms"; phrases pass through.
  if (/^[A-Za-z]+$/.test(bloom)) return `${bloom.toLowerCase()} blooms`;
  return bloom.toLowerCase();
}

/** One line describing a plant AS IT ARRIVES (install day) for image prompts. */
export function installLine(plant) {
  const habit = INSTALL_HABIT[plant?.cat] || DEFAULT_INSTALL;
  const size = readableSize(plant?.size);
  const sizeStr = size ? ` (${size})` : "";
  return `${plant.qty}× ${plant.name}${sizeStr} — ${habit}, placed ${ZONE_PLACEMENT[plant.zone] || ZONE_PLACEMENT.mid}`;
}

/** One line describing a plant AT FULL MATURITY / BLOOM for image prompts. */
export function bloomLineFor(plant) {
  const habit = MATURE_HABIT[plant?.cat] || DEFAULT_HABIT;
  const bloom = bloomDescriptor(plant);
  const bloomStr = bloom ? `, showing ${bloom}` : "";
  return `${plant.qty}× ${plant.name} — ${habit.form}, kept trimmed and maintained (NOT wild/overgrown), ${habit.height}${bloomStr}, ${ZONE_PLACEMENT[plant.zone] || ZONE_PLACEMENT.mid}`;
}

/** First-summer look — filling in, not yet full glory. */
export function summerLineFor(plant) {
  const habit = MATURE_HABIT[plant?.cat] || DEFAULT_HABIT;
  const bloom = bloomDescriptor(plant);
  const bloomStr = bloom ? `, with early ${bloom}` : "";
  return `${plant.qty}× ${plant.name} — filling in toward ${habit.form}, roughly half to two-thirds of mature size (${habit.height}), tidy and maintained${bloomStr}, ${ZONE_PLACEMENT[plant.zone] || ZONE_PLACEMENT.mid}`;
}

/** Short customer-facing habit note (used under plant-list rows). */
export function habitNote(plant) {
  const size = readableSize(plant?.size);
  const bloom = bloomDescriptor(plant);
  const mature = (MATURE_HABIT[plant?.cat] || DEFAULT_HABIT).height;
  const bits = [];
  if (size) bits.push(`Arrives ${size}`);
  // Category-average figure, not a per-species measurement — hedge it (P0-2c).
  bits.push(`typically matures to ${mature}`);
  if (bloom) bits.push(bloom);
  return bits.join(" · ");
}

/** Palette summary — the dominant bloom colours across the plan (for prompts + copy). */
export function paletteSummary(plants = []) {
  const colours = [];
  for (const p of plants) {
    const b = cleanBloom(p.bloom);
    if (b && /^[A-Za-z]+$/.test(b)) {
      const c = b.toLowerCase();
      if (!colours.includes(c)) colours.push(c);
    }
  }
  return colours.slice(0, 5);
}
