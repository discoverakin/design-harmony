import { hobbyCategories, type HobbyCategory } from "@/data/hobbies";

interface EventFiltersProps {
  selected: HobbyCategory | "All";
  onSelect: (category: HobbyCategory | "All") => void;
}

const EventFilters = ({ selected, onSelect }: EventFiltersProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSelect("All")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-2 ${
          selected === "All"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:border-primary/30"
        }`}
      >
        ✨ All
      </button>
      {hobbyCategories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-2 ${
            selected === cat.key
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/30"
          }`}
        >
          {cat.emoji} {cat.key}
        </button>
      ))}
    </div>
  );
};

export default EventFilters;
