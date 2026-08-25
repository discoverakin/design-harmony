import { describe, it, expect } from "vitest";
import {
  buildMatchFilter,
  buildSearchTerms,
  eventMatchesTerms,
  expandHobbySlug,
  expandMood,
  matchesDateFilter,
  matchesPrice,
  normalizePriceFilter,
  isPastSingleDate,
  rankEvents,
  scoreEvent,
  tokenize,
  type SearchableEvent,
} from "../../api/search";

const feltingWorkshop: SearchableEvent = {
  title: "Saturday Studio Session",
  description:
    "Learn wet felting with merino wool. All materials provided — no experience needed.",
  location: "Kerrytown Market",
  group_name: "Fiber Folk",
  hobby_slug: "knitting",
  search_terms: ["yarn", "wool", "felting"],
  price_cents: 0,
  date: "2026-02-14",
};

const potteryClass: SearchableEvent = {
  title: "Wheel Throwing for Beginners",
  description: "Centre your first pot on the wheel.",
  location: "South Main",
  group_name: null,
  hobby_slug: "pottery",
  search_terms: [],
  price_cents: 4500,
  date: "2026-02-10",
};

describe("tokenize", () => {
  it("drops filler words that appear in every listing", () => {
    expect(tokenize("pottery class near me")).toEqual(["pottery"]);
  });

  it("stems simple plurals so 'quilts' still matches 'quilting'", () => {
    expect(tokenize("quilts")).toEqual(["quilt"]);
  });

  it("keeps short words that are real hobby terms", () => {
    expect(tokenize("ai and diy")).toEqual(["ai", "diy"]);
  });

  it("de-duplicates and caps the term count", () => {
    expect(tokenize("paint paint painting", 2)).toEqual(["paint", "painting"]);
  });
});

describe("buildSearchTerms", () => {
  it("weights Claude's related terms below the keywords themselves", () => {
    const terms = buildSearchTerms({
      keywords: "felting",
      related_terms: ["wool", "fiber"],
    } as never);

    expect(terms[0]).toEqual({ value: "felting", weight: 1 });
    expect(terms.map((t) => t.value)).toEqual(["felting", "wool", "fiber"]);
    expect(terms[1].weight).toBeLessThan(1);
  });

  it("ignores related terms that duplicate a keyword", () => {
    const terms = buildSearchTerms({
      keywords: "pottery",
      related_terms: ["pottery", "clay"],
    } as never);

    expect(terms.map((t) => t.value)).toEqual(["pottery", "clay"]);
  });
});

describe("buildMatchFilter", () => {
  const terms = buildSearchTerms({ keywords: "yarn", related_terms: [] } as never);

  it("searches the whole record, not just the title", () => {
    const filter = buildMatchFilter(terms, { includeSearchTerms: true });

    expect(filter).toContain("title.ilike.*yarn*");
    expect(filter).toContain("description.ilike.*yarn*");
    expect(filter).toContain("location.ilike.*yarn*");
    expect(filter).toContain("group_name.ilike.*yarn*");
    expect(filter).toContain('search_terms.cs.{"yarn"}');
  });

  it("never exposes created_by_name, which can be an email fragment", () => {
    expect(buildMatchFilter(terms, { includeSearchTerms: true })).not.toContain(
      "created_by_name"
    );
  });

  it("drops the search_terms condition when the column is missing", () => {
    const filter = buildMatchFilter(terms, { includeSearchTerms: false });

    expect(filter).toContain("title.ilike.*yarn*");
    expect(filter).not.toContain("search_terms");
  });

  it("ORs the parsed hobby with the keywords rather than replacing them", () => {
    const filter = buildMatchFilter(terms, {
      hobbySlugs: expandHobbySlug("knitting"),
      includeSearchTerms: true,
    });

    expect(filter).toContain("hobby_slug.in.(knitting,");
    expect(filter).toContain("description.ilike.*yarn*");
  });

  it("expands a mood into its hobby slugs", () => {
    expect(buildMatchFilter([], { moodSlugs: ["pottery", "ceramics"] })).toBe(
      "hobby_slug.in.(pottery,ceramics)"
    );
  });

  it("uses eq for a hobby with no aliases", () => {
    expect(buildMatchFilter([], { hobbySlugs: expandHobbySlug("dance") })).toBe(
      "hobby_slug.eq.dance"
    );
  });

  it("returns null when there is nothing to match on", () => {
    expect(buildMatchFilter([], {})).toBeNull();
  });
});

