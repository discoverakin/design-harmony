import { Link } from "react-router-dom";

interface HobbyCategoryCardProps {
  emoji: string;
  label: string;
  bgColor: string;
  slug: string;
}

const HobbyCategoryCard = ({ emoji, label, bgColor, slug }: HobbyCategoryCardProps) => {
  return (
    <Link
      to={`/hobby/${slug}`}
      className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary transition-colors w-full"
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-2xl">{emoji}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-left">{label}</span>
    </Link>
  );
};

export default HobbyCategoryCard;
