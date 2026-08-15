import { plantBySku, PLANTS, DESIGNER_IN_STOCK_SKUS } from "./inventory";
import { ZONES, SHAPE_KEYS } from "./garden-meta";
import { friendlyName, shortName, genusOf } from "./plant-visuals";

/** Approx mature coverage (ft²) per plant by category. */
const FT2_PER_PLANT = {
  trees: 80,
  evergreens: 25,
  shrubs: 16,
  roses: 12,
  perennials: 4,
  grasses: 6,
};

const DEFAULT_FT2 = 12;

function oddClamp(n, min, max) {
  let q = Math.round(Number(n) || 0);
  if (q < min) q = min;
  if (q > max) q = max;
  if (q > 1 && q % 2 === 0) q -= 1; // prefer odd groupings
  return Math.max(min, q);
}

function coverageFor(plant) {
  return FT2_PER_PLANT[plant?.cat] || DEFAULT_FT2;
}

function defaultZone(plant) {
  if (!plant) return "mid";
  if (plant.cat === "trees" || plant.cat === "evergreens") return "back";
  if (plant.cat === "perennials" || plant.cat === "grasses" || plant.cat === "roses") return "front";
  if (plant.cat === "shrubs") return "mid";
  return "mid";
}

/* ------------------------------------------------------------------ *
 * Candidate pool.
 *
 * The templates are shopping lists, not designs — "cottage-garden" is eleven
 * hydrangeas and a deutzia. Planting that verbatim gives a customer six of the
 * same shrub and a bed that's bare nine months a year. So we keep the
 * template's character, cap how many of any one genus can appear, and top up
 * with in-stock plants that give the bed real layers.
 * ------------------------------------------------------------------ */

/** Roughly how many distinct plants of each category a good bed wants. */
const DEFAULT_MIX = { evergreens: 2, shrubs: 4, perennials: 3, grasses: 2, roses: 1, trees: 1 };

const MIX_BY_GARDEN = {
  // A screen is evergreens; a flowering fruit tree in the hedge helps nobody.
  "privacy-screen": { evergreens: 8, shrubs: 2, trees: 0, grasses: 0, perennials: 0, roses: 0 },
  "four-season": { evergreens: 4, shrubs: 3, grasses: 2, perennials: 2, trees: 1, roses: 0 },
  "shade-garden": { evergreens: 2, shrubs: 4, perennials: 4, grasses: 1, trees: 1, roses: 0 },
};

/** Colour first, then affordability — cheap perennials are how a bed fills in. */
function fillerRank(a, b) {
  const colour = (p) => (p.bloom ? 0 : 1);
  return colour(a) - colour(b) || a.price - b.price;
}

/**
 * Build the SKU pool a plan may draw from: the template's own plants, capped by
 * genus, topped up to a layered mix from in-stock inventory.
 */
export function buildPlantPool(
  garden,
  { maxPerGenus = 2, limit = 12, preferGenera = null, preferLimit = 2 } = {}
) {
  const mix = { ...DEFAULT_MIX, ...(MIX_BY_GARDEN[garden?.slug] || {}) };
  const genusCount = new Map();
  const catCount = {};
  const handles = new Set();
  const pool = [];

  const add = (p, respectMix) => {
    if (!p || handles.has(p.handle) || p.availableForSale === false) return false;
    const g = genusOf(p.name);
    if ((genusCount.get(g) || 0) >= maxPerGenus) return false;
    if (respectMix && (catCount[p.cat] || 0) >= (mix[p.cat] ?? 0)) return false;
    genusCount.set(g, (genusCount.get(g) || 0) + 1);
    catCount[p.cat] = (catCount[p.cat] || 0) + 1;
    handles.add(p.handle);
    pool.push(p);
    return true;
  };

  // 1. The template defines the look — it goes in first.
  for (const sku of garden?.skus || []) {
    if (pool.length >= limit) break;
    add(plantBySku(sku), true);
  }

  const catalog = PLANTS.filter((p) => DESIGNER_IN_STOCK_SKUS.includes(p.sku)).sort(fillerRank);

  // 2. Honour the lifestyle chips before the generic top-up, ignoring the mix
  //    caps — a fragrance request has to be able to add a lilac.
  if (preferGenera?.size) {
    let added = 0;
    for (const p of catalog) {
      if (added >= preferLimit || pool.length >= limit) break;
      if (!preferGenera.has(genusOf(p.name))) continue;
      if (add(p, false)) added += 1;
    }
  }

  // 3. Top up the layers the template is still missing.
  for (const cat of Object.keys(mix)) {
    for (const p of catalog) {
      if (pool.length >= limit) break;
      if ((catCount[cat] || 0) >= mix[cat]) break;
      if (p.cat !== cat) continue;
      add(p, true);
    }
  }

  return pool.map((p) => p.sku);
}

