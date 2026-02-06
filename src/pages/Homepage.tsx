import { Link, useNavigate } from "react-router-dom";
import { Flame, Calendar, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { hobbies } from "@/data/hobbies";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const trackedHobbies = [
  { slug: "arts-crafts", sessionsCompleted: 7, totalSessions: 10, streak: 3, lastActivity: "Today" },
  { slug: "cooking", sessionsCompleted: 4, totalSessions: 8, streak: 1, lastActivity: "Yesterday" },
  { slug: "music", sessionsCompleted: 2, totalSessions: 12, streak: 0, lastActivity: "3 days ago" },
];

const upcomingEvents = [
  { title: "Pottery Wheel Basics", time: "Today, 6:00 PM", location: "The Clay Studio", emoji: "🎨" },
  { title: "Thai Cooking Night", time: "Tomorrow, 7:30 PM", location: "Chef's Table Academy", emoji: "👨‍🍳" },
  { title: "Open Mic Night", time: "Sat, 8:00 PM", location: "Open Mic Café", emoji: "🎵" },
];

const recommendedHobbies = hobbies.filter(
  (h) => !trackedHobbies.some((t) => t.slug === h.slug)
);

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {/* Greeting */}
          <section className="px-5 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome back! 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You've been on a roll — keep up the great work.
            </p>
          </section>

          {/* Stats strip */}
          <section className="px-5 py-4">
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border-2 border-border bg-secondary/40 p-3 text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">3</p>
                <p className="text-[11px] text-muted-foreground">Day streak</p>
              </div>
              <div className="flex-1 rounded-xl border-2 border-border bg-secondary/40 p-3 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">13</p>
                <p className="text-[11px] text-muted-foreground">Sessions</p>
              </div>
              <div className="flex-1 rounded-xl border-2 border-border bg-secondary/40 p-3 text-center">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">3</p>
                <p className="text-[11px] text-muted-foreground">Hobbies</p>
              </div>
            </div>
          </section>

          {/* Tracked hobbies */}
          <section className="px-5 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">My Hobbies</h2>
              <Link to="/" className="text-xs font-medium text-primary">
                Browse more
              </Link>
            </div>
            <div className="space-y-3">
              {trackedHobbies.map((tracked) => {
                const hobby = hobbies.find((h) => h.slug === tracked.slug);
                if (!hobby) return null;
                const progress = Math.round(
                  (tracked.sessionsCompleted / tracked.totalSessions) * 100
                );
                return (
                  <button
                    key={tracked.slug}
                    onClick={() => navigate(`/hobby/${tracked.slug}`)}
                    className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors text-left"
                  >
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: hobby.bgColor }}
                    >
                      <span className="text-xl">{hobby.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {hobby.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">
                          {tracked.lastActivity}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          {tracked.sessionsCompleted}/{tracked.totalSessions} sessions
                        </span>
                        {tracked.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] font-medium text-primary">
                            <Flame className="w-3 h-3" />
                            {tracked.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Upcoming events */}
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">
                <Calendar className="w-4 h-4 inline-block mr-1 text-primary -mt-0.5" />
                Upcoming
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <span className="text-2xl flex-shrink-0">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {event.time} · {event.location}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </section>

          {/* Recommended */}
          <section className="px-5 pb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">
              <Sparkles className="w-4 h-4 inline-block mr-1 text-primary -mt-0.5" />
              Recommended for you
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {recommendedHobbies.map((hobby) => (
                <Link
                  key={hobby.slug}
                  to={`/hobby/${hobby.slug}`}
                  className="flex flex-col items-center gap-2 min-w-[100px] p-4 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors flex-shrink-0"
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{ backgroundColor: hobby.bgColor }}
                  >
                    <span className="text-2xl">{hobby.emoji}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">
                    {hobby.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Homepage;
