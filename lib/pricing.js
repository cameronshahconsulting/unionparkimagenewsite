// Volume pricing + local delivery (Elmer, NJ hub) and install quotes (Wilmington, DE).

export const VOLUME_TIERS = [
  { min: 1, max: 4, discount: 0, label: "1–4 plants" },
  { min: 5, max: 9, discount: 0.05, label: "5–9 plants · 5% off" },
  { min: 10, max: 24, discount: 0.1, label: "10–24 plants · 10% off" },
  { min: 25, max: Infinity, discount: 0.15, label: "25+ plants · 15% off" },
];

export function tierForQty(qty) {
  const n = Math.max(1, Math.floor(Number(qty) || 1));
  return VOLUME_TIERS.find((t) => n >= t.min && n <= t.max) || VOLUME_TIERS[0];
}

export function unitPrice(basePrice, qty) {
  const tier = tierForQty(qty);
  return Math.round(basePrice * (1 - tier.discount) * 100) / 100;
}

export function lineEstimate(basePrice, qty) {
  const q = Math.max(1, Math.floor(Number(qty) || 1));
  const unit = unitPrice(basePrice, q);
  const tier = tierForQty(q);
  const list = basePrice * q;
  const total = Math.round(unit * q * 100) / 100;
  return {
    qty: q,
    unit,
    list: Math.round(list * 100) / 100,
    total,
    savings: Math.round((list - total) * 100) / 100,
    discount: tier.discount,
    label: tier.label,
  };
}

