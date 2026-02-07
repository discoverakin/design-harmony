import type { HobbyCategory } from "./hobbies";

export interface ActivityLog {
  id: string;
  hobbyCategory: HobbyCategory;
  hobbyName: string;
  emoji: string;
  durationMinutes: number;
  date: string; // ISO date
  note?: string;
  source: "manual" | "event";
  eventId?: string;
  eventTitle?: string;
}

const STORAGE_KEY = "akin-activity-log";

export const defaultActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    hobbyCategory: "Active",
    hobbyName: "Running",
    emoji: "🏃",
    durationMinutes: 35,
    date: "2026-02-07",
    note: "Morning 5K along the river — felt great!",
    source: "event",
    eventId: "evt-2",
    eventTitle: "5K Morning Run",
  },
  {
    id: "log-2",
    hobbyCategory: "Creative",
    hobbyName: "Painting",
    emoji: "🎨",
    durationMinutes: 90,
    date: "2026-02-06",
    note: "Watercolour landscape practice session",
    source: "manual",
  },
  {
    id: "log-3",
    hobbyCategory: "Active",
    hobbyName: "Yoga",
    emoji: "🧘",
    durationMinutes: 60,
    date: "2026-02-06",
    note: "Evening flow class at the studio",
    source: "manual",
  },
  {
    id: "log-4",
    hobbyCategory: "Social",
    hobbyName: "Cooking",
    emoji: "👨‍🍳",
    durationMinutes: 120,
    date: "2026-02-05",
    note: "Tried homemade pasta for the first time",
    source: "manual",
  },
  {
    id: "log-5",
    hobbyCategory: "Creative",
    hobbyName: "Photography",
    emoji: "📸",
    durationMinutes: 45,
    date: "2026-02-05",
    note: "Golden hour shoot at the waterfront",
    source: "manual",
  },
  {
    id: "log-6",
    hobbyCategory: "Active",
    hobbyName: "Running",
    emoji: "🏃",
    durationMinutes: 28,
    date: "2026-02-04",
    note: "Quick 3K before work",
    source: "manual",
  },
  {
    id: "log-7",
    hobbyCategory: "Intellectual",
    hobbyName: "Reading",
    emoji: "📚",
    durationMinutes: 40,
    date: "2026-02-04",
    note: "Finished chapter 5 of The Alchemist",
    source: "manual",
  },
  {
    id: "log-8",
    hobbyCategory: "Creative",
    hobbyName: "Painting",
    emoji: "🎨",
    durationMinutes: 75,
    date: "2026-02-03",
    source: "event",
    eventId: "evt-1",
    eventTitle: "Outdoor Sketch Walk",
  },
  {
    id: "log-9",
    hobbyCategory: "Active",
    hobbyName: "Swimming",
    emoji: "🏊",
    durationMinutes: 50,
    date: "2026-02-03",
    note: "Laps at the city pool",
    source: "manual",
  },
  {
    id: "log-10",
    hobbyCategory: "Social",
    hobbyName: "Gaming",
    emoji: "🎮",
    durationMinutes: 90,
    date: "2026-02-02",
    note: "Board game night with friends — Catan!",
    source: "event",
    eventId: "evt-5",
    eventTitle: "Board Game Marathon",
  },
  {
    id: "log-11",
    hobbyCategory: "Active",
    hobbyName: "Running",
    emoji: "🏃",
    durationMinutes: 42,
    date: "2026-02-01",
    note: "Saturday long run",
    source: "manual",
  },
  {
    id: "log-12",
    hobbyCategory: "Creative",
    hobbyName: "Music",
    emoji: "🎵",
    durationMinutes: 30,
    date: "2026-02-01",
    note: "Guitar practice — learning fingerpicking",
    source: "manual",
  },
];

export function loadActivityLogs(): ActivityLog[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  saveActivityLogs(defaultActivityLogs);
  return defaultActivityLogs;
}

export function saveActivityLogs(logs: ActivityLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Stat helpers ─────────────────────────────

export function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function calculateStreak(logs: ActivityLog[]): number {
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must start from today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getTotalMinutesThisWeek(logs: ActivityLog[]): number {
  const weekDates = getWeekDates();
  return logs
    .filter((l) => weekDates.includes(l.date))
    .reduce((sum, l) => sum + l.durationMinutes, 0);
}

export function getWeeklyChartData(logs: ActivityLog[]) {
  const weekDates = getWeekDates();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return weekDates.map((date, i) => ({
    day: dayLabels[i],
    date,
    minutes: logs
      .filter((l) => l.date === date)
      .reduce((sum, l) => sum + l.durationMinutes, 0),
  }));
}

export function getCategoryBreakdown(logs: ActivityLog[]) {
  const map: Record<string, number> = {};
  logs.forEach((l) => {
    map[l.hobbyCategory] = (map[l.hobbyCategory] || 0) + l.durationMinutes;
  });
  return Object.entries(map)
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}
