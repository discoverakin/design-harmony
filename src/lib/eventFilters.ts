/**
 * Fast browse filters — date range, price, and distance — applied in memory to
 * the already-fetched event list. Deliberately independent of `/api/search`:
 * testers asked to narrow the list without typing anything, so nothing here
 * calls a model or the network.
 *
 * Two facts about the data shape everything below:
 *
 * 1. **A quarter of approved events have no price** (75 of 306 as of
 *    2026-08-25, see docs/data-quality.md) and some have no confirmed date
 *    (the `2099-01-01` sentinel). An event whose price is unknown is not free
 *    and not paid; an event whose date is unknown is not "today". Filtering
 *    them out is right — silently filtering them out is not, so the result
 *    carries counts the UI can disclose.
 * 2. **Ongoing/recurring listings carry one anchor date they do not happen
 *    on**, so a date range cannot be evaluated for them at all. They come back
 *    in their own bucket rather than being dropped or pretended to match.
 */

import { addWeeks, endOfMonth, endOfWeek, format, startOfWeek } from "date-fns";
import { hasKnownDate, parseEventDates } from "./eventDates";
import { distanceMiles, eventCoords, type Coords } from "./geo";

export type DatePreset =
  | "any"
  | "today"
  | "tomorrow"
  | "this-week"
  | "next-week"
  | "this-month";

export type PriceFilter = "any" | "free" | "paid";

export interface EventFilters {
  date: DatePreset;
  /** A specific `YYYY-MM-DD` picked from the calendar. Takes precedence over `date`. */
  day: string | null;
  price: PriceFilter;
  /** Radius in miles from the browse origin; null means no distance filter. */
  radiusMiles: number | null;
}

export const NO_FILTERS: EventFilters = {
  date: "any",
  day: null,
  price: "any",
  radiusMiles: null,
};

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  any: "Any date",
  today: "Today",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "next-week": "Next week",
  "this-month": "This month",
};

export const RADIUS_OPTIONS_MILES = [1, 3, 5, 10] as const;

/**
 * Distance filtering is built and tested but held back from the UI.
 *
 * Measured on a preview on 2026-08-26: 116 of 174 upcoming events have no
 * `lat`/`lng`, and of the 28 a 10-mile radius can find, 26 are ongoing and 2
 * are dated (docs/data-quality.md §4). A radius therefore returns almost
 * exclusively the recurring listings — correct, but not worth a chip yet.
 *
 * Flip this to `true` once the geocode backfill lands. Nothing else needs to
 * change: the chips reappear, `?radius=` starts being honoured again, and the
 * tests guarded by this constant start running.
 */
export const DISTANCE_FILTER_ENABLED = false;

export function countActiveFilters(f: EventFilters): number {
  return (
    (f.day || f.date !== "any" ? 1 : 0) +
    (f.price !== "any" ? 1 : 0) +
    (f.radiusMiles != null ? 1 : 0)
  );
}

/** Inclusive `YYYY-MM-DD` bounds — the same string form `events.date` stores. */
export interface DateRange {
  start: string;
  end: string;
}

const toKey = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * The range a filter selects, or null when it selects everything.
 *
 * Ranges start at *today*, never at the start of the calendar week: this feeds
 * an upcoming-events list, where "this week" means the rest of it.
 */
export function dateRangeFor(
  filters: Pick<EventFilters, "date" | "day">,
  now: Date = new Date()
): DateRange | null {
  if (filters.day) return { start: filters.day, end: filters.day };

  const today = toKey(now);
  const tomorrow = toKey(new Date(now.getTime() + 86400000));

  switch (filters.date) {
    case "today":
      return { start: today, end: today };
    case "tomorrow":
      return { start: tomorrow, end: tomorrow };
    case "this-week":
      return { start: today, end: toKey(endOfWeek(now)) };
    case "next-week": {
      const next = addWeeks(now, 1);
      return { start: toKey(startOfWeek(next)), end: toKey(endOfWeek(next)) };
    }
    case "this-month":
      return { start: today, end: toKey(endOfMonth(now)) };
    default:
      return null;
  }
}

