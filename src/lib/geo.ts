/**
 * Distance helpers for the "near me" filter.
 *
 * `api/search.ts` measures proximity with Euclidean distance over raw lat/lng
 * degrees, which is elliptical at this latitude — a longitude degree is only
 * ~74% as wide as a latitude one at 42°N (see known-issues.md). Client-side
 * filtering uses a real great-circle distance instead, so "within 3 miles"
 * means the same thing in every direction.
 */

export interface Coords {
  lat: number;
  lng: number;
}

/** Ann Arbor downtown — the origin used when the device won't share a location. */
export const ANN_ARBOR_CENTER: Coords = { lat: 42.2808, lng: -83.743 };

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in miles. */
export function distanceMiles(a: Coords, b: Coords): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * `events.lat`/`events.lng` were added by hand and appear in no migration, so
 * treat them as optional and possibly non-numeric. Returns null when the event
 * has no usable position — the caller decides what that means.
 */
export function eventCoords(event: {
  lat?: number | string | null;
  lng?: number | string | null;
}): Coords | null {
  const lat = Number(event?.lat);
  const lng = Number(event?.lng);
  if (event?.lat == null || event?.lng == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null; // null island — a geocode that failed
  return { lat, lng };
}
