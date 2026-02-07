export type GoalPeriod = "weekly" | "monthly";

export interface TrackerGoal {
  id: string;
  label: string;
  emoji: string;
  targetMinutes: number;
  period: GoalPeriod;
  createdAt: string;
}

const STORAGE_KEY = "akin-tracker-goals";

export const defaultGoals: TrackerGoal[] = [
  {
    id: "goal-1",
    label: "Stay active",
    emoji: "🏃",
    targetMinutes: 300,
    period: "weekly",
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "goal-2",
    label: "Creative time",
    emoji: "🎨",
    targetMinutes: 600,
    period: "monthly",
    createdAt: "2026-02-01T00:00:00Z",
  },
];

export function loadGoals(): TrackerGoal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  saveGoals(defaultGoals);
  return defaultGoals;
}

export function saveGoals(goals: TrackerGoal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function generateGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
