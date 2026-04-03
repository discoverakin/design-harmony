import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import HobbyCategoryCard from "./HobbyCategoryCard";
import { hobbies } from "@/data/hobbies";

const INITIAL_COUNT = 6;

const BrowseHobbiesSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    let result = hobbies;
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (h) =>
          h.label.toLowerCase().includes(q) ||
          h.slug.toLowerCase().includes(q) ||
          h.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [query]);

  const showToggle = !isSearching && filtered.length > INITIAL_COUNT;
  const visible = isSearching || expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

  return (
    <section className="px-4 pt-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Browse Hobbies</h2>

      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 100))}
            placeholder="Search hobbies or classes…"
            className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {query.trim() && (
          <button
            type="submit"
            className="flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Search classes
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <p className="text-[10px] text-muted-foreground/70 mt-1.5">
          Try "something relaxing this weekend" for AI-powered class search
        </p>
      </form>

      {isSearching && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query.trim().slice(0, 50)}"
        </p>
      )}

      {isSearching && filtered.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="text-3xl mb-2">🔍</span>
          <p className="text-sm text-muted-foreground">
            No hobbies found for "{query.trim().slice(0, 50)}"
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {visible.map((hobby) => (
              <HobbyCategoryCard
                key={hobby.slug}
                emoji={hobby.emoji}
                label={hobby.label}
                bgColor={hobby.bgColor}
                slug={hobby.slug}
              />
            ))}
          </div>

          {showToggle && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {expanded ? (
                <>
                  Show less hobbies
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show more hobbies
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default BrowseHobbiesSection;
