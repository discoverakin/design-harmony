/**
 * Session cache for AI search results, so coming *back* to a search is
 * instant and identical.
 *
 * Every search is an Anthropic parse behind an unauthenticated function. Before
 * this, returning from an event re-ran the whole query: a spinner, a second of
 * waiting, and results that could legitimately come back in a different order
 * than the ones the user had just been looking at. That is losing your place,
 * not restoring it.
 *
 * Deliberately `sessionStorage`: a search is a train of thought, not a
 * preference, and it should not outlive the tab. Entries also expire, because a
 * "today" search answered this morning is wrong by tonight.
 */

const STORAGE_KEY = "akin-search-cache";
const MAX_ENTRIES = 8;
const TTL_MS = 60 * 60 * 1000; // an hour — long enough for a browse session

export interface CachedSearch {
  /** The normalised query these results answer. */
  query: string;
  results: unknown[];
  parsed: unknown | null;
  fallback: string | null;
  locationUsed: string | null;
  /** Epoch ms, for expiry. */
  savedAt: number;
}

export const normaliseQuery = (raw: string) => raw.trim().toLowerCase();

function readAll(now: number): CachedSearch[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as CachedSearch[]).filter(
      (entry) =>
        entry &&
        typeof entry.query === "string" &&
        Array.isArray(entry.results) &&
        typeof entry.savedAt === "number" &&
        now - entry.savedAt < TTL_MS
    );
  } catch {
    // Private mode, a full quota, or something else wrote garbage here. A cache
    // that throws is worse than no cache.
    return [];
  }
}

/** The cached answer for a query, or null when there isn't a fresh one. */
export function readSearchCache(
  query: string,
  now: number = Date.now()
): CachedSearch | null {
  const key = normaliseQuery(query);
  if (!key) return null;
  return readAll(now).find((entry) => entry.query === key) ?? null;
}

/** Cache one answer, newest first, capped at MAX_ENTRIES. */
export function writeSearchCache(
  entry: Omit<CachedSearch, "query" | "savedAt"> & { query: string },
  now: number = Date.now()
): void {
  const key = normaliseQuery(entry.query);
  if (!key) return;

  const next: CachedSearch = { ...entry, query: key, savedAt: now };
  const rest = readAll(now).filter((e) => e.query !== key);

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([next, ...rest].slice(0, MAX_ENTRIES))
    );
  } catch {
    // Over quota: drop the cache rather than the search.
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing left to do */
    }
  }
}

export function clearSearchCache(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
