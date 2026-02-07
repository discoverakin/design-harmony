import { useMemo } from "react";
import { BarChart3, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import TrackerStats from "@/components/tracker/TrackerStats";
import WeeklyChart from "@/components/tracker/WeeklyChart";
import HobbyBreakdown from "@/components/tracker/HobbyBreakdown";
import GoalsSection from "@/components/tracker/GoalsSection";
import GoalCelebration from "@/components/tracker/GoalCelebration";
import ActivityLogItem from "@/components/tracker/ActivityLogItem";
import LogActivitySheet from "@/components/tracker/LogActivitySheet";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useTrackerGoals } from "@/hooks/use-tracker-goals";

const HobbyTracker = () => {
  const {
    logs,
    addLog,
    deleteLog,
    streak,
    weeklyMinutes,
    weeklyChart,
    hobbyBreakdown,
    totalActivities,
    totalMinutes,
  } = useActivityLog();

  const {
    goalProgress,
    addGoal,
    deleteGoal,
    celebratingGoalId,
    dismissCelebration,
  } = useTrackerGoals(logs);

  const celebratingGoal = celebratingGoalId
    ? goalProgress.find((gp) => gp.goal.id === celebratingGoalId) ?? null
    : null;

  // Group logs by date for the feed
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    sortedLogs.forEach((log) => {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    });
    return Object.entries(groups);
  }, [logs]);

  const formatDateHeader = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {/* Header */}
          <section className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tracker</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Log hours & track your progress.
                </p>
              </div>
              <LogActivitySheet onLog={addLog} />
            </div>
          </section>

          {/* Stats */}
          <div className="px-5 pt-4">
            <TrackerStats
              streak={streak}
              weeklyMinutes={weeklyMinutes}
              totalActivities={totalActivities}
              totalMinutes={totalMinutes}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="px-5 pt-4">
            <TabsList className="w-full bg-secondary/60 rounded-xl h-11">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="log"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <List className="w-3.5 h-3.5 mr-1.5" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-4 space-y-4 pb-6">
              <GoalsSection
                goalProgress={goalProgress}
                onAddGoal={addGoal}
                onDeleteGoal={deleteGoal}
              />
              <WeeklyChart data={weeklyChart} />
              <HobbyBreakdown data={hobbyBreakdown} />
            </TabsContent>

            {/* Activity Log */}
            <TabsContent value="log" className="mt-4 pb-6">
              {groupedLogs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm text-muted-foreground">
                    No activities logged yet. Tap "Log Activity" to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedLogs.map(([date, dateLogs]) => (
                    <div key={date}>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {formatDateHeader(date)}
                      </h3>
                      <div className="space-y-2">
                        {dateLogs.map((log) => (
                          <ActivityLogItem
                            key={log.id}
                            log={log}
                            onDelete={deleteLog}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />

      <GoalCelebration
        goalProgress={celebratingGoal}
        onDismiss={dismissCelebration}
      />
    </div>
  );
};

export default HobbyTracker;
