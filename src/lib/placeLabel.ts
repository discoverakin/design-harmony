/**
 * The short "where is this" a browsing card shows instead of a street address.
 *
 * A tester said she wanted a rough gauge of proximity at a glance, not the
 * literal address. True distance needs coordinates, which two thirds of events
 * do not have (docs/data-quality.md §4) — but the single biggest proximity fact
 * in this catalogue is available on every row for free: the city. **76 of 147
 * upcoming events are in Toronto** and 67 are in Ann Arbor, and today the card
 * shows a truncated street address that often cuts off before the city, so a
 * seeker cannot tell that half the list is 250 miles away.
 *
 * `placeLabel` is the fallback; `distanceLabel` in geo.ts is preferred whenever
 * coordinates and the user's position are both known. The full address stays on
 * the event page.
 */

import { distanceLabel, distanceMiles, eventCoords, type Coords } from "./geo";

/** Postal codes we should not show: "MI 48104", "ON M5V 2W9". */
const REGION_AND_POSTCODE = /^([A-Za-z]{2})\s+[A-Z0-9][A-Z0-9\s-]*$/;

/** "Unit 101C", "Suite 200A", "#3" — never the answer to "where is this". */
const SUBUNIT = /^(unit|suite|ste|apt|#)\b/i;

/**
 * Reduce a raw `location` string to "City, ST".
 *
 * "388 Carlaw Avenue, Unit 101C, Toronto, ON M4M 2T4" → "Toronto, ON"
 * "3765 Plaza Dr, Ann Arbor, MI 48108"                → "Ann Arbor, MI"
 * "Maker Works"                                        → "Maker Works"
 */
export function placeLabel(location: string | null | undefined): string {
  const raw = (location ?? "").trim();
  if (!raw) return "Location TBC";

  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !SUBUNIT.test(part));

  if (parts.length === 0) return raw;
  // No commas at all: a venue name, which is the best label available.
  if (parts.length === 1) return parts[0];

  const last = parts[parts.length - 1];
  const regionMatch = last.match(REGION_AND_POSTCODE);

  // "…, Ann Arbor, MI 48108" — city is the part before the region.
  if (regionMatch) {
    const city = parts[parts.length - 2];
    return city ? `${city}, ${regionMatch[1].toUpperCase()}` : last;
  }

  // "…, Toronto, ON" — already region-shaped, or something we can't parse:
  // keep the last two parts, which is the city end of any address.
  const city = parts[parts.length - 2];
  return `${city}, ${last}`;
}

/**
 * The location line for a browsing card: a distance when we can compute one,
 * the place name when we cannot. Never an empty string, and never the full
 * street address — that lives on the event page.
 */
export function cardLocationLabel(
  event: { location?: string | null; lat?: number | string | null; lng?: number | string | null },
  origin: Coords | null
): string {
  if (origin) {
    const coords = eventCoords(event);
    if (coords) {
      const label = distanceLabel(distanceMiles(origin, coords));
      if (label) return label;
    }
  }
  return placeLabel(event.location);
}
