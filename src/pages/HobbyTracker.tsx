import { useMemo, useState } from "react";
import { BarChart3, List, Sparkles, Timer, Target, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import AuthPromptSheet from "@/components/AuthPromptSheet";
import TrackerStats from "@/components/tracker/TrackerStats";
import WeeklyChart from "@/components/tracker/WeeklyChart";
import HobbyBreakdown from "@/components/tracker/HobbyBreakdown";
import GoalsSection from "@/components/tracker/GoalsSection";
import GoalCelebration from "@/components/tracker/GoalCelebration";
import ActivityLogItem from "@/components/tracker/ActivityLogItem";
import LogActivitySheet from "@/components/tracker/LogActivitySheet";
import { useAuth } from "@/hooks/use-auth";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useTrackerGoals } from "@/hooks/use-tracker-goals";

/**
 * Feature-explainer card used in both empty states. Caller passes the big
 * primary button as `trigger` so behavior varies (auth prompt vs log sheet).
 */
const TeaserFeatureCard = ({ trigger }: { trigger: React.ReactNode }) => (
  <section className="px-5 pt-6 pb-8">
    <div className="rounded-2xl border-2 border-border bg-secondary/40 p-5 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-base font-bold text-foreground mb-1.5">
        Track your hobby journey
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[300px]">
        Log the time you spend on each hobby, build streaks, set goals, and
        see your breakdown across categories.
      </p>

      <div className="grid grid-cols-3 gap-3 w-full mb-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">
            Weekly hours
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">
            Custom goals
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">
            Streak & totals
          </span>
        </div>
      </div>

      {trigger}
    </div>
  </section>
);

/** Anon teaser: teaser card + zero-state stats + button opens the auth prompt. */
const TrackerTeaser = () => {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          <section className="px-5 pt-6 pb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tracker</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Log hours & track your progress.
              </p>
            </div>
          </section>

          <div className="px-5 pt-4">
            <TrackerStats
              streak={0}
              weeklyMinutes={0}
              totalActivities={0}
              totalMinutes={0}
            />
          </div>

          <TeaserFeatureCard
            trigger={
              <button
                onClick={() => setAuthPromptOpen(true)}
                className="w-full h-12 rounded-2xl bg-[#FF5B3B] hover:bg-[#FF5B3B]/90 text-white font-semibold text-sm transition-colors"
              >
                Log activity
              </button>
            }
          />
        </div>
      </main>

      <BottomNav />

      <AuthPromptSheet
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        title="Log in to start tracking"
        subtitle="Create a free account to log hobby sessions and build your streak."
      />
    </div>
  );
};

const AuthedTracker = () => {
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

  const isEmpty = logs.length === 0;

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
          {/* Header — top-right Log Activity only when there IS activity to add to */}
          <section className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tracker</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Log hours & track your progress.
                </p>
              </div>
              {!isEmpty && <LogActivitySheet onLog={addLog} />}
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

          {isEmpty ? (
            /* Empty state: single teaser card whose big button opens the log sheet */
            <TeaserFeatureCard
              trigger={
                <LogActivitySheet onLog={addLog}>
                  <button className="w-full h-12 rounded-2xl bg-[#FF5B3B] hover:bg-[#FF5B3B]/90 text-white font-semibold text-sm transition-colors">
                    Log activity
                  </button>
                </LogActivitySheet>
              }
            />
          ) : (
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
              </TabsContent>
            </Tabs>
          )}
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

const HobbyTracker = () => {
  const { user } = useAuth();
  return user ? <AuthedTracker /> : <TrackerTeaser />;
};

export default HobbyTracker;
