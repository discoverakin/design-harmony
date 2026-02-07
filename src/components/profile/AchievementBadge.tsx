interface AchievementBadgeProps {
  emoji: string;
  label: string;
  unlocked: boolean;
}

const AchievementBadge = ({ emoji, label, unlocked }: AchievementBadgeProps) => (
  <div
    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
      unlocked
        ? "border-primary/20 bg-secondary shadow-sm"
        : "border-border bg-muted/30 opacity-50 grayscale"
    }`}
  >
    <span className="text-2xl">{emoji}</span>
    <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
      {label}
    </span>
  </div>
);

export default AchievementBadge;
