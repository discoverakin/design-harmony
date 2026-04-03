import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";

interface ParsedSearch {
  keywords: string;
  hobby_slug: string | null;
  mood: string | null;
  time_of_day: string | null;
}

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
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [parsed, setParsed] = useState<ParsedSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);

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
    } catch {
      setError(true);
      setResults([]);
      setParsed(null);
      setFallback(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search on mount if q param exists
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    doSearch(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg px-5 pt-6 pb-8">
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
              {/* Parsed intent tag */}
              {parsed?.hobby_slug && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    Showing results for: {parsed.hobby_slug.replace(/-/g, " ")} 🎨
                  </Badge>
                </div>
              )}

              {fallback && results.length > 0 && (
                <p className="text-sm text-muted-foreground mb-3">
                  No classes found for that exact time — here are the closest matches:
                </p>
              )}

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      price_cents={event.price_cents}
                      emoji={event.emoji}
                      flyer_url={event.flyer_url}
                      hobby_slug={event.hobby_slug}
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
