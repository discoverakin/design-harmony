import { Flame, Clock, TrendingUp, Target } from "lucide-react";

interface TrackerStatsProps {
  streak: number;
  weeklyMinutes: number;
  totalActivities: number;
  totalMinutes: number;
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  iconColor: string;
}) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary/60 flex-1 min-w-0">
    <Icon className={`w-5 h-5 ${iconColor}`} />
    <span className="text-lg font-bold text-foreground leading-tight">{value}</span>
    <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
  </div>
);

const TrackerStats = ({
  streak,
  weeklyMinutes,
  totalActivities,
  totalMinutes,
}: TrackerStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      <StatCard
        icon={Flame}
        label="Streak"
        value={`${streak}d`}
        iconColor="text-primary"
      />
      <StatCard
        icon={Clock}
        label="This Week"
        value={formatTime(weeklyMinutes)}
        iconColor="text-primary"
      />
      <StatCard
        icon={Target}
        label="Sessions"
        value={`${totalActivities}`}
        iconColor="text-primary"
      />
      <StatCard
        icon={TrendingUp}
        label="Total"
        value={formatTime(totalMinutes)}
        iconColor="text-primary"
      />
    </div>
  );
};

export default TrackerStats;
