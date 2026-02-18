const MOCK_AVATARS = ["😊", "🙂", "😄", "🤩", "😎", "🥳", "🤗", "😃"];

interface AvatarStackProps {
  count: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

const AvatarStack = ({ count, max = 4, size = "sm", label }: AvatarStackProps) => {
  if (count <= 0) return null;

  const shown = Math.min(count, max);
  const remaining = count - shown;
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  const overlap = size === "sm" ? "-ml-1.5" : "-ml-2";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {MOCK_AVATARS.slice(0, shown).map((emoji, i) => (
          <div
            key={i}
            className={`${dim} rounded-full bg-secondary border-2 border-card flex items-center justify-center flex-shrink-0 ${i > 0 ? overlap : ""}`}
          >
            {emoji}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={`${dim} rounded-full bg-primary/10 border-2 border-card flex items-center justify-center flex-shrink-0 ${overlap} text-primary font-bold`}
            style={{ fontSize: size === "sm" ? "8px" : "10px" }}
          >
            +{remaining}
          </div>
        )}
      </div>
      {label && (
        <span className="text-[11px] text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

export default AvatarStack;
