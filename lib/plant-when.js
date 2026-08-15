/**
 * When to plant — Zone 7 (Delaware Valley) guidance by plant category.
 * Honest nursery timing, not fake precision.
 */

const BY_CAT = {
  perennials: {
    window: "Spring or early fall",
    detail:
      "Plant perennials after the last hard frost in spring, or in early fall so roots settle before winter.",
  },
  grasses: {
    window: "Spring or early fall",
    detail: "Ornamental grasses settle best in spring or early fall with steady moisture the first month.",
  },
  roses: {
    window: "Spring after frost",
    detail: "Plant roses once soil has warmed and frost risk has passed — usually mid to late spring here.",
  },
  shrubs: {
    window: "Spring or fall",
    detail: "Shrubs love spring or fall planting — cooler days, less transplant stress.",
  },
  evergreens: {
    window: "Early fall (best) or spring",
    detail:
      "Evergreens prefer early fall so roots grow before winter; spring works if you water through summer heat.",
  },
  trees: {
    window: "Early fall or early spring",
    detail:
      "Trees do best planted in early fall or early spring while dormant — avoid peak summer heat.",
  },
};

/**
 * Summarize plant-when guidance for a plan's plant list.
 * @param {Array<{ cat?: string }>} plants
 */
export function plantWhenFor(plants = []) {
  const cats = [...new Set(plants.map((p) => p.cat).filter(Boolean))];
  if (!cats.length) {
    return {
      headline: "Best planted in spring or early fall",
      detail:
        "In the Delaware Valley (Zone 7), most gardens settle best in spring after frost or in early fall.",
      byCat: [],
    };
  }

  const byCat = cats
    .map((cat) => ({ cat, ...(BY_CAT[cat] || BY_CAT.shrubs) }))
    .sort((a, b) => a.cat.localeCompare(b.cat));

  // Prefer a single clear headline when the bed is mostly one timing.
  const windows = [...new Set(byCat.map((c) => c.window))];
  const headline =
    windows.length === 1
      ? `Best planted: ${windows[0]}`
      : "Best planted in spring or early fall";

  const detail =
    byCat.length === 1
      ? byCat[0].detail
      : "Your mix spans a few plant types — spring after frost and early fall are the safest windows in Zone 7. Water well the first season.";

  return { headline, detail, byCat };
}