describe("scoreEvent", () => {
  it("finds a class whose only match is in the description", () => {
    const terms = buildSearchTerms({ keywords: "merino", related_terms: [] } as never);
    expect(scoreEvent(feltingWorkshop, terms)).toBeGreaterThan(0);
  });

  it("finds a class through its curated associated terms", () => {
    const terms = buildSearchTerms({ keywords: "yarn", related_terms: [] } as never);
    expect(scoreEvent(feltingWorkshop, terms)).toBeGreaterThan(0);
    expect(scoreEvent(potteryClass, terms)).toBe(0);
  });

  it("ranks a title hit above a description hit", () => {
    const terms = buildSearchTerms({ keywords: "wheel", related_terms: [] } as never);
    const inTitle = scoreEvent(potteryClass, terms);
    const inDescription = scoreEvent(
      { ...potteryClass, title: "Beginners Night", description: "Use the wheel." },
      terms
    );
    expect(inTitle).toBeGreaterThan(inDescription);
  });

  it("scores nothing for an unrelated query", () => {
    const terms = buildSearchTerms({ keywords: "salsa", related_terms: [] } as never);
    expect(scoreEvent(feltingWorkshop, terms)).toBe(0);
  });
});

describe("rankEvents", () => {
  it("puts the better match first even though it is the later date", () => {
    const terms = buildSearchTerms({ keywords: "wool", related_terms: [] } as never);
    const ranked = rankEvents([potteryClass, feltingWorkshop], terms);
    expect(ranked[0]).toBe(feltingWorkshop);
  });

  it("falls back to soonest-first when relevance ties", () => {
    const ranked = rankEvents([feltingWorkshop, potteryClass], [], null, "2026-01-01");
    expect(ranked.map((e) => e.date)).toEqual(["2026-02-10", "2026-02-14"]);
  });

  it("puts past events after upcoming ones, whatever the date order", () => {
    // The fallback tier drops the date filter, so a plain date sort would fill
    // the results with the oldest events in the table.
    const ranked = rankEvents([potteryClass, feltingWorkshop], [], null, "2026-02-12");
    expect(ranked.map((e) => e.date)).toEqual(["2026-02-14", "2026-02-10"]);
  });
});

describe("isPastSingleDate", () => {
  const today = "2026-02-12";

  it("is past when the single date has gone", () => {
    expect(isPastSingleDate(potteryClass, today)).toBe(true);
  });

  it("is not past when the date is today or later", () => {
    expect(isPastSingleDate(feltingWorkshop, today)).toBe(false);
    expect(isPastSingleDate({ ...potteryClass, date: today }, today)).toBe(false);
  });

  it("keeps recurring events whose anchor date has passed", () => {
    // Multi-date events carry an old anchor plus a "Dates:" prefix.
    const weekly = {
      ...potteryClass,
      description: "Dates: Every Wednesday (incl. Jul 9, 16, 2026), 7:30-9:30 PM. Weekly social.",
    };
    expect(isPastSingleDate(weekly, today)).toBe(false);
  });

  it("keeps multi-session courses whose anchor date has passed", () => {
    const course = {
      ...potteryClass,
      description: "Dates: 6-week course starting March. Hand-building sessions.",
    };
    expect(isPastSingleDate(course, today)).toBe(false);
  });

  it("is not past when there is no date at all", () => {
    expect(isPastSingleDate({ ...potteryClass, date: null }, today)).toBe(false);
  });
});

describe("price filtering", () => {
  it("reads a free-only intent", () => {
    const filter = normalizePriceFilter({ type: "free", max_cents: null });
    expect(matchesPrice(feltingWorkshop, filter)).toBe(true);
    expect(matchesPrice(potteryClass, filter)).toBe(false);
  });

  it("applies a ceiling", () => {
    const filter = normalizePriceFilter({ type: "under", max_cents: 3000 });
    expect(matchesPrice(potteryClass, filter)).toBe(false);
    expect(matchesPrice({ ...potteryClass, price_cents: 2000 }, filter)).toBe(true);
  });

  it("does not call an unpriced class free", () => {
    // price_cents null means the price lives in price_display as text.
    const unpriced = { ...potteryClass, price_cents: null };
    expect(matchesPrice(unpriced, normalizePriceFilter({ type: "free" }))).toBe(false);
    expect(matchesPrice(unpriced, normalizePriceFilter({ type: "paid" }))).toBe(false);
    expect(
      matchesPrice(unpriced, normalizePriceFilter({ type: "under", max_cents: 3000 }))
    ).toBe(false);
  });

  it("still shows unpriced classes when no price was asked for", () => {
    const unpriced = { ...potteryClass, price_cents: null };
    expect(matchesPrice(unpriced, normalizePriceFilter(null))).toBe(true);
  });

  it("ignores a malformed filter instead of hiding everything", () => {
    const filter = normalizePriceFilter({ type: "cheapish" });
    expect(filter.type).toBeNull();
    expect(matchesPrice(potteryClass, filter)).toBe(true);
  });
});

