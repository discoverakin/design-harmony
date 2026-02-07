import { useState, useCallback, useEffect, useMemo } from "react";
import {
  TrackerGoal,
  GoalPeriod,
  loadGoals,
  saveGoals,
  generateGoalId,
} from "@/data/tracker-goals";
import type { ActivityLog } from "@/data/activity-log";
import { getWeekDates } from "@/data/activity-log";

function getMonthDates(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const dates: string[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export interface GoalProgress {
  goal: TrackerGoal;
  currentMinutes: number;
  percentage: number;
  isComplete: boolean;
}

export function useTrackerGoals(logs: ActivityLog[]) {
  const [goals, setGoals] = useState<TrackerGoal[]>(() => loadGoals());
  const [celebratingGoalId, setCelebratingGoalId] = useState<string | null>(null);
  const [previousCompleted, setPreviousCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const addGoal = useCallback(
    (goal: Omit<TrackerGoal, "id" | "createdAt">) => {
      const newGoal: TrackerGoal = {
        ...goal,
        id: generateGoalId(),
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const weekDates = useMemo(() => getWeekDates(), []);
  const monthDates = useMemo(() => getMonthDates(), []);

  const goalProgress: GoalProgress[] = useMemo(() => {
    return goals.map((goal) => {
      const periodDates = goal.period === "weekly" ? weekDates : monthDates;
      const currentMinutes = logs
        .filter((l) => periodDates.includes(l.date))
        .reduce((sum, l) => sum + l.durationMinutes, 0);
      const percentage = Math.min(
        Math.round((currentMinutes / goal.targetMinutes) * 100),
        100
      );
      return {
        goal,
        currentMinutes,
        percentage,
        isComplete: currentMinutes >= goal.targetMinutes,
      };
    });
  }, [goals, logs, weekDates, monthDates]);

  // Detect newly completed goals to trigger celebration
  useEffect(() => {
    const currentCompleted = new Set(
      goalProgress.filter((gp) => gp.isComplete).map((gp) => gp.goal.id)
    );
    for (const id of currentCompleted) {
      if (!previousCompleted.has(id)) {
        setCelebratingGoalId(id);
        break;
      }
    }
    setPreviousCompleted(currentCompleted);
  }, [goalProgress]);

  const dismissCelebration = useCallback(() => {
    setCelebratingGoalId(null);
  }, []);

  return {
    goals,
    goalProgress,
    addGoal,
    deleteGoal,
    celebratingGoalId,
    dismissCelebration,
  };
}
