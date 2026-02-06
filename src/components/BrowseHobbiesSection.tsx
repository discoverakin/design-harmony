import HobbyCategoryCard from "./HobbyCategoryCard";

const categories = [
  { emoji: "🎨", label: "Arts &\nCrafts", bgColor: "hsl(18 100% 92%)" },
  { emoji: "⚽", label: "Sports", bgColor: "hsl(209 100% 95%)" },
  { emoji: "🎵", label: "Music", bgColor: "hsl(40 100% 93%)" },
  { emoji: "👨‍🍳", label: "Cooking", bgColor: "hsl(120 100% 93%)" },
  { emoji: "📚", label: "Reading", bgColor: "hsl(270 100% 95%)" },
  { emoji: "🎮", label: "Gaming", bgColor: "hsl(330 100% 95%)" },
];

const BrowseHobbiesSection = () => {
  return (
    <section className="px-4 pt-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Browse Hobbies</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <HobbyCategoryCard
            key={cat.label}
            emoji={cat.emoji}
            label={cat.label}
            bgColor={cat.bgColor}
          />
        ))}
      </div>
    </section>
  );
};

export default BrowseHobbiesSection;
