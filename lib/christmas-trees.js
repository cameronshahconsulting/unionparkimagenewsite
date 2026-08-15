/**
 * Christmas tree pre-orders — reserve a size + week, pick in person, delivered to the front door
 * (or delivered and set up in a stand, or caught off the neighborhood truck).
 *
 * Fraser fir only. Pricing mirrors a competitor's Philadelphia-area delivery pricing
 * (flat, all-in per size + service — no separate distance-based delivery fee for trees;
 * that's the general-nursery model in lib/pricing.js, not this one).
 *
 * Delivery/setup is only offered within TREE_DELIVERY_RADIUS_MILES of our hub, and orders
 * using delivery or setup must reach TREE_MIN_ORDER before we schedule a run — catching the
 * truck has neither restriction, since the customer supplies the pickup labor.
 */

import { deliveryTownOptions } from "./pricing";

/** Delivery/setup service radius for trees — tighter than general nursery delivery. */
export const TREE_DELIVERY_RADIUS_MILES = 30;

/** Minimum order (delivery or setup only) before we schedule a run. Truck pickup has no minimum. */
export const TREE_MIN_ORDER = 199;

/** Season window — hide nav CTA outside this if you want; page still works for preview. */
export const CHRISTMAS = {
  year: 2026,
  title: "Christmas Trees",
  tagline: "Reserve your size. Tell us your town. We’ll bring it to your door — or set it up for you.",
  species: "Fraser Fir",
  speciesNote: "Fresh-cut Fraser fir only — the best tree for heavy ornaments, strong branches, great needle retention, and that real Christmas smell.",
  howItWorks: [
    {
      t: "Reserve a size",
      d: "Pick the height that fits your room. You’re locking a size class — not a specific tree yet.",
    },
    {
      t: "Tell us your town",
      d: "We run one area of deliveries per week, so your town decides your week — we’ll show you which one and confirm the exact day by email.",
    },
    {
      t: "Pick, deliver, and set up (your choice)",
      d: "Choose your tree when we arrive. Take front-door delivery only, or have us carry it in and set it up in a stand.",
    },
  ],
  truckNote:
    "See our truck on your street? Wave us down — you can buy a tree right off the trailer while we pass through, no pre-order needed.",
  deliveryNote:
    `We run one geographic area per week — your town determines your delivery week, so routes stay tight and prices stay honest. Delivery, setup, and truck pickup all reach about ${TREE_DELIVERY_RADIUS_MILES} miles of our Wilmington hub. $${TREE_MIN_ORDER} minimum tree order for delivery or setup (catching the truck has no minimum).`,
};

/**
 * Size tiers + flat all-in pricing per fulfillment, mirroring a Philadelphia-area
 * competitor's Fraser fir delivery pricing. `truckPrice` (self-pickup off the trailer,
 * no delivery labor) is our own price — the competitor doesn't offer that fulfillment,
 * so it's set a notch below `deliveryPrice` rather than mirrored.
 * `variantId` — set when Shopify products exist.
 */
export const TREE_SIZES = [
  {
    key: "tabletop",
    label: "Table Top",
    hint: "Desks, counters, tiny spaces",
    deliveryPrice: 75,
    setupPrice: 99,
    truckPrice: 45,
    sku: "XMAS-TT",
    variantId: null,
  },
  {
    key: "3-4",
    label: "3–4 ft",
    hint: "Small apartments & dorms",
    deliveryPrice: 75,
    setupPrice: 119,
    truckPrice: 45,
    sku: "XMAS-3-4",
    variantId: null,
  },
  {
    key: "4-5",
    label: "4–5 ft",
    hint: "Apartments & smaller rooms",
    deliveryPrice: 99,
    setupPrice: 139,
    truckPrice: 69,
    sku: "XMAS-4-5",
    variantId: null,
  },
  {
    key: "5-6",
    label: "5–6 ft",
    hint: "Cozy living rooms",
    deliveryPrice: 129,
    setupPrice: 169,
    truckPrice: 99,
    sku: "XMAS-5-6",
    variantId: null,
  },
  {
    key: "6-7",
    label: "6–7 ft",
    hint: "Most living rooms",
    deliveryPrice: 169,
    setupPrice: 209,
    truckPrice: 139,
    sku: "XMAS-6-7",
    variantId: null,
    popular: true,
  },
  {
    key: "7-8",
    label: "7–8 ft",
    hint: "Tall ceilings, big presence",
    deliveryPrice: 199,
    setupPrice: 249,
    truckPrice: 169,
    sku: "XMAS-7-8",
    variantId: null,
  },
  {
    key: "8-9",
    label: "8–9 ft",
    hint: "Statement trees — our tallest",
    deliveryPrice: 259,
    setupPrice: 319,
    truckPrice: 229,
    sku: "XMAS-8-9",
    variantId: null,
  },
];