/**
 * Scale a garden's SKU list to a target square footage.
 * Uses category coverage weights; returns [{ sku, qty, zone, name, price, ...plant }].
 */
export function scaleGardenPlan({ garden, sqFt = 200, shape = "rectangle", maxSkus = 10 }) {
  const area = Math.min(1500, Math.max(25, Math.floor(Number(sqFt) || 200)));
  const skus = (garden?.skus || []).slice(0, 24);
  const plants = skus.map(plantBySku).filter(Boolean);

  // Dedupe by handle so we don't stock 4 sizes of the same hydrangea
  const seen = new Set();
  const unique = [];
  for (const p of plants) {
    if (seen.has(p.handle)) continue;
    seen.add(p.handle);
    unique.push(p);
    if (unique.length >= maxSkus) break;
  }

  if (!unique.length) return { sqFt: area, shape: normalizeShape(shape), plants: [], subtotal: 0 };

  // Privacy screens lean evergreen-heavy
  const isPrivacy = garden?.slug === "privacy-screen";
  const weights = unique.map((p) => {
    let w = 1 / coverageFor(p);
    if (isPrivacy && (p.cat === "evergreens" || p.cat === "trees")) w *= 1.6;
    if (!isPrivacy && p.cat === "trees") w *= 0.45; // fewer trees in flower beds
    return w;
  });
  const weightSum = weights.reduce((s, w) => s + w, 0) || 1;

  // Target plant-slots ≈ area / average coverage, then distribute
  const avgCov =
    unique.reduce((s, p) => s + coverageFor(p), 0) / unique.length || DEFAULT_FT2;
  const targetSlots = Math.max(unique.length, Math.round(area / avgCov));

  const lines = unique.map((p, i) => {
    const share = weights[i] / weightSum;
    let qty = targetSlots * share;
    if (p.cat === "trees") qty = Math.min(qty, area < 200 ? 1 : 2);
    if (p.cat === "evergreens" && isPrivacy) {
      qty = oddClamp(qty, 3, 21);
    } else if (p.cat === "trees") {
      qty = oddClamp(qty, 1, 3);
    } else if (p.cat === "perennials" || p.cat === "grasses") {
      qty = oddClamp(qty, 3, 25);
    } else {
      qty = oddClamp(qty, 1, 15);
    }
    return {
      sku: p.sku,
      name: p.name,
      qty,
      price: p.price,
      variantId: p.variantId || null,
      art: p.art,
      size: p.size,
      cat: p.cat,
      bloom: p.bloom || "",
      zone: defaultZone(p),
      handle: p.handle,
    };
  });

  // Trim if overshooting budget coverage badly
  let covered = lines.reduce((s, l) => s + l.qty * coverageFor(l), 0);
  if (covered > area * 1.35) {
    const scale = (area * 1.1) / covered;
    for (const l of lines) {
      if (l.cat === "trees") continue;
      l.qty = oddClamp(l.qty * scale, l.cat === "perennials" || l.cat === "grasses" ? 3 : 1, l.qty);
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const normShape = normalizeShape(shape);
  return {
    sqFt: area,
    shape: normShape,
    gardenSlug: garden?.slug || null,
    plants: lines,
    subtotal: Math.round(subtotal),
    map: buildMapLayout(lines, normShape, area),
  };
}

export function normalizeShape(shape) {
  const s = String(shape || "rectangle");
  if (SHAPE_KEYS.includes(s)) return s;
  return "rectangle";
}

/** Minimum sensible quantity so a plant still reads as an intentional group. */
function minQtyFor(plant) {
  if (plant?.cat === "perennials" || plant?.cat === "grasses") return 3;
  return 1;
}

/** Lower = drop first. Keep structure (trees/evergreens) and back/mid before fillers. */
function keepImportance(plant) {
  if (plant?.cat === "trees" || plant?.cat === "evergreens") return 3;
  if (plant?.zone === "back" || plant?.zone === "mid") return 2;
  return 1;
}

/**
 * Fit a scaled plan to a dollar budget while keeping the design coherent.
 * 1) trim the most expensive line-items down toward their minimums,
 * 2) only if still over, drop the least-important filler lines.
 * Returns budget context (withinBudget / over / under) for the UI.
 */
export function applyBudget(plan, budget) {
  const b = Number(budget);
  if (!Number.isFinite(b) || b <= 0) {
    const st = Math.round(plan.plants.reduce((s, p) => s + p.price * p.qty, 0));
    return { ...plan, subtotal: st, budget: null, withinBudget: true, over: 0, under: 0 };
  }

  let plants = plan.plants.map((p) => ({ ...p }));
  const subtotal = () => plants.reduce((s, p) => s + p.price * p.qty, 0);

  // 1) Shave quantities from the costliest lines that are above their minimum.
  let guard = 0;
  while (subtotal() > b && guard++ < 400) {
    const reducible = plants
      .filter((p) => p.qty > minQtyFor(p))
      .sort((a, c) => c.price * c.qty - a.price * a.qty);
    if (!reducible.length) break;
    reducible[0].qty -= 1;
  }

  // 2) Still over (tiny budget): drop least-important, most expensive fillers.
  guard = 0;
  while (subtotal() > b && plants.length > 1 && guard++ < 400) {
    plants = [...plants].sort(
      (a, c) => keepImportance(a) - keepImportance(c) || c.price - a.price
    );
    plants.shift();
  }

  const st = Math.round(subtotal());
  const rounded = Math.round(b);
  return {
    ...plan,
    plants,
    subtotal: st,
    budget: rounded,
    withinBudget: st <= rounded,
    over: Math.max(0, st - rounded),
    under: Math.max(0, rounded - st),
    map: buildMapLayout(plants, plan.shape, plan.sqFt),
  };
}

export function normalizeZone(zone) {
  const z = String(zone || "").toLowerCase();
  return ZONES.includes(z) ? z : null;
}

/**
 * Rehydrate a client-sent plant list ([{ sku, qty, zone }]) from authoritative
 * inventory data. Used by the image routes so prompt details (name, size,
 * bloom, category) can't be tampered with from the browser.
 */
export function hydratePlantList(items = []) {
  const out = [];
  for (const it of Array.isArray(items) ? items : []) {
    const info = plantBySku(it?.sku);
    if (!info) continue;
    out.push({
      sku: info.sku,
      name: info.name,
      cat: info.cat,
      size: info.size,
      bloom: info.bloom || "",
      price: info.price,
      qty: Math.max(1, Math.min(60, Math.floor(Number(it?.qty) || 1))),
      zone: normalizeZone(it?.zone) || defaultZone(info),
    });
  }
  return out;
}

/** Merge Gemini suggestions onto a scaled base plan (server clamps). */
export function mergeAiPlantSuggestions(basePlan, aiPlants = [], allowedSkus = []) {
  const allow = new Set(allowedSkus.length ? allowedSkus : basePlan.plants.map((p) => p.sku));
  const bySku = new Map(basePlan.plants.map((p) => [p.sku, { ...p }]));

  for (const a of aiPlants) {
    if (!allow.has(a.sku)) continue;
    const info = plantBySku(a.sku);
    if (!info) continue;
    const zone = normalizeZone(a.zone) || normalizeZone(a.placement) || defaultZone(info);
    const existing = bySku.get(a.sku);
    const qty = oddClamp(a.qty ?? existing?.qty ?? 1, 1, 50);
    bySku.set(a.sku, {
      sku: a.sku,
      name: info.name,
      qty,
      price: info.price,
      variantId: info.variantId || null,
      art: info.art,
      size: info.size,
      cat: info.cat,
      bloom: info.bloom || "",
      zone,
      handle: info.handle,
    });
  }

  const plants = [...bySku.values()];
  const subtotal = Math.round(plants.reduce((s, l) => s + l.price * l.qty, 0));
  return {
    ...basePlan,
    plants,
    subtotal,
    map: buildMapLayout(plants, basePlan.shape, basePlan.sqFt),
  };
}

/**
 * Layout markers for PlantingMap SVG.
 * Returns { shape, sqFt, markers: [{ sku, label, qty, zone, x, y }] } with x/y in 0–100.
 */
export function buildMapLayout(plants, shape = "rectangle", sqFt = 200) {
  const markers = [];
  const zoneRows = { back: 18, mid: 45, front: 72, edge: 88 };
  const zoneBuckets = { back: [], mid: [], front: [], edge: [] };

  for (const p of plants) {
    const z = normalizeZone(p.zone) || defaultZone(p);
    zoneBuckets[z].push(p);
  }

  for (const [zone, list] of Object.entries(zoneBuckets)) {
    const n = list.length || 1;
    list.forEach((p, i) => {
      let x = ((i + 1) / (n + 1)) * 100;
      let y = zoneRows[zone];

      if (shape === "border") {
        y = 25 + (["back", "mid", "front", "edge"].indexOf(zone) / 3) * 55;
      } else if (shape === "island" || shape === "circle") {
        const angle = ((i + 0.5) / n) * Math.PI * 2;
        const r = zone === "back" ? 16 : zone === "mid" ? 28 : zone === "front" ? 38 : 44;
        x = 50 + Math.cos(angle) * r;
        y = 50 + Math.sin(angle) * r * 0.85;
      } else if (shape === "L-shape") {
        if (i % 2 === 0) {
          x = 18;
          y = 20 + (i / Math.max(n - 1, 1)) * 60;
        } else {
          x = 30 + ((i - 1) / Math.max(n - 1, 1)) * 55;
          y = 78;
        }
        if (zone === "back") y = Math.min(y, 40);
        if (zone === "front" || zone === "edge") y = Math.max(y, 65);
      } else if (shape === "U-shape" || shape === "horseshoe") {
        const t = (i + 0.5) / n;
        if (t < 0.33) {
          x = 18;
          y = 20 + t * 3 * 55;
        } else if (t < 0.66) {
          x = 20 + (t - 0.33) * 3 * 60;
          y = 78;
        } else {
          x = 82;
          y = 75 - (t - 0.66) * 3 * 55;
        }
        if (zone === "back") y = Math.min(y, 35);
      } else if (shape === "corner") {
        x = 15 + (i / Math.max(n - 1, 1)) * 35;
        y = 15 + ((n - 1 - i) / Math.max(n - 1, 1)) * 35;
        if (zone === "front") {
          x = 20 + i * 12;
          y = 70;
        }
        if (zone === "edge") {
          x = 70;
          y = 20 + i * 12;
        }
      } else if (shape === "kidney" || shape === "crescent") {
        const t = (i + 0.5) / (n + 1);
        const angle = Math.PI * 0.15 + t * Math.PI * 0.7;
        const r = zone === "back" ? 22 : zone === "mid" ? 32 : 40;
        x = 50 + Math.cos(angle) * r * (shape === "crescent" ? 1.1 : 1);
        y = 55 + Math.sin(angle) * r * 0.7 - (zone === "back" ? 8 : 0);
      }

      markers.push({
        sku: p.sku,
        label: abbrev(p.name),
        qty: p.qty,
        zone,
        x: Math.round(Math.min(92, Math.max(8, x)) * 10) / 10,
        y: Math.round(Math.min(90, Math.max(10, y)) * 10) / 10,
      });
    });
  }

  return { shape, sqFt, markers };
}

/* ------------------------------------------------------------------ *
 * Tap-the-garden hotspots.
 *
 * The render is a photo, not a diagram, so pin positions are an informed
 * approximation: the plan model tells us where the bed sits in the frame
 * (bedBox) and we lay the planting zones out inside it — tall structure toward
 * the back of the bed, edging plants along the front.
 * ------------------------------------------------------------------ */

/** Where each zone sits within the bed, as a fraction of the bed's height. */
const ZONE_DEPTH = { back: 0.16, mid: 0.44, front: 0.7, edge: 0.9 };

const clampUnit = (n) => Math.min(0.96, Math.max(0.06, n));

/**
 * Place up to `limit` tappable pins over the render.
 * Returns [{ sku, name, label, qty, zone, x, y }] with x/y as % of the image.
 */
export function hotspotsFor(plants = [], bedBox, { limit = 7 } = {}) {
  const box = bedBox || { x: 10, y: 55, w: 80, h: 36 };
  if (!plants.length) return [];

  // One pin per distinct plant, biggest visual presence first.
  const seen = new Set();
  const ranked = [...plants]
    .filter((p) => {
      const key = p.handle || p.sku;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.price * b.qty - a.price * a.qty)
    .slice(0, limit);

  const buckets = { back: [], mid: [], front: [], edge: [] };
  for (const p of ranked) {
    buckets[normalizeZone(p.zone) || defaultZone(p)].push(p);
  }

  const pins = [];
  for (const [zone, list] of Object.entries(buckets)) {
    const n = list.length;
    list.forEach((p, i) => {
      // Spread across the bed's width, and stagger alternate rows so pins in
      // neighbouring zones don't stack on top of each other.
      const stagger = zone === "mid" || zone === "edge" ? 0.5 / (n + 1) : 0;
      const across = (i + 1) / (n + 1) + stagger;
      const x = box.x + Math.min(0.94, Math.max(0.06, across)) * box.w;
      // Nudge alternate pins forward/back so a row of five doesn't read as a
      // ruler line drawn across the photo.
      const drift = (i % 2 === 0 ? -1 : 1) * 0.05;
      const y = box.y + clampUnit(ZONE_DEPTH[zone] + drift) * box.h;
      pins.push({
        sku: p.sku,
        name: friendlyName(p),
        label: shortName(p),
        qty: p.qty,
        price: p.price,
        size: p.size,
        art: p.art,
        zone,
        x: Math.round(Math.min(96, Math.max(4, x)) * 10) / 10,
        y: Math.round(Math.min(94, Math.max(6, y)) * 10) / 10,
      });
    });
  }

  return pins.sort((a, b) => a.y - b.y);
}

/** Overlay vision-located x/y (from gemini.locateHotspots) onto the formula-placed pins, by sku. */
export function relocateHotspots(hotspots = [], located = []) {
  if (!located?.length) return hotspots;
  const bySku = new Map(located.map((p) => [p.sku, p]));
  return hotspots.map((h) => {
    const loc = bySku.get(h.sku);
    return loc ? { ...h, x: loc.x, y: loc.y } : h;
  });
}

/* ------------------------------------------------------------------ *
 * "Swap one plant" — substitutes from the same category and price band.
 * ------------------------------------------------------------------ */

/** Roughly how interchangeable two plants are in a bed. */
function swapFit(candidate, original, budgetRoom) {
  if (candidate.cat !== original.cat) return -1;
  const priceGap = Math.abs(candidate.price - original.price);
  // Anything that would blow the remaining budget for this line is out.
  if (budgetRoom !== null && (candidate.price - original.price) * original.qty > budgetRoom) {
    return -1;
  }
  if (priceGap > Math.max(25, original.price * 0.75)) return -1;
  // Another hydrangea reads as a swap; a honeysuckle reads as a different plan.
  const sameGenus = genusOf(candidate.name) === genusOf(original.name) ? 60 : 0;
  return 100 - priceGap + sameGenus;
}

/**
 * Alternatives for one line item, drawn from real in-stock inventory.
 * `budgetRoom` is dollars left before the plan goes over budget (null = no budget).
 */
export function swapCandidatesFor(item, { exclude = [], budgetRoom = null, limit = 4 } = {}) {
  const original = plantBySku(item?.sku);
  if (!original) return [];
  const blocked = new Set([...exclude, original.sku]);
  const seenHandle = new Set([original.handle]);

  const scored = [];
  for (const p of PLANTS) {
    if (blocked.has(p.sku) || seenHandle.has(p.handle)) continue;
    if (p.availableForSale === false) continue;
    const fit = swapFit(p, { ...original, qty: item.qty || 1 }, budgetRoom);
    if (fit < 0) continue;
    seenHandle.add(p.handle);
    scored.push({ fit, plant: p });
  }

  return scored
    .sort((a, b) => b.fit - a.fit)
    .slice(0, limit)
    .map(({ plant }) => ({
      sku: plant.sku,
      name: friendlyName(plant),
      label: shortName(plant),
      price: plant.price,
      size: plant.size,
      art: plant.art,
      cat: plant.cat,
      bloom: plant.bloom || "",
      variantId: plant.variantId || null,
      handle: plant.handle,
      delta: Math.round((plant.price - original.price) * (item.qty || 1)),
    }));
}

function abbrev(name = "") {
  const parts = String(name).replace(/['"]/g, "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 6);
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 4)).toUpperCase();
}
