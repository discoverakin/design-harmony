import { hobbyCategories, type HobbyCategory } from "@/data/hobbies";

interface CategoryBreakdownProps {
  data: { category: string; minutes: number }[];
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const categoryEmojis: Record<string, string> = {
  Creative: "🎨",
  Active: "⚡",
  Social: "🤝",
  Intellectual: "🧠",
};

const CategoryBreakdown = ({ data }: CategoryBreakdownProps) => {
  if (data.length === 0) return null;

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="rounded-xl bg-secondary/40 p-4">
      <h3 className="text-xs font-bold text-foreground mb-3">Category Breakdown</h3>
      <div className="space-y-2.5">
        {data.map((item) => {
          const pct = Math.round((item.minutes / totalMinutes) * 100);
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {categoryEmojis[item.category] || "🎯"} {item.category}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatTime(item.minutes)} · {pct}%
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, opacity: 0.4 + (pct / 100) * 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
