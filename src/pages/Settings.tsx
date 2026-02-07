import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import {
  User,
  Bell,
  Moon,
  Globe,
  ChevronRight,
  LogOut,
  Shield,
  HelpCircle,
  FileText,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [communityAlerts, setCommunityAlerts] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <header className="flex items-center gap-3 bg-secondary py-5 px-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {/* ── Account Management ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Account</h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Edit Profile
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />

              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Email Address
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-xs">alex@email.com</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
              <Separator />

              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Change Password
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* ── Notification Preferences ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Notifications
            </h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Push Notifications
                  </span>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <span className="text-sm font-medium text-foreground">
                    Event Reminders
                  </span>
                </div>
                <Switch
                  checked={eventReminders}
                  onCheckedChange={setEventReminders}
                  disabled={!notifications}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <span className="text-sm font-medium text-foreground">
                    Community Activity
                  </span>
                </div>
                <Switch
                  checked={communityAlerts}
                  onCheckedChange={setCommunityAlerts}
                  disabled={!notifications}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Email Updates
                  </span>
                </div>
                <Switch
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </div>
          </section>

          {/* ── App Settings ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">
              App Settings
            </h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Dark Mode
                  </span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
              <Separator />

              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Language
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-xs">English</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </section>

          {/* ── Support ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Support</h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Help Center
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />

              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Terms & Privacy
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />

              <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Privacy Settings
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* ── Log Out ── */}
          <section className="px-4 pt-6 pb-6">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/onboarding");
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-destructive/30 hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                Log Out
              </span>
            </button>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