/** How they receive / select the tree. */
export const FULFILLMENTS = [
  {
    key: "delivery",
    label: "Delivered to your front door",
    hint: "We bring trees your size — you pick, we leave it at the door",
    detail:
      "On your reserved week we bring a trailer of trees in your size class. You choose the one you want, and we deliver it to your front door. We don’t install the tree or carry it inside.",
  },
  {
    key: "setup",
    label: "Delivered & set up in a stand",
    hint: "We carry it in and set it up, ready to decorate — includes the stand",
    detail:
      "Same trailer, same pick-your-tree visit — but our crew carries it inside and sets it up in a stand for you. Includes the stand. If you already have a stand, mention it in the notes.",
  },
  {
    key: "truck",
    label: "Catch the neighborhood truck",
    hint: "Wave us down when we’re on your street — cheapest option, no minimum",
    detail:
      "We’ll email when the truck is hitting your area that week. Come out, pick a tree off the trailer, and take it home yourself — no driveway delivery appointment, no delivery minimum.",
  },
];

/**
 * Selection / delivery weeks for the season.
 * Edit dates each year; keep `id` stable once orders are live.
 */
export const TREE_WEEKS = [
  {
    id: "2026-w1",
    label: "Nov 23–29",
    short: "Thanksgiving week",
    start: "2026-11-23",
  },
  {
    id: "2026-w2",
    label: "Nov 30–Dec 6",
    short: "First week of December",
    start: "2026-11-30",
  },
  {
    id: "2026-w3",
    label: "Dec 7–13",
    short: "Mid-December",
    start: "2026-12-07",
    popular: true,
  },
  {
    id: "2026-w4",
    label: "Dec 14–20",
    short: "Last full week before Christmas",
    start: "2026-12-14",
  },
];

/**
 * One geographic area per week — the whole point is keeping each week's route
 * tight so a $75 table-top tree costs us a route stop, not a dedicated
 * 30-mile round trip. Every town within TREE_DELIVERY_RADIUS_MILES must
 * appear in exactly one zone below; re-run the town list against
 * `deliveryTownOptions()` filtered to <=30mi if the radius ever changes.
 * Reassign `weekId` freely — it's a routing decision, not a fixed rule.
 */
export const TREE_ZONES = [
  {
    key: "wilmington-core",
    label: "Wilmington & Northern Delaware",
    weekId: "2026-w1",
    towns: [
      "Wilmington", "Newark", "New Castle", "Hockessin", "Greenville",
      "Claymont", "Pike Creek", "Bear", "Glasgow",
    ],
  },
  {
    key: "pa-suburbs",
    label: "Pennsylvania suburbs",
    weekId: "2026-w2",
    towns: [
      "Philadelphia", "Media", "Chester", "Aston", "Boothwyn", "Swarthmore",
      "Springfield", "West Chester", "Kennett Square", "Chadds Ford", "Exton",
    ],
  },
  {
    key: "south-de-nj",
    label: "Southern Delaware & South Jersey",
    weekId: "2026-w3",
    towns: [
      "Middletown", "Odessa", "Townsend", "Delaware City",
      "Salem", "Pennsville", "Carneys Point", "Penns Grove", "Swedesboro",
      "Mullica Hill", "Deptford",
    ],
  },
  {
    key: "maryland",
    label: "Northeastern Maryland",
    weekId: "2026-w4",
    towns: ["Elkton", "North East", "Rising Sun", "Chesapeake City"],
  },
];

export function treeSizeByKey(key) {
  return TREE_SIZES.find((s) => s.key === key) || null;
}

export function treeWeekById(id) {
  return TREE_WEEKS.find((w) => w.id === id) || null;
}

export function fulfillmentByKey(key) {
  // Legacy cart lines used "trailer" — treat as doorstep delivery.
  if (key === "trailer") return FULFILLMENTS.find((f) => f.key === "delivery") || null;
  return FULFILLMENTS.find((f) => f.key === key) || null;
}

export function christmasTownFromKey(townKey) {
  if (!townKey) return null;
  return (
    deliveryTownOptions().find((t) => {
      const key = `${t.town}|${t.state}`;
      return key === townKey || t.label === townKey;
    }) || null
  );
}

/** Flat all-in price for a size + fulfillment combo (no separate delivery fee). */
export function priceForSizeFulfillment(sizeKey, fulfillmentKey) {
  const size = treeSizeByKey(sizeKey);
  if (!size) return null;
  const key = fulfillmentKey === "trailer" ? "delivery" : fulfillmentKey;
  if (key === "setup") return size.setupPrice;
  if (key === "truck") return size.truckPrice;
  return size.deliveryPrice;
}

