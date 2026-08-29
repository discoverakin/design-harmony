import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import { useGoBack } from "@/hooks/use-go-back";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { readSearchCache, writeSearchCache } from "@/lib/searchCache";
import { isUpcoming } from "@/lib/eventDates";

interface ParsedSearch {
  keywords: string;
  hobby_slug: string | null;
  mood: string | null;
  time_of_day: string | null;
  location_hint?: string | null;
  date_filter?: { type: string | null; value?: string | null; start?: string | null; end?: string | null } | null;
}

const HOBBY_EMOJI: Record<string, string> = {
  "cooking": "🍳",
  "arts-crafts": "🎨",
  "pottery": "🏺",
  "knitting": "🧶",
  "coding": "💻",
  "dance": "💃",
  "music": "🎵",
};

interface SearchResult {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price_cents: number;
  emoji: string;
  flyer_url: string | null;
  hobby_slug: string | null;
  description?: string | null;
  price_display?: string | null;
}

const formatSlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack("/home");
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [parsed, setParsed] = useState<ParsedSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const [locationUsed, setLocationUsed] = useState<string | null>(null);

  // Hide past single-day events (keep ongoing/multi). An explicit date range is
  // respected only when the results actually honour it — on a fallback the API
  // dropped the date filter, so past events would otherwise leak back in.
  const visibleResults = useMemo(() => {
    if (parsed?.date_filter?.type && !fallback) return results;
    return results.filter((e) => isUpcoming(e));
  }, [results, parsed, fallback]);

  /** Paint a cached answer without a spinner or a model call. */
  const hydrate = useCallback((cached: ReturnType<typeof readSearchCache>) => {
    if (!cached) return false;
    setResults(cached.results as SearchResult[]);
    setParsed(cached.parsed as ParsedSearch | null);
    setFallback(cached.fallback);
    setLocationUsed(cached.locationUsed);
    setHasSearched(true);
    setError(false);
    setLoading(false);
    return true;
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;

    setLoading(true);
    setError(false);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        setError(true);
        setResults([]);
        setParsed(null);
        return;
      }

      const data = await res.json();
      setResults(data.results ?? []);
      setParsed(data.parsed ?? null);
      setFallback(data.fallback ?? null);
      setLocationUsed(data.location_used ?? null);

      // Cache it so coming back to this search restores exactly these results.
      writeSearchCache({
        query: q,
        results: data.results ?? [],
        parsed: data.parsed ?? null,
        fallback: data.fallback ?? null,
        locationUsed: data.location_used ?? null,
      });
    } catch {
      setError(true);
      setResults([]);
      setParsed(null);
      setFallback(null);
      setLocationUsed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount — including arriving back here from an event — show the cached
  // answer if there is one, and only call the API when there isn't.
  useEffect(() => {
    if (!initialQuery) return;
    if (hydrate(readSearchCache(initialQuery))) return;
    doSearch(initialQuery);
    // Mount only: the query in the URL is the one to answer. Re-running this on
    // every render of doSearch/hydrate would re-search as the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    // Submitting is an explicit ask, so it always re-runs — that is also how a
    // user refreshes a cached answer they no longer trust.
    doSearch(query);
  };

  // Put the results grid back where it was when they tapped a class.
  useScrollRestoration(hasSearched && !loading);

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg px-5 pt-6 pb-8">
          {/* Back — the search view had no way out but the bottom nav, which
              dropped the query. */}
          <button
            onClick={goBack}
            aria-label="Back"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 -ml-1 p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mb-5">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search classes... e.g. 'pottery this weekend'"
                className="w-full h-12 rounded-xl border border-border bg-secondary/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="text-3xl mb-2">😕</span>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && hasSearched && (
            <>
              {/* Location proximity pill */}
              {locationUsed && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FF5B3B]/10 text-[#FF5B3B] border border-[#FF5B3B]/20">
                    📍 Showing classes near {formatSlug(locationUsed)}
                  </span>
                </div>
              )}

              {/* Parsed intent tag */}
              {parsed?.hobby_slug && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {HOBBY_EMOJI[parsed.hobby_slug] || "✨"} Showing results for: {parsed.hobby_slug.replace(/-/g, " ")}
                  </Badge>
                </div>
              )}

              {fallback && visibleResults.length > 0 && (
                <p className="text-sm text-muted-foreground mb-3">
                  {fallback === "location_only" && locationUsed
                    ? `Nothing matching that near ${formatSlug(locationUsed)} — here's what else is on there:`
                    : parsed?.location_hint
                    ? `No classes found in ${formatSlug(parsed.location_hint)} — here are other great options nearby:`
                    : parsed?.hobby_slug && parsed?.date_filter?.type
                    ? `No ${formatSlug(parsed.hobby_slug)} classes found for that time — here are the next available:`
                    : parsed?.mood
                    ? "Nothing for that exact vibe right now — but these are pretty close:"
                    : "Here are some classes you might love:"}
                </p>
              )}

              {visibleResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {visibleResults.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      price_cents={event.price_cents}
                      price_display={event.price_display}
                      emoji={event.emoji}
                      flyer_url={event.flyer_url}
                      hobby_slug={event.hobby_slug}
                      description={event.description}
                      // A result is a specific class. Without this the card
                      // links to /hobby/:slug and a tap lands the user on the
                      // whole category, losing the search they just made.
                      forceEventDetail
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-sm text-muted-foreground">
                    No classes found for that search — try something else!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Search;