describe("date filtering", () => {
  it("matches a day of the week", () => {
    expect(
      matchesDateFilter(feltingWorkshop, { type: "day_of_week", value: "Saturday" })
    ).toBe(true);
    expect(
      matchesDateFilter(potteryClass, { type: "day_of_week", value: "Saturday" })
    ).toBe(false);
  });

  it("matches a range", () => {
    const range = { type: "date_range" as const, value: null, start: "2026-02-13", end: "2026-02-15" };
    expect(matchesDateFilter(feltingWorkshop, range)).toBe(true);
    expect(matchesDateFilter(potteryClass, range)).toBe(false);
  });

  it("passes everything through when no date was parsed", () => {
    expect(matchesDateFilter(potteryClass, { type: null, value: null })).toBe(true);
  });
});

describe("eventMatchesTerms (proximity branch)", () => {
  const terms = buildSearchTerms({ keywords: "wool", related_terms: [] } as never);

  it("keeps a nearby class that matches on description", () => {
    expect(eventMatchesTerms(feltingWorkshop, terms, null, [])).toBe(true);
  });

  it("drops a nearby class that matches nothing", () => {
    expect(eventMatchesTerms(potteryClass, terms, null, [])).toBe(false);
  });

  it("keeps everything when the query carried no topic at all", () => {
    expect(eventMatchesTerms(potteryClass, [], null, [])).toBe(true);
  });

  it("keeps a hobby match even without keyword hits", () => {
    expect(eventMatchesTerms(potteryClass, [], expandHobbySlug("pottery"), [])).toBe(true);
    expect(eventMatchesTerms(feltingWorkshop, [], expandHobbySlug("pottery"), [])).toBe(false);
  });

  it("keeps a sibling slug — 'ceramics' is what the data calls pottery", () => {
    const ceramics = { ...potteryClass, hobby_slug: "ceramics" };
    expect(eventMatchesTerms(ceramics, [], expandHobbySlug("pottery"), [])).toBe(true);
  });
});

describe("hobby slug aliasing", () => {
  it("reaches the slugs the data actually uses, not just the parsed one", () => {
    // "baking class" parses to `cooking`, but no event is tagged `cooking`.
    expect(expandHobbySlug("cooking")).toContain("baking");
    expect(expandHobbySlug("pottery")).toContain("ceramics");
    expect(expandHobbySlug("knitting")).toContain("crochet");
    expect(expandHobbySlug("coding")).toContain("3d-printing");
  });

  it("puts the parsed slug first so it can outrank its aliases", () => {
    expect(expandHobbySlug("pottery")[0]).toBe("pottery");
  });

  it("passes through a slug it has no aliases for", () => {
    expect(expandHobbySlug("underwater-basket-weaving")).toEqual([
      "underwater-basket-weaving",
    ]);
  });

  it("returns nothing for a null slug", () => {
    expect(expandHobbySlug(null)).toEqual([]);
  });

  it("scores an exact slug above an alias", () => {
    const exact = scoreEvent(potteryClass, [], expandHobbySlug("pottery"));
    const alias = scoreEvent(
      { ...potteryClass, hobby_slug: "ceramics" },
      [],
      expandHobbySlug("pottery")
    );
    expect(exact).toBeGreaterThan(alias);
    expect(alias).toBeGreaterThan(0);
  });

  it("expands a mood through to live slugs", () => {
    // Without this, "something relaxing" resolves to slugs no event has and
    // the whole query falls through to the all-events fallback.
    const relaxing = expandMood("relaxing");
    expect(relaxing).toContain("ceramics");
    expect(relaxing).toContain("crochet");
    expect(new Set(relaxing).size).toBe(relaxing.length);
  });

  it("returns nothing for an unknown mood", () => {
    expect(expandMood("hungry")).toEqual([]);
    expect(expandMood(null)).toEqual([]);
  });
});
