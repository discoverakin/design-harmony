import HobbyCategoryCard from "./HobbyCategoryCard";
import { hobbies } from "@/data/hobbies";

const BrowseHobbiesSection = () => {
  return (
    <section className="px-4 pt-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Browse Hobbies</h2>
      <div className="grid grid-cols-2 gap-3">
        {hobbies.map((cat) => (
          <HobbyCategoryCard
            key={cat.slug}
            emoji={cat.emoji}
            label={cat.label}
            bgColor={cat.bgColor}
            slug={cat.slug}
          />
        ))}
      </div>
    </section>
  );
};

export default BrowseHobbiesSection;
