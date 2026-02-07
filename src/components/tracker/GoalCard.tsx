import { Trash2 } from "lucide-react";
import ProgressRing from "./ProgressRing";
import type { GoalProgress } from "@/hooks/use-tracker-goals";

interface GoalCardProps {
  progress: GoalProgress;
  onDelete: (id: string) => void;
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const GoalCard = ({ progress, onDelete }: GoalCardProps) => {
  const { goal, currentMinutes, percentage, isComplete } = progress;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isComplete
          ? "bg-primary/10 ring-1 ring-primary/20"
          : "bg-secondary/60"
      }`}
    >
      <ProgressRing percentage={percentage} size={56} strokeWidth={4}>
        <span className="text-lg">{isComplete ? "🎉" : goal.emoji}</span>
      </ProgressRing>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {goal.label}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatTime(currentMinutes)}{" "}
          <span className="text-muted-foreground/60">/ {formatTime(goal.targetMinutes)}</span>
          {" · "}
          <span className="capitalize">{goal.period}</span>
        </p>
        {/* Mini progress bar */}
        <div className="h-1.5 w-full rounded-full bg-border mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? "bg-brand-yellow" : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs font-bold text-foreground">{percentage}%</span>
        <button
          onClick={() => onDelete(goal.id)}
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
