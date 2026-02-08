import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  Trophy,
  Flame,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import AchievementBadge from "@/components/profile/AchievementBadge";
import HobbyHistoryCard from "@/components/profile/HobbyHistoryCard";
import { format } from "date-fns";

/* ── Static data (achievements & history remain local for now) ── */
const achievements = [
  { emoji: "🔥", label: "7-Day Streak", unlocked: true },
  { emoji: "🏅", label: "First Session", unlocked: true },
  { emoji: "🎨", label: "Art Explorer", unlocked: true },
  { emoji: "👨‍🍳", label: "Chef's Kiss", unlocked: true },
  { emoji: "📚", label: "Bookworm", unlocked: false },
  { emoji: "🎵", label: "Melody Maker", unlocked: false },
  { emoji: "⚽", label: "Sports Star", unlocked: false },
  { emoji: "💎", label: "30-Day Streak", unlocked: false },
];

const hobbyHistory = [
  { slug: "arts-crafts", emoji: "🎨", label: "Arts & Crafts", sessions: 12, lastActive: "Today", progress: 80 },
  { slug: "cooking", emoji: "👨‍🍳", label: "Cooking", sessions: 9, lastActive: "Yesterday", progress: 60 },
  { slug: "reading", emoji: "📚", label: "Reading", sessions: 7, lastActive: "3 days ago", progress: 45 },
  { slug: "sports", emoji: "⚽", label: "Sports", sessions: 4, lastActive: "1 week ago", progress: 25 },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const displayName =
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handle = `@${(authUser?.email?.split("@")[0] || "user").toLowerCase()}`;

  const memberSince = authUser?.created_at
    ? format(new Date(authUser.created_at), "MMM yyyy")
    : "Recently";

  const user = {
    name: displayName,
    handle,
    avatarFallback: initials,
    memberSince,
    stats: { hobbies: 4, sessions: 32, streak: 12 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {/* ── Avatar & Bio ── */}
          <ProfileAvatar user={user} />

          {/* ── Stats Strip ── */}
          <div className="grid grid-cols-3 gap-3 px-4 -mt-1">
            {[
              { icon: Trophy, value: user.stats.hobbies, label: "Hobbies" },
              { icon: Calendar, value: user.stats.sessions, label: "Sessions" },
              { icon: Flame, value: user.stats.streak, label: "Day Streak" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-secondary"
              >
                <s.icon className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-foreground">{s.value}</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Achievements ── */}
          <section className="px-4 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Achievements</h2>
              <span className="text-xs text-muted-foreground font-medium">
                {achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map((a) => (
                <AchievementBadge key={a.label} {...a} />
              ))}
            </div>
          </section>

          {/* ── Hobby History ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Hobby History</h2>
            <div className="flex flex-col gap-2">
              {hobbyHistory.map((h) => (
                <HobbyHistoryCard key={h.slug} {...h} />
              ))}
            </div>
          </section>

          {/* ── Settings Link ── */}
          <section className="px-4 pt-6 pb-6">
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
