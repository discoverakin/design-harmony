import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import HobbyCategoryCard from "./HobbyCategoryCard";
import { hobbies } from "@/data/hobbies";

const BrowseHobbiesSection = () => {
  const [query, setQuery] = useState("");

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

  return (
    <section className="px-4 pt-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Browse Hobbies</h2>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 100))}
          placeholder="Search hobbies…"
          className="w-full h-10 pl-9 pr-9 rounded-xl border-2 border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((hobby) => (
            <HobbyCategoryCard
              key={hobby.slug}
              emoji={hobby.emoji}
              label={hobby.label}
              bgColor={hobby.bgColor}
              slug={hobby.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BrowseHobbiesSection;
