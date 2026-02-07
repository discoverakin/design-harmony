import GoalCard from "./GoalCard";
import AddGoalSheet from "./AddGoalSheet";
import type { GoalProgress } from "@/hooks/use-tracker-goals";
import type { GoalPeriod } from "@/data/tracker-goals";

interface GoalsSectionProps {
  goalProgress: GoalProgress[];
  onAddGoal: (goal: {
    label: string;
    emoji: string;
    targetMinutes: number;
    period: GoalPeriod;
  }) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalsSection = ({
  goalProgress,
  onAddGoal,
  onDeleteGoal,
}: GoalsSectionProps) => {
  return (
    <div className="rounded-xl bg-secondary/40 p-4">
      <h3 className="text-xs font-bold text-foreground mb-3">🎯 My Goals</h3>
      <div className="space-y-2">
        {goalProgress.map((gp) => (
          <GoalCard key={gp.goal.id} progress={gp} onDelete={onDeleteGoal} />
        ))}
        <AddGoalSheet onAdd={onAddGoal} />
      </div>
    </div>
  );
};

export default GoalsSection;
