import { describe, it, expect } from "vitest";
import {
  applyEventFilters,
  applyFiltersToParams,
  countActiveFilters,
  dateRangeFor,
  filtersFromParams,
  NO_FILTERS,
  type EventFilters,
} from "@/lib/eventFilters";
import { ANN_ARBOR_CENTER, distanceMiles, eventCoords } from "@/lib/geo";

// Wednesday, 26 August 2026 — a mid-week day, so "this week" has days left in it.
const NOW = new Date(2026, 7, 26, 10, 0, 0);

const filters = (overrides: Partial<EventFilters> = {}): EventFilters => ({
  ...NO_FILTERS,
  ...overrides,
});

/** A single-date event in downtown Ann Arbor unless overridden. */
const event = (overrides: Record<string, unknown> = {}) => ({
  id: "e1",
  date: "2026-08-26",
  description: "A one-off class.",
  price_cents: 2500,
  lat: 42.2808,
  lng: -83.743,
  ...overrides,
});

describe("dateRangeFor", () => {
  it("selects everything when no date filter is set", () => {
    expect(dateRangeFor(filters(), NOW)).toBeNull();
  });

  it("selects today and tomorrow", () => {
    expect(dateRangeFor(filters({ date: "today" }), NOW)).toEqual({
      start: "2026-08-26",
      end: "2026-08-26",
    });
    expect(dateRangeFor(filters({ date: "tomorrow" }), NOW)).toEqual({
      start: "2026-08-27",
      end: "2026-08-27",
    });
  });

  it("starts 'this week' and 'this month' at today, not at the period start", () => {
    // This feeds an upcoming list — days already gone are not on offer.
    expect(dateRangeFor(filters({ date: "this-week" }), NOW)).toEqual({
      start: "2026-08-26",
      end: "2026-08-29",
    });
    expect(dateRangeFor(filters({ date: "this-month" }), NOW)).toEqual({
      start: "2026-08-26",
      end: "2026-08-31",
    });
  });

  it("selects the whole of next week", () => {
    expect(dateRangeFor(filters({ date: "next-week" }), NOW)).toEqual({
      start: "2026-08-30",
      end: "2026-09-05",
    });
  });

  it("lets a picked day win over a preset", () => {
    expect(
      dateRangeFor(filters({ date: "today", day: "2026-09-12" }), NOW)
    ).toEqual({ start: "2026-09-12", end: "2026-09-12" });
  });
});

