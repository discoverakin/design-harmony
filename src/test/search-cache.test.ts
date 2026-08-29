import { describe, it, expect, beforeEach } from "vitest";
import {
  clearSearchCache,
  normaliseQuery,
  readSearchCache,
  writeSearchCache,
} from "@/lib/searchCache";

/**
 * Coming back to a search should restore the results the user was looking at,
 * not re-run the model and hope it answers the same way.
 */

const NOW = new Date(2026, 7, 26, 12, 0, 0).getTime();
const HOUR = 60 * 60 * 1000;

const entry = (query: string, ids: string[]) => ({
  query,
  results: ids.map((id) => ({ id })),
  parsed: { hobby_slug: "pottery" },
  fallback: null,
  locationUsed: null,
});

beforeEach(() => {
  clearSearchCache();
});

describe("search cache", () => {
  it("returns the results it stored", () => {
    writeSearchCache(entry("pottery this weekend", ["a", "b"]), NOW);
    const hit = readSearchCache("pottery this weekend", NOW);
    expect(hit?.results).toEqual([{ id: "a" }, { id: "b" }]);
    expect(hit?.parsed).toEqual({ hobby_slug: "pottery" });
  });

  it("ignores case and surrounding space", () => {
    writeSearchCache(entry("Pottery This Weekend", ["a"]), NOW);
    expect(readSearchCache("  pottery this weekend ", NOW)?.results).toHaveLength(1);
    expect(normaliseQuery("  Pottery  ")).toBe("pottery");
  });

  it("misses on a query it has not seen", () => {
    writeSearchCache(entry("pottery", ["a"]), NOW);
    expect(readSearchCache("knitting", NOW)).toBeNull();
  });

  it("expires after an hour — a 'today' answer is wrong by tonight", () => {
    writeSearchCache(entry("things today", ["a"]), NOW);
    expect(readSearchCache("things today", NOW + HOUR - 1000)).not.toBeNull();
    expect(readSearchCache("things today", NOW + HOUR + 1000)).toBeNull();
  });

  it("replaces an entry rather than duplicating it", () => {
    writeSearchCache(entry("pottery", ["old"]), NOW);
    writeSearchCache(entry("pottery", ["new"]), NOW + 1000);
    expect(readSearchCache("pottery", NOW + 2000)?.results).toEqual([{ id: "new" }]);
  });

  it("keeps only the most recent 8 searches", () => {
    for (let i = 0; i < 10; i++) {
      writeSearchCache(entry(`query ${i}`, [String(i)]), NOW + i);
    }
    expect(readSearchCache("query 9", NOW + 100)).not.toBeNull();
    expect(readSearchCache("query 2", NOW + 100)).not.toBeNull();
    // The two oldest fell off the end.
    expect(readSearchCache("query 0", NOW + 100)).toBeNull();
    expect(readSearchCache("query 1", NOW + 100)).toBeNull();
  });

  it("survives garbage in storage", () => {
    sessionStorage.setItem("akin-search-cache", "{not json");
    expect(readSearchCache("pottery", NOW)).toBeNull();
    writeSearchCache(entry("pottery", ["a"]), NOW);
    expect(readSearchCache("pottery", NOW)?.results).toHaveLength(1);
  });

  it("ignores an empty query in both directions", () => {
    writeSearchCache(entry("   ", ["a"]), NOW);
    expect(readSearchCache("   ", NOW)).toBeNull();
  });
});
