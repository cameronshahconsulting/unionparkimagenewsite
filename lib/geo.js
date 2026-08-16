/**
 * US address geocoding + distance helpers for delivery / install quotes.
 * Uses the free US Census Bureau geocoder (no API key).
 */

/** Wilmington shop / Union Park install center. */
export const SHOP_HUB = {
  label: "Wilmington, DE",
  lat: 39.7526,
  lng: -75.5497,
  address: "1202 N West St, Wilmington, DE 19801",
};

/** Plant-load nursery hub (Elmer, NJ) for delivery distance bands. */
export const NURSERY_HUB = {
  label: "Elmer, NJ",
  lat: 39.5951,
  lng: -75.1702,
};

const CENSUS_GEOCODER =
  "https://geocoding.geo.census.gov/geocoder/locations/address";

export function haversineMiles(a, b) {
  const toRad = (d) => (Number(d) * Math.PI) / 180;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lng);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
}

/** Crow-flies → approximate road miles (local Mid-Atlantic factor). */
export function roadMilesFromCrow(crowMiles) {
  if (crowMiles == null || !Number.isFinite(Number(crowMiles))) return null;
  return Math.round(Number(crowMiles) * 1.25 * 10) / 10;
}

export function normalizeState(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const upper = s.toUpperCase();
  const map = {
    DELAWARE: "DE",
    DE: "DE",
    "NEW JERSEY": "NJ",
    NJ: "NJ",
    PENNSYLVANIA: "PA",
    PA: "PA",
    MARYLAND: "MD",
    MD: "MD",
  };
  return map[upper] || (upper.length === 2 ? upper : s);
}

/**
 * @param {{
 *   street: string,
 *   city: string,
 *   state: string,
 *   zip: string,
 * }} input
 */
export async function geocodeAddress(input) {
  const street = String(input.street || "").trim();
  const city = String(input.city || "").trim();
  const state = normalizeState(input.state);
  const zip = String(input.zip || "").trim().slice(0, 10);

  if (!street || !city || !state || !zip) {
    return { ok: false, error: "Enter street, city, state, and ZIP." };
  }

  const params = new URLSearchParams({
    street,
    city,
    state,
    zip,
    benchmark: "Public_AR_Current",
    format: "json",
  });

  const res = await fetch(`${CENSUS_GEOCODER}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "UnionParkLandscaping/1.0" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return { ok: false, error: "Could not look up that address right now. Try again in a moment." };
  }

  const data = await res.json().catch(() => ({}));
  const matches = data?.result?.addressMatches || [];
  if (!matches.length) {
    return {
      ok: false,
      error: "We couldn’t find that address. Check the street, city, state, and ZIP.",
    };
  }

  const match = matches[0];
  const lat = Number(match?.coordinates?.y);
  const lng = Number(match?.coordinates?.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "That address didn’t resolve to a map point." };
  }

  const components = match.addressComponents || {};
  const formatted = String(match.matchedAddress || `${street}, ${city}, ${state} ${zip}`);
  const streetOut = String(street).trim();

  const crowShop = haversineMiles({ lat, lng }, SHOP_HUB);
  const crowNursery = haversineMiles({ lat, lng }, NURSERY_HUB);
  const shopMiles = roadMilesFromCrow(crowShop);
  const nurseryMiles = roadMilesFromCrow(crowNursery);

  return {
    ok: true,
    lat,
    lng,
    formatted,
    street: streetOut,
    city: String(components.city || city).trim(),
    state: normalizeState(components.state || state),
    zip: String(components.zip || zip).trim(),
    shopMiles,
    nurseryMiles,
    crowShop,
    crowNursery,
  };
}

export function formatAddressLines({ street, city, state, zip, line2 = "" }) {
  const line1 = [street, line2].filter(Boolean).join(", ");
  const lineCity = [city, normalizeState(state), zip].filter(Boolean).join(", ").replace(", ,", ",");
  return { line1, lineCity, oneLine: [line1, lineCity].filter(Boolean).join(", ") };
}
