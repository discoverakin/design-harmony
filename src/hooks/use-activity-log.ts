import { useState, useCallback, useEffect } from "react";
import {
  ActivityLog,
  loadActivityLogs,
  saveActivityLogs,
  generateLogId,
  calculateStreak,
  getTotalMinutesThisWeek,
  getWeeklyChartData,
  getCategoryBreakdown,
} from "@/data/activity-log";

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(() => loadActivityLogs());

  useEffect(() => {
    saveActivityLogs(logs);
  }, [logs]);

  const addLog = useCallback(
    (log: Omit<ActivityLog, "id">) => {
      const newLog: ActivityLog = { ...log, id: generateLogId() };
      setLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    []
  );

  const deleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const streak = calculateStreak(logs);
  const weeklyMinutes = getTotalMinutesThisWeek(logs);
  const weeklyChart = getWeeklyChartData(logs);
  const categoryBreakdown = getCategoryBreakdown(logs);
  const totalActivities = logs.length;
  const totalMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);

  return {
    logs,
    addLog,
    deleteLog,
    streak,
    weeklyMinutes,
    weeklyChart,
    categoryBreakdown,
    totalActivities,
    totalMinutes,
  };
}
