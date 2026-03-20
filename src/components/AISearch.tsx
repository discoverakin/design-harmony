import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Loader2, Calendar, MapPin } from "lucide-react";
import { hobbies, type HobbyData } from "@/data/hobbies";
import type { CommunityEvent } from "@/data/events";
import { useEvents } from "@/hooks/use-events";
import { formatPrice } from "@/lib/format-price";

interface SearchResults {
  summary: string;
  hobbies: string[];
  events: string[];
}

const AISearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { approvedEvents } = useEvents();

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error("Search request failed");

      const data: SearchResults = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setError(null);
    inputRef.current?.focus();
  };

  // Resolve matched hobbies/events from results
  const matchedHobbies: HobbyData[] = results
    ? results.hobbies
        .map((slug) => hobbies.find((h) => h.slug === slug))
        .filter(Boolean) as HobbyData[]
    : [];

  const matchedEvents: CommunityEvent[] = results
    ? results.events
        .map((id) => approvedEvents.find((e) => e.id === id))
        .filter(Boolean) as CommunityEvent[]
    : [];

  const hasResults = matchedHobbies.length > 0 || matchedEvents.length > 0;

  return (
    <section className="px-4 pt-6 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">AI Search</h2>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 200))}
          onKeyDown={handleKeyDown}
          placeholder="Try &quot;something creative and relaxing&quot;..."
          className="w-full h-11 pl-9 pr-20 rounded-xl border-2 border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 transition-opacity"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Ask"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-6 justify-center"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-3"
          >
            {error}
          </motion.p>
        )}

        {/* Results */}
        {results && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Summary */}
            {results.summary && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {results.summary}
                </p>
              </div>
            )}

            {/* Matched hobbies */}
            {matchedHobbies.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Hobbies
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {matchedHobbies.map((hobby) => (
                    <Link
                      key={hobby.slug}
                      to={`/hobby/${hobby.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card hover:bg-secondary transition-colors"
                    >
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: hobby.bgColor }}
                      >
                        <span className="text-xl">{hobby.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {hobby.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {hobby.difficulty}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Matched events */}
            {matchedEvents.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Events
                </p>
                <div className="space-y-2">
                  {matchedEvents.map((event) => {
                    const dateObj = new Date(event.date + "T00:00:00");
                    const formatted = dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card hover:bg-secondary transition-colors"
                      >
                        <span className="text-2xl flex-shrink-0">
                          {event.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatted} · {event.time}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                          {event.price_cents > 0
                            ? formatPrice(event.price_cents)
                            : "Free"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No matches */}
            {!hasResults && (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="text-3xl mb-2">🤔</span>
                <p className="text-sm text-muted-foreground">
                  No matches found. Try rephrasing your search.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AISearch;
