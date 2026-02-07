import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  Bell,
  Moon,
  Globe,
  ChevronRight,
  LogOut,
  Trophy,
  Flame,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import AchievementBadge from "@/components/profile/AchievementBadge";
import HobbyHistoryCard from "@/components/profile/HobbyHistoryCard";

/* ── Static data ── */
const user = {
  name: "Alex Johnson",
  handle: "@alexj",
  avatarFallback: "AJ",
  memberSince: "Jan 2025",
  stats: { hobbies: 4, sessions: 32, streak: 12 },
};

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
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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

          {/* ── Settings ── */}
          <section className="px-4 pt-6 pb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Settings</h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              {/* Notifications */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Notifications</span>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />

              {/* Dark Mode */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Dark Mode</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <Separator />

              {/* Language */}
              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Language</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-xs">English</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
              <Separator />

              {/* Log Out */}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/onboarding");
                }}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">Log Out</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