export function cartEstimates(items) {
  const lines = items.map((item) => {
    // Christmas trees are flat-priced reservations — no plant volume tiers.
    if (item.kind === "christmas") {
      const q = 1;
      const unit = Number(item.price) || 0;
      const total = unit;
      return {
        ...item,
        qty: q,
        unit,
        list: total,
        total,
        savings: 0,
        discount: 0,
        label: "Christmas tree",
      };
    }
    const est = lineEstimate(item.price, item.qty);
    return { ...item, ...est };
  });
  const plantLines = lines.filter((l) => l.kind !== "christmas");
  const treeLines = lines.filter((l) => l.kind === "christmas");
  const plantSubtotal = Math.round(plantLines.reduce((s, l) => s + l.total, 0) * 100) / 100;
  const christmasSubtotal = Math.round(treeLines.reduce((s, l) => s + l.total, 0) * 100) / 100;
  const subtotal = Math.round((plantSubtotal + christmasSubtotal) * 100) / 100;
  const listTotal = Math.round(lines.reduce((s, l) => s + l.list, 0) * 100) / 100;
  const volumeSavings = Math.round(
    plantLines.reduce((s, l) => s + (l.list - l.total), 0) * 100
  ) / 100;
  const plantCount = plantLines.reduce((s, l) => s + l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return {
    lines,
    subtotal,
    listTotal,
    volumeSavings,
    count,
    plantSubtotal,
    christmasSubtotal,
    plantCount,
    hasPlants: plantLines.length > 0,
    hasChristmas: treeLines.length > 0,
  };
}

/**
 * Installation is a quote request with Union Park Landscaping — not a checkout price.
 * Customer picks a specific install area within ~30 miles of the Wilmington shop.
 */
export const INSTALLATION = {
  partner: "Union Park Landscaping",
  center: "Wilmington, DE",
  shop: "our Wilmington shop",
  radiusMiles: 30,
  /** Optional store credit when plants are sourced via the nursery partner. */
  nextOrderCreditPercent: 25,
  note: "Request an installation estimate — Union Park Landscaping will follow up. Enter your delivery address and we’ll confirm you’re within about 30 miles of our Wilmington shop.",
  creditNote: "Installation is quoted separately by Union Park Landscaping — not charged on the plant checkout.",
};

export function installationAvailable(installMiles) {
  if (installMiles == null || !Number.isFinite(Number(installMiles))) return false;
  return Number(installMiles) <= INSTALLATION.radiusMiles;
}

/**
 * Break-even math (why these thresholds)
 * -------------------------------------
 * Plants load in Elmer, NJ. We are based in Wilmington, DE (~45 min / ~40 mi each way).
 * Delivery radius: 60 miles from Elmer across DE, NJ, PA, and MD.
 *
 * Assumptions: labor/opportunity $35/hr · vehicle $0.85/mi · ~40% plant gross margin.
 *
 * Fixed nursery run every delivery (Wilmington ↔ Elmer):
 *   80 mi RT × $0.85 ≈ $68 + ~2.0 hr × $35 ≈ $70 → ≈ $138
 *
 * Typical drop (~30 mi from Elmer):
 *   60 mi RT × $0.85 ≈ $51 + ~1.5 hr × $35 ≈ $53 → ≈ $104
 *   Trip ≈ $242 → free-delivery break-even merchandise ≈ $242 / 0.40 ≈ $605
 *
 * Edge drop (60 mi from Elmer):
 *   Trip ≈ $330 → break-even ≈ $825
 *
 * Thresholds:
 *   minOrder $299 — plants + standard delivery fee must reach this (customers don’t need $299 in plants alone).
 *   freeOver $699 — under-$700 charm price above typical break-even, with cushion for the mix of runs.
 */
export const DELIVERY_AREAS = {
  /** Customer-facing service base */
  center: "Wilmington, DE",
  radiusMiles: 60,
  /** Absolute floor — plants + delivery fee must reach this before we schedule a run. */
  minOrder: 299,
  /** Free local delivery when plant merchandise reaches this (psychology: under $700). */
  freeOver: 699,
  note: "Local delivery only — we deliver across Delaware, New Jersey, Pennsylvania, and Maryland within about 60 miles of Wilmington. We do not ship.",
  groups: [
    {
      state: "New Jersey",
      places: [
        "Elmer", "Clayton", "Pitman", "Glassboro", "Williamstown", "Vineland", "Bridgeton",
        "Millville", "Woodstown", "Salem", "Pennsville", "Carneys Point", "Penns Grove",
        "Swedesboro", "Mullica Hill", "Sewell", "Deptford", "Sicklerville", "Hammonton",
        "Cherry Hill", "Voorhees", "Marlton", "Medford", "Moorestown", "Camden",
        "Washington Township", "Turnersville", "Blackwood", "Berlin", "Atco",
      ],
    },
    {
      state: "Delaware",
      places: [
        "Wilmington", "Newark", "New Castle", "Hockessin", "Greenville", "Claymont",
        "Pike Creek", "Bear", "Glasgow", "Middletown", "Odessa", "Townsend",
        "Delaware City", "Smyrna", "Dover", "Wyoming", "Magnolia",
      ],
    },
    {
      state: "Pennsylvania",
      places: [
        "Philadelphia", "Media", "Chester", "Aston", "Boothwyn", "Swarthmore",
        "Springfield", "West Chester", "Kennett Square", "Chadds Ford", "Exton",
        "Downingtown", "Phoenixville", "Coatesville",
      ],
    },
    {
      state: "Maryland",
      places: [
        "Elkton", "North East", "Perryville", "Havre de Grace", "Rising Sun",
        "Chesapeake City", "Port Deposit",
      ],
    },
  ],
};

/** Approx one-way road miles from Elmer, NJ (delivery quotes + 60-mi radius). */
export const TOWN_MILES_FROM_ELMER = {
  Elmer: 2,
  Clayton: 8,
  Pitman: 14,
  Glassboro: 16,
  Williamstown: 18,
  Vineland: 14,
  Bridgeton: 16,
  Millville: 22,
  Woodstown: 12,
  Salem: 18,
  Pennsville: 26,
  "Carneys Point": 28,
  "Penns Grove": 30,
  Swedesboro: 22,
  "Mullica Hill": 18,
  Sewell: 22,
  Deptford: 26,
  Sicklerville: 24,
  Hammonton: 28,
  "Cherry Hill": 32,
  Voorhees: 30,
  Marlton: 32,
  Medford: 34,
  Moorestown: 36,
  Camden: 34,
  "Washington Township": 22,
  Turnersville: 24,
  Blackwood: 26,
  Berlin: 28,
  Atco: 30,
  Wilmington: 38,
  Newark: 42,
  "New Castle": 36,
  Hockessin: 45,
  Greenville: 42,
  Claymont: 44,
  "Pike Creek": 44,
  Bear: 40,
  Glasgow: 42,
  Middletown: 48,
  Odessa: 46,
  Townsend: 50,
  "Delaware City": 40,
  Smyrna: 52,
  Dover: 58,
  Wyoming: 58,
  Magnolia: 60,
  Philadelphia: 40,
  Media: 48,
  Chester: 42,
  Aston: 44,
  Boothwyn: 42,
  Swarthmore: 46,
  Springfield: 48,
  "West Chester": 50,
  "Kennett Square": 48,
  "Chadds Ford": 46,
  Exton: 55,
  Downingtown: 58,
  Phoenixville: 58,
  Coatesville: 58,
  Elkton: 38,
  "North East": 48,
  Perryville: 52,
  "Havre de Grace": 55,
  "Rising Sun": 50,
  "Chesapeake City": 36,
  "Port Deposit": 54,
};

/** Approx one-way road miles from Wilmington, DE (Union Park install eligibility). */
export const TOWN_MILES_FROM_WILMINGTON = {
  Elmer: 38,
  Clayton: 42,
  Pitman: 40,
  Glassboro: 38,
  Williamstown: 42,
  Vineland: 48,
  Bridgeton: 48,
  Millville: 55,
  Woodstown: 35,
  Salem: 28,
  Pennsville: 12,
  "Carneys Point": 14,
  "Penns Grove": 16,
  Swedesboro: 22,
  "Mullica Hill": 28,
  Sewell: 32,
  Deptford: 30,
  Sicklerville: 36,
  Hammonton: 45,
  "Cherry Hill": 35,
  Voorhees: 38,
  Marlton: 40,
  Medford: 42,
  Moorestown: 36,
  Camden: 32,
  "Washington Township": 34,
  Turnersville: 35,
  Blackwood: 34,
  Berlin: 40,
  Atco: 42,
  Wilmington: 4,
  Newark: 14,
  "New Castle": 8,
  Hockessin: 12,
  Greenville: 6,
  Claymont: 8,
  "Pike Creek": 10,
  Bear: 15,
  Glasgow: 16,
  Middletown: 24,
  Odessa: 22,
  Townsend: 26,
  "Delaware City": 14,
  Smyrna: 35,
  Dover: 48,
  Wyoming: 52,
  Magnolia: 55,
  Philadelphia: 28,
  Media: 20,
  Chester: 15,
  Aston: 18,
  Boothwyn: 16,
  Swarthmore: 22,
  Springfield: 24,
  "West Chester": 25,
  "Kennett Square": 18,
  "Chadds Ford": 14,
  Exton: 28,
  Downingtown: 32,
  Phoenixville: 35,
  Coatesville: 38,
  Elkton: 20,
  "North East": 28,
  Perryville: 32,
  "Havre de Grace": 35,
  "Rising Sun": 30,
  "Chesapeake City": 22,
  "Port Deposit": 34,
};

/**
 * Vehicle options — pickup is cheaper; box truck for larger / heavier loads.
 * Internal nursery run is baked into tripBase (not named customer-facing).
 */
export const VEHICLES = {
  pickup: {
    key: "pickup",
    label: "Pickup truck",
    short: "Pickup",
    /** Max cargo “slots” before we need the box truck. */
    maxSlots: 14,
    tripBase: 118,
    perMile: 0.78,
    loadBase: 28,
    perPlant: 2,
    perPlantCap: 36,
    blurb: "Fits most small-to-medium plant orders.",
  },
  box: {
    key: "box",
    label: "Box truck",
    short: "Box truck",
    maxSlots: Infinity,
    tripBase: 175,
    perMile: 1.15,
    loadBase: 45,
    perPlant: 3,
    perPlantCap: 70,
    blurb: "Needed for large trees, big pots, or heavier loads.",
  },
};

/**
 * Flat-rate delivery zones.
 * Home = ≤15 mi of Wilmington shop OR ≤15 mi of nursery (easy drops).
 * Mid / far are measured from the nursery for everyone outside home.
 */
export const LOCAL_DELIVERY = {
  key: "home",
  radiusMiles: 15,
  pickupFlat: 39,
  boxFlat: 59,
  freeOver: 699,
  label: "Neighborhood delivery",
  note: "You're close to our Wilmington shop or nursery — delivery is a flat neighborhood rate so nearby yards stay easy to plant.",
};

export const DELIVERY_ZONES = {
  home: LOCAL_DELIVERY,
  mid: {
    key: "mid",
    /** Outside home zone, up to this many miles from the nursery. */
    maxNurseryMiles: 30,
    pickupFlat: 89,
    boxFlat: 139,
    freeOver: 699,
    label: "Regional delivery",
    note: "Flat regional rate for mid-range deliveries — same price for everyone in this band.",
  },
  far: {
    key: "far",
    maxNurseryMiles: 60,
    pickupFlat: 129,
    boxFlat: 189,
    freeOver: 699,
    label: "Extended delivery",
    note: "Flat extended-area rate for farther deliveries within our service radius.",
  },
};

/** True if within LOCAL_DELIVERY.radiusMiles of Wilmington shop and/or nursery hub. */
export function isNeighborhoodDelivery(shopMiles, nurseryMiles = null) {
  const nearShop =
    shopMiles != null &&
    Number.isFinite(Number(shopMiles)) &&
    Number(shopMiles) <= LOCAL_DELIVERY.radiusMiles;
  const nearNursery =
    nurseryMiles != null &&
    Number.isFinite(Number(nurseryMiles)) &&
    Number(nurseryMiles) <= LOCAL_DELIVERY.radiusMiles;
  return nearShop || nearNursery;
}

/** @deprecated use isNeighborhoodDelivery */
export function isNearShop(shopMiles) {
  return isNeighborhoodDelivery(shopMiles, null);
}

/**
 * Resolve flat-rate zone from shop miles (Wilmington) + nursery miles (hub).
 * Home wins first; otherwise mid/far by nursery distance.
 */
export function resolveDeliveryZone(shopMiles, nurseryMiles = null) {
  if (isNeighborhoodDelivery(shopMiles, nurseryMiles)) return DELIVERY_ZONES.home;
  const hub =
    nurseryMiles != null && Number.isFinite(Number(nurseryMiles))
      ? Number(nurseryMiles)
      : null;
  if (hub != null && hub <= DELIVERY_ZONES.mid.maxNurseryMiles) return DELIVERY_ZONES.mid;
  return DELIVERY_ZONES.far;
}

export const DELIVERY_NOTE =
  "Delivery is a flat rate by area and vehicle. Standard delivery is 3–5 business days. Final amount is confirmed when we schedule the run.";

/**
 * Delivery speed — standard is included in the zone flat rate;
 * rush adds a surcharge (free-delivery threshold does not waive rush).
 */
export const DELIVERY_SPEEDS = {
  standard: {
    key: "standard",
    label: "Standard delivery",
    eta: "3–5 business days",
    surcharge: 0,
    blurb: "Our normal local route — usually 3–5 business days after your order is ready.",
  },
  rush: {
    key: "rush",
    label: "Rush delivery",
    eta: "1–2 business days",
    surcharge: 75,
    blurb: "Priority scheduling when we can fit your drop — +$75 on top of delivery (still applies if plant delivery would otherwise be free).",
  },
};

export function deliverySpeedMeta(key) {
  return DELIVERY_SPEEDS[key] || DELIVERY_SPEEDS.standard;
}

const STATE_ABBR = {
  Delaware: "DE",
  "New Jersey": "NJ",
  Pennsylvania: "PA",
  Maryland: "MD",
};

/** Rough cargo slot weight from a size string like "7 gal. 24-30\"". */
export function cargoSlotsForSize(size = "") {
  const s = String(size).toLowerCase();
  const gal = Number((s.match(/(\d+(?:\.\d+)?)\s*gal/) || [])[1]) || 0;
  if (/b&b|ball.?burlap|boxed|caliper|\d+\s*"?\s*cal/i.test(s) || gal >= 25) return 6;
  if (gal >= 15 || /15\s*gal|20\s*gal/.test(s)) return 4;
  if (gal >= 7 || /7\s*gal|10\s*gal/.test(s)) return 2.5;
  if (gal >= 5) return 2;
  if (gal >= 3 || /3\s*gal|2\s*gal|1\s*gal|#1|#2|#3/.test(s)) return 1;
  if (/tree|arborvitae|maple|oak|holly/.test(s) && gal === 0) return 3;
  return 1.25;
}

/**
 * @param {{ size?: string, qty?: number, cat?: string, name?: string }[]} lines
 */
export function recommendVehicle(lines = []) {
  let slots = 0;
  let plantCount = 0;
  let hasLargeTree = false;

  for (const line of lines) {
    const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
    plantCount += qty;
    const per = cargoSlotsForSize(line.size);
    slots += per * qty;
    const name = `${line.name || ""} ${line.size || ""} ${line.cat || ""}`.toLowerCase();
    if (
      per >= 4 ||
      (line.cat === "trees" && per >= 2.5) ||
      /\b(15|20|25|30)\s*gal|b&b|caliper/.test(name)
    ) {
      hasLargeTree = true;
    }
  }

  slots = Math.round(slots * 10) / 10;
  const needsBox =
    slots > VEHICLES.pickup.maxSlots || plantCount >= 16 || (hasLargeTree && plantCount >= 6);

  return {
    vehicle: needsBox ? "box" : "pickup",
    slots,
    plantCount,
    needsBox,
    reason: needsBox
      ? hasLargeTree && plantCount >= 6
        ? "Large plants and enough volume for a box truck."
        : plantCount >= 16
          ? "Plant count is high enough that a box truck is the right fit."
          : "This load is too large for a pickup — a box truck is required."
      : "This order fits comfortably in a pickup truck.",
  };
}

export function deliveryTownOptions() {
  return DELIVERY_AREAS.groups.flatMap((g) =>
    g.places.map((place) => {
      const miles = TOWN_MILES_FROM_ELMER[place] ?? 35;
      const installMiles = TOWN_MILES_FROM_WILMINGTON[place] ?? 40;
      return {
        label: `${place}, ${STATE_ABBR[g.state] || g.state}`,
        town: place,
        state: g.state,
        /** Internal miles used for delivery fee (nursery hub). */
        miles,
        /** Miles from Wilmington shop (install + customer-facing distance). */
        installMiles,
      };
    })
  );
}

/** Towns Union Park can install — within radius of the Wilmington shop. */
export function installTownOptions() {
  return deliveryTownOptions()
    .filter((t) => installationAvailable(t.installMiles))
    .sort((a, b) => a.installMiles - b.installMiles || a.label.localeCompare(b.label));
}

function feeForVehicle({ vehicleKey, milesOneWay, free, meetsMinimum, zone, speed = "standard" }) {
  const v = VEHICLES[vehicleKey] || VEHICLES.pickup;
  const speedMeta = deliverySpeedMeta(speed);
  const flat = vehicleKey === "box" ? zone.boxFlat : zone.pickupFlat;
  const surcharge = Number(speedMeta.surcharge) || 0;
  // Merchandise free-threshold waives the zone flat for any speed; rush surcharge still applies.
  const baseFee = free ? 0 : flat;
  const fee = !meetsMinimum ? null : Math.round((baseFee + surcharge) * 100) / 100;
  const milesRoundTrip =
    milesOneWay == null || Number.isNaN(milesOneWay)
      ? null
      : Math.round(milesOneWay * 2 * 10) / 10;

  return {
    vehicle: vehicleKey,
    vehicleLabel: v.label,
    milesOneWay: milesOneWay == null || Number.isNaN(milesOneWay) ? null : milesOneWay,
    milesRoundTrip,
    drive: free || !meetsMinimum ? 0 : flat,
    labor: 0,
    baseFee: !meetsMinimum ? null : baseFee,
    surcharge: !meetsMinimum ? 0 : surcharge,
    fee,
    flat: true,
    zone: zone.key,
    zoneLabel: zone.label,
    speed: speedMeta.key,
    speedLabel: speedMeta.label,
    eta: speedMeta.eta,
  };
}

/**
 * @param {{
 *   subtotal: number,
 *   plantCount: number,
 *   oneWayMiles: number|null,
 *   shopMiles?: number|null,
 *   nurseryMiles?: number|null,
 *   lines?: { size?: string, qty?: number, cat?: string, name?: string }[],
 *   vehicle?: 'pickup'|'box'|null,
 *   speed?: 'standard'|'rush'|null,
 * }} args
 */
export function deliveryEstimate({
  subtotal,
  plantCount,
  oneWayMiles,
  shopMiles = null,
  nurseryMiles = null,
  lines = [],
  vehicle = null,
  speed = "standard",
}) {
  const materials = Math.round(Math.max(0, Number(subtotal) || 0) * 100) / 100;
  const count = Math.max(0, Math.floor(Number(plantCount) || 0));
  const milesOneWay = oneWayMiles == null || oneWayMiles === "" ? null : Math.max(0, Number(oneWayMiles));
  const shop = shopMiles == null || shopMiles === "" ? null : Math.max(0, Number(shopMiles));
  const nursery = nurseryMiles == null || nurseryMiles === "" ? null : Math.max(0, Number(nurseryMiles));
  const hubMiles = nursery != null ? nursery : milesOneWay;
  const hasLocation =
    (shop != null && Number.isFinite(shop)) || (hubMiles != null && Number.isFinite(hubMiles));
  // Until a town is chosen, quote the neighborhood rate so the $299 minimum isn't inflated.
  const zone = hasLocation ? resolveDeliveryZone(shop, hubMiles) : LOCAL_DELIVERY;
  const nearShop = zone.key === "home";
  const freeOver = zone.freeOver;
  /** Free delivery is still based on plant merchandise alone (standard speed only). */
  const materialsFree = materials >= freeOver;
  const speedMeta = deliverySpeedMeta(speed === "rush" ? "rush" : "standard");
  const free = materialsFree && speedMeta.key === "standard";

  const rec = recommendVehicle(lines.length ? lines : [{ qty: count, size: "3 gal" }]);
  const vehicleKey = vehicle === "pickup" || vehicle === "box" ? vehicle : rec.vehicle;
  const forcedUpsize = vehicleKey === "pickup" && rec.needsBox;
  const activeKey = forcedUpsize ? "box" : vehicleKey;
  const flat = activeKey === "box" ? zone.boxFlat : zone.pickupFlat;
  const baseTowardMin = materialsFree ? 0 : flat;
  const deliveryTowardMin = Math.round((baseTowardMin + (speedMeta.surcharge || 0)) * 100) / 100;
  const orderTowardMin = Math.round((materials + deliveryTowardMin) * 100) / 100;
  const meetsMinimum = orderTowardMin >= DELIVERY_AREAS.minOrder;
  const remainingForFree = Math.max(0, Math.round((freeOver - materials) * 100) / 100);
  const remainingForMinimum = Math.max(
    0,
    Math.round((DELIVERY_AREAS.minOrder - orderTowardMin) * 100) / 100
  );

  const pickup = feeForVehicle({
    vehicleKey: "pickup",
    milesOneWay,
    free: materialsFree,
    meetsMinimum,
    zone,
    speed: speedMeta.key,
  });
  const box = feeForVehicle({
    vehicleKey: "box",
    milesOneWay,
    free: materialsFree,
    meetsMinimum,
    zone,
    speed: speedMeta.key,
  });
  const chosen = activeKey === "box" ? box : pickup;

  const zoneHint =
    zone.key === "home"
      ? "Neighborhood flat rate applies near our shop or nursery."
      : zone.key === "mid"
        ? "Regional flat rate for mid-range deliveries."
        : "Extended flat rate for farther deliveries.";

  return {
    free,
    materialsFree,
    meetsMinimum,
    nearShop,
    zone: zone.key,
    zoneLabel: zone.label,
    minOrder: DELIVERY_AREAS.minOrder,
    freeOver,
    freeOverStandard: DELIVERY_AREAS.freeOver,
    freeOverLocal: LOCAL_DELIVERY.freeOver,
    remainingForFree,
    remainingForMinimum,
    orderTowardMin,
    deliveryTowardMin,
    recommendedVehicle: rec.vehicle,
    vehicleReason: `${rec.reason} ${zoneHint}`,
    cargoSlots: rec.slots,
    needsBox: rec.needsBox,
    forcedUpsize,
    vehicle: activeKey,
    vehicleLabel: VEHICLES[activeKey].label,
    milesOneWay: chosen.milesOneWay,
    milesRoundTrip: chosen.milesRoundTrip,
    drive: chosen.drive,
    labor: chosen.labor,
    baseFee: chosen.baseFee,
    surcharge: chosen.surcharge,
    fee: chosen.fee,
    flat: true,
    speed: speedMeta.key,
    speedLabel: speedMeta.label,
    eta: speedMeta.eta,
    byVehicle: { pickup, box },
    note:
      speedMeta.key === "rush"
        ? `${zone.note || DELIVERY_NOTE} Rush: ${speedMeta.eta} (+$${speedMeta.surcharge}).`
        : `${zone.note || DELIVERY_NOTE} Standard: ${speedMeta.eta}.`,
  };
}