/** The subset of an event row these filters read. */
export interface FilterableEvent {
  date: string;
  description?: string | null;
  price_cents?: number | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface FilterResult<T> {
  /** Single-date events matching every filter, soonest first. */
  dated: T[];
  /** Ongoing/recurring events matching price and distance; their dates can't be checked. */
  recurring: T[];
  /** Matched otherwise, but the listing has no confirmed date to compare. */
  hiddenUndated: number;
  /** Matched otherwise, but the listing has no price to call free or paid. */
  hiddenUnpriced: number;
  /** Matched otherwise, but the listing has never been geocoded. */
  hiddenUnmapped: number;
}

type Verdict = "pass" | "fail" | "unknown";

function priceVerdict(price: number | null | undefined, filter: PriceFilter): Verdict {
  if (filter === "any") return "pass";
  // null is *unknown*, not zero. Calling it free would advertise paid classes
  // as free, which is the one mistake this app must never make.
  if (price == null || !Number.isFinite(price)) return "unknown";
  if (filter === "free") return price === 0 ? "pass" : "fail";
  return price > 0 ? "pass" : "fail";
}

function distanceVerdict(
  event: FilterableEvent,
  origin: Coords | null,
  radiusMiles: number | null
): Verdict {
  if (radiusMiles == null) return "pass";
  if (!origin) return "pass"; // no origin resolved yet — don't hide the catalogue
  const coords = eventCoords(event);
  if (!coords) return "unknown";
  return distanceMiles(origin, coords) <= radiusMiles ? "pass" : "fail";
}

/**
 * Split events into what the filters admit and what they had to hold back.
 *
 * An event held back for missing data is counted once, under the first reason
 * that applies (date, then price, then location), so the disclosure lines
 * never double-count the same listing.
 */
export function applyEventFilters<T extends FilterableEvent>(
  events: T[],
  filters: EventFilters,
  options: { origin?: Coords | null; now?: Date } = {}
): FilterResult<T> {
  const now = options.now ?? new Date();
  const origin = options.origin ?? null;
  const range = dateRangeFor(filters, now);
  const today = toKey(now);

  const result: FilterResult<T> = {
    dated: [],
    recurring: [],
    hiddenUndated: 0,
    hiddenUnpriced: 0,
    hiddenUnmapped: 0,
  };

  for (const event of events) {
    const isRecurring = parseEventDates(event.description).classification !== "single";

    let dateResult: Verdict;
    if (isRecurring) {
      // Its anchor date means nothing; the listing itself holds the schedule.
      dateResult = range ? "unknown" : "pass";
    } else if (!hasKnownDate(event.date)) {
      dateResult = range ? "unknown" : "pass";
    } else if (range) {
      // The today floor also applies inside a range: every preset starts at
      // today, and a past `day` typed into the URL must not resurrect past
      // events on an upcoming list.
      dateResult =
        event.date >= range.start && event.date <= range.end && event.date >= today
          ? "pass"
          : "fail";
    } else {
      dateResult = event.date >= today ? "pass" : "fail";
    }

    const price = priceVerdict(event.price_cents, filters.price);
    const distance = distanceVerdict(event, origin, filters.radiusMiles);

    if (dateResult === "fail" || price === "fail" || distance === "fail") continue;

    if (dateResult === "unknown" && !isRecurring) {
      result.hiddenUndated++;
      continue;
    }
    if (price === "unknown") {
      result.hiddenUnpriced++;
      continue;
    }
    if (distance === "unknown") {
      result.hiddenUnmapped++;
      continue;
    }

    (isRecurring ? result.recurring : result.dated).push(event);
  }

  result.dated.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

/* ── URL round-trip ──
 * Filters live in the query string so a tap through to an event and back
 * doesn't silently reset them, and so a filtered list can be shared.
 */

const DATE_PRESETS = new Set<DatePreset>([
  "any",
  "today",
  "tomorrow",
  "this-week",
  "next-week",
  "this-month",
]);

const PRICE_FILTERS = new Set<PriceFilter>(["any", "free", "paid"]);

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Read filters out of a query string, ignoring anything malformed. */
export function filtersFromParams(params: URLSearchParams): EventFilters {
  const date = params.get("date") as DatePreset | null;
  const price = params.get("price") as PriceFilter | null;
  const day = params.get("day");
  const radius = Number(params.get("radius"));

  return {
    date: date && DATE_PRESETS.has(date) ? date : "any",
    day: day && DAY_PATTERN.test(day) ? day : null,
    price: price && PRICE_FILTERS.has(price) ? price : "any",
    // While the chips are held back, a stale `?radius=` link must not filter
    // silently — there would be no visible control to undo it.
    radiusMiles:
      DISTANCE_FILTER_ENABLED &&
      (RADIUS_OPTIONS_MILES as readonly number[]).includes(radius)
        ? radius
        : null,
  };
}

/** Write filters into a copy of `params`, dropping the keys that are at default. */
export function applyFiltersToParams(
  filters: EventFilters,
  params: URLSearchParams = new URLSearchParams()
): URLSearchParams {
  const next = new URLSearchParams(params);
  const set = (key: string, value: string | null) =>
    value ? next.set(key, value) : next.delete(key);

  set("date", filters.date !== "any" && !filters.day ? filters.date : null);
  set("day", filters.day);
  set("price", filters.price !== "any" ? filters.price : null);
  set(
    "radius",
    DISTANCE_FILTER_ENABLED && filters.radiusMiles != null
      ? String(filters.radiusMiles)
      : null
  );
  return next;
}
