interface HobbyCategoryCardProps {
  emoji: string;
  label: string;
  bgColor: string;
}

const HobbyCategoryCard = ({ emoji, label, bgColor }: HobbyCategoryCardProps) => {
  return (
    <button className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary transition-colors w-full">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-2xl">{emoji}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-left">{label}</span>
    </button>
  );
};

export default HobbyCategoryCard;