describe("applyEventFilters — dates", () => {
  it("drops past events and keeps upcoming ones when no date filter is set", () => {
    const result = applyEventFilters(
      [event({ id: "past", date: "2026-08-01" }), event({ id: "soon", date: "2026-09-01" })],
      filters(),
      { now: NOW }
    );
    expect(result.dated.map((e) => e.id)).toEqual(["soon"]);
  });

  it("keeps only events inside the selected range", () => {
    const result = applyEventFilters(
      [
        event({ id: "today", date: "2026-08-26" }),
        event({ id: "friday", date: "2026-08-28" }),
        event({ id: "next-month", date: "2026-09-20" }),
      ],
      filters({ date: "this-week" }),
      { now: NOW }
    );
    expect(result.dated.map((e) => e.id)).toEqual(["today", "friday"]);
  });

  it("never resurrects a past event, even for a date typed into the URL", () => {
    const result = applyEventFilters(
      [event({ id: "last-week", date: "2026-08-19" })],
      filters({ day: "2026-08-19" }),
      { now: NOW }
    );
    expect(result.dated).toHaveLength(0);
  });

  it("returns dated results soonest first", () => {
    const result = applyEventFilters(
      [event({ id: "b", date: "2026-09-10" }), event({ id: "a", date: "2026-09-02" })],
      filters(),
      { now: NOW }
    );
    expect(result.dated.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("holds back the no-schedule sentinel date instead of matching it", () => {
    // 2099-01-01 means "we could not read a date", so it is not "today" —
    // but it is real inventory, so the count is reported rather than dropped.
    const sentinel = [event({ id: "unknown-date", date: "2099-01-01" })];

    const filtered = applyEventFilters(sentinel, filters({ date: "today" }), { now: NOW });
    expect(filtered.dated).toHaveLength(0);
    expect(filtered.hiddenUndated).toBe(1);

    const unfiltered = applyEventFilters(sentinel, filters(), { now: NOW });
    expect(unfiltered.dated.map((e) => e.id)).toEqual(["unknown-date"]);
    expect(unfiltered.hiddenUndated).toBe(0);
  });
});

describe("applyEventFilters — recurring listings", () => {
  const weekly = event({
    id: "weekly",
    date: "2026-01-05", // anchor date in the past; the class still runs
    description: "Dates: Weekly on Mondays. Open studio.",
  });

  it("keeps ongoing events out of the dated bucket, past anchor date and all", () => {
    const result = applyEventFilters([weekly], filters(), { now: NOW });
    expect(result.dated).toHaveLength(0);
    expect(result.recurring.map((e) => e.id)).toEqual(["weekly"]);
  });

  it("still surfaces them under a date filter rather than guessing", () => {
    // The anchor date cannot answer "is it on Friday?", so they are shown
    // separately and labelled, not silently matched or silently dropped.
    const result = applyEventFilters([weekly], filters({ date: "tomorrow" }), { now: NOW });
    expect(result.recurring.map((e) => e.id)).toEqual(["weekly"]);
    expect(result.hiddenUndated).toBe(0);
  });

  it("applies price and distance to them like anything else", () => {
    const result = applyEventFilters([weekly], filters({ price: "free" }), { now: NOW });
    expect(result.recurring).toHaveLength(0);
  });
});

describe("applyEventFilters — price", () => {
  const events = [
    event({ id: "free", price_cents: 0 }),
    event({ id: "paid", price_cents: 4500 }),
    event({ id: "unknown", price_cents: null }),
  ];

  it("treats only a zero price as free", () => {
    const result = applyEventFilters(events, filters({ price: "free" }), { now: NOW });
    expect(result.dated.map((e) => e.id)).toEqual(["free"]);
  });

  it("treats only a positive price as paid", () => {
    const result = applyEventFilters(events, filters({ price: "paid" }), { now: NOW });
    expect(result.dated.map((e) => e.id)).toEqual(["paid"]);
  });

  it("never counts an unknown price as free, and says how many it held back", () => {
    // A quarter of approved events have no price at all (docs/data-quality.md).
    // Calling those free would advertise paid classes as free.
    const free = applyEventFilters(events, filters({ price: "free" }), { now: NOW });
    expect(free.dated.map((e) => e.id)).not.toContain("unknown");
    expect(free.hiddenUnpriced).toBe(1);
  });

  it("shows unpriced events when no price filter is set", () => {
    const result = applyEventFilters(events, filters(), { now: NOW });
    expect(result.dated).toHaveLength(3);
    expect(result.hiddenUnpriced).toBe(0);
  });
});

describe("applyEventFilters — distance", () => {
  // Gallup Park is ~2.4 miles east of downtown; Ypsilanti is ~7 miles out.
  const nearby = event({ id: "gallup", lat: 42.2766, lng: -83.7191 });
  const farther = event({ id: "ypsi", lat: 42.2411, lng: -83.6129 });
  const unmapped = event({ id: "unmapped", lat: null, lng: null });

  it("keeps events inside the radius and drops the ones beyond it", () => {
    const result = applyEventFilters([nearby, farther], filters({ radiusMiles: 3 }), {
      now: NOW,
      origin: ANN_ARBOR_CENTER,
    });
    expect(result.dated.map((e) => e.id)).toEqual(["gallup"]);
  });

  it("widens with the radius", () => {
    const result = applyEventFilters([nearby, farther], filters({ radiusMiles: 10 }), {
      now: NOW,
      origin: ANN_ARBOR_CENTER,
    });
    expect(result.dated.map((e) => e.id)).toEqual(["gallup", "ypsi"]);
  });

  it("holds back events that were never geocoded, and counts them", () => {
    const result = applyEventFilters([unmapped], filters({ radiusMiles: 5 }), {
      now: NOW,
      origin: ANN_ARBOR_CENTER,
    });
    expect(result.dated).toHaveLength(0);
    expect(result.hiddenUnmapped).toBe(1);
  });

  it("shows unmapped events when no radius is set", () => {
    const result = applyEventFilters([unmapped], filters(), { now: NOW });
    expect(result.dated.map((e) => e.id)).toEqual(["unmapped"]);
  });

  it("does not hide the catalogue while an origin is still resolving", () => {
    const result = applyEventFilters([nearby, farther], filters({ radiusMiles: 1 }), {
      now: NOW,
      origin: null,
    });
    expect(result.dated).toHaveLength(2);
  });
});

describe("applyEventFilters — counts", () => {
  it("counts a held-back event once, under the first reason that applies", () => {
    const result = applyEventFilters(
      [event({ id: "both", price_cents: null, lat: null, lng: null })],
      filters({ price: "free", radiusMiles: 3 }),
      { now: NOW, origin: ANN_ARBOR_CENTER }
    );
    expect(result.hiddenUnpriced).toBe(1);
    expect(result.hiddenUnmapped).toBe(0);
  });

  it("does not count events a filter genuinely excluded", () => {
    const result = applyEventFilters(
      [event({ id: "paid", price_cents: 5000 })],
      filters({ price: "free" }),
      { now: NOW }
    );
    expect(result.hiddenUnpriced).toBe(0);
  });
});

describe("distanceMiles", () => {
  it("measures a degree of latitude and a degree of longitude differently", () => {
    // The point of using a great circle: at 42°N a degree of longitude is only
    // ~74% as wide as a degree of latitude, so a radius must not be a square.
    const northSouth = distanceMiles(ANN_ARBOR_CENTER, {
      lat: ANN_ARBOR_CENTER.lat + 1,
      lng: ANN_ARBOR_CENTER.lng,
    });
    const eastWest = distanceMiles(ANN_ARBOR_CENTER, {
      lat: ANN_ARBOR_CENTER.lat,
      lng: ANN_ARBOR_CENTER.lng + 1,
    });
    expect(northSouth).toBeCloseTo(69, 0);
    expect(eastWest).toBeCloseTo(51.3, 0);
  });

  it("is zero for the same point", () => {
    expect(distanceMiles(ANN_ARBOR_CENTER, ANN_ARBOR_CENTER)).toBe(0);
  });
});

describe("eventCoords", () => {
  it("reads numeric and string columns alike", () => {
    expect(eventCoords({ lat: 42.28, lng: -83.74 })).toEqual({ lat: 42.28, lng: -83.74 });
    expect(eventCoords({ lat: "42.28", lng: "-83.74" })).toEqual({
      lat: 42.28,
      lng: -83.74,
    });
  });

  it("rejects missing, unparseable, and null-island coordinates", () => {
    expect(eventCoords({ lat: null, lng: -83.74 })).toBeNull();
    expect(eventCoords({})).toBeNull();
    expect(eventCoords({ lat: "n/a", lng: "n/a" })).toBeNull();
    expect(eventCoords({ lat: 0, lng: 0 })).toBeNull();
  });
});

describe("filters in the URL", () => {
  it("round-trips a full set of filters", () => {
    const original = filters({ date: "next-week", price: "free", radiusMiles: 5 });
    expect(filtersFromParams(applyFiltersToParams(original))).toEqual(original);
  });

  it("writes nothing for defaults", () => {
    expect(applyFiltersToParams(NO_FILTERS).toString()).toBe("");
  });

  it("preserves query params it does not own", () => {
    const params = new URLSearchParams({ q: "pottery" });
    const next = applyFiltersToParams(filters({ price: "paid" }), params);
    expect(next.get("q")).toBe("pottery");
    expect(next.get("price")).toBe("paid");
  });

  it("clears a stale preset when a specific day is written", () => {
    const next = applyFiltersToParams(filters({ date: "today", day: "2026-09-12" }));
    expect(next.get("date")).toBeNull();
    expect(next.get("day")).toBe("2026-09-12");
  });

  it("ignores values it did not put there", () => {
    const params = new URLSearchParams({
      date: "whenever",
      day: "next tuesday",
      price: "cheap",
      radius: "9999",
    });
    expect(filtersFromParams(params)).toEqual(NO_FILTERS);
  });
});

describe("countActiveFilters", () => {
  it("counts each facet once", () => {
    expect(countActiveFilters(NO_FILTERS)).toBe(0);
    expect(countActiveFilters(filters({ date: "today" }))).toBe(1);
    expect(countActiveFilters(filters({ day: "2026-09-12" }))).toBe(1);
    expect(
      countActiveFilters(filters({ date: "today", price: "free", radiusMiles: 3 }))
    ).toBe(3);
  });
});