/** Closest of the two hub distances — matches how general delivery treats "near either hub". */
function closestHubMiles(town) {
  const candidates = [town?.installMiles, town?.miles].filter(
    (m) => m != null && Number.isFinite(Number(m))
  );
  return candidates.length ? Math.min(...candidates.map(Number)) : null;
}

/** True when a town falls within the tree delivery/setup service radius. */
export function treeDeliveryAvailable(town) {
  const miles = closestHubMiles(town);
  return miles != null && miles <= TREE_DELIVERY_RADIUS_MILES;
}

/** Which routing zone (and therefore which single week) a town belongs to, if any. */
export function treeZoneForTown(town) {
  const name = String(town?.town || "").trim();
  if (!name) return null;
  return TREE_ZONES.find((z) => z.towns.includes(name)) || null;
}

/**
 * The week(s) we're actually running a route through this town — one area per
 * week keeps a cheap tree from costing us a dedicated 30-mile trip. Falls
 * back to every week if the town is in range but wasn't added to a zone
 * (data gap) rather than wrongly blocking a real customer.
 */
export function treeWeeksAvailableForTown(town) {
  if (!town) return TREE_WEEKS;
  if (!treeDeliveryAvailable(town)) return [];
  const zone = treeZoneForTown(town);
  if (!zone) return TREE_WEEKS;
  const week = treeWeekById(zone.weekId);
  return week ? [week] : TREE_WEEKS;
}

/**
 * Tree price + eligibility for a size/fulfillment/town. Every fulfillment —
 * including truck pickup — needs a town within TREE_DELIVERY_RADIUS_MILES,
 * since the truck is the same one-zone-per-week route, just flagged down
 * instead of dropped off. `provisional` means the price is known but
 * eligibility isn't confirmed yet (no town chosen).
 */
export function treeOrderTotal(sizeKey, fulfillmentKey, town = null) {
  const size = treeSizeByKey(sizeKey);
  if (!size) return null;
  const fulKey = fulfillmentKey === "trailer" ? "delivery" : fulfillmentKey;
  const ful = fulfillmentByKey(fulKey);
  if (!ful) return null;

  const price = priceForSizeFulfillment(sizeKey, fulKey);
  const provisional = !town;
  const available = Boolean(town) && treeDeliveryAvailable(town);
  const zone = available ? treeZoneForTown(town) : null;

  const note = provisional
    ? `Select your town to see which week we're routing through your area.`
    : available
      ? `${ful.label} — included in your price.`
      : `Sorry — that's outside our ${TREE_DELIVERY_RADIUS_MILES}-mile tree delivery area.`;

  return {
    tree: price,
    deliveryFee: 0,
    total: price,
    size,
    fulfillment: ful,
    provisional,
    available,
    zone,
    delivery: {
      fee: 0,
      free: true,
      pickup: fulKey === "truck",
      zone: zone?.key || null,
      zoneLabel: ful.label,
      note,
    },
  };
}

/** Unique cart line so same size + different week don’t merge. */
export function treeCartKey({ sizeKey, weekId, fulfillment }) {
  const ful = fulfillment === "trailer" ? "delivery" : fulfillment;
  return `xmas:${sizeKey}:${weekId}:${ful}`;
}

export function buildTreeCartItem({ sizeKey, weekId, fulfillment, town = "", townMeta = null }) {
  const size = treeSizeByKey(sizeKey);
  const week = treeWeekById(weekId);
  const fulKey = fulfillment === "trailer" ? "delivery" : fulfillment;
  const ful = fulfillmentByKey(fulKey);
  if (!size || !week || !ful) return null;

  const pricing = treeOrderTotal(sizeKey, fulKey, townMeta);
  if (!pricing || pricing.provisional || !pricing.available) return null;

  // Only the week(s) our route actually covers that town this season — one area per week.
  const validWeeks = treeWeeksAvailableForTown(townMeta);
  if (!validWeeks.some((w) => w.id === week.id)) return null;

  const name = `${size.label} Fraser fir · ${ful.label}`;

  return {
    cartKey: treeCartKey({ sizeKey, weekId, fulfillment: fulKey }),
    sku: `${size.sku}-${week.id}-${fulKey}`,
    name,
    price: pricing.total,
    art: "/art/cat-trees.svg",
    variantId: size.variantId,
    size: size.label,
    qty: 1,
    kind: "christmas",
    meta: {
      sizeKey: size.key,
      sizeLabel: size.label,
      weekId: week.id,
      weekLabel: week.label,
      fulfillment: ful.key,
      fulfillmentLabel: ful.label,
      treePrice: pricing.tree,
      deliveryFee: 0,
      deliveryZone: null,
      deliveryZoneLabel: ful.label,
      town: String(town || "").trim(),
      species: CHRISTMAS.species,
    },
  };
}
