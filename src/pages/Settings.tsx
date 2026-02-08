import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
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
  ClipboardCheck,
  ArrowLeft,
  Mail,
  Lock,
  Check,
  MessageSquare,
  Calendar,
  Users,
  Trophy,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BottomNav from "@/components/BottomNav";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

const getStoredPrefs = () => {
  try {
    const stored = localStorage.getItem("akin-settings");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const stored = getStoredPrefs();

  const [pushEnabled, setPushEnabled] = useState(stored?.pushEnabled ?? true);
  const [eventReminders, setEventReminders] = useState(stored?.eventReminders ?? true);
  const [communityAlerts, setCommunityAlerts] = useState(stored?.communityAlerts ?? false);
  const [groupMessages, setGroupMessages] = useState(stored?.groupMessages ?? true);
  const [achievementAlerts, setAchievementAlerts] = useState(stored?.achievementAlerts ?? true);
  const [emailUpdates, setEmailUpdates] = useState(stored?.emailUpdates ?? true);
  const [language, setLanguage] = useState(stored?.language ?? "en");
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  const persist = (patch: Record<string, unknown>) => {
    const current = getStoredPrefs() || {};
    localStorage.setItem("akin-settings", JSON.stringify({ ...current, ...patch }));
  };

  const updatePush = (v: boolean) => {
    setPushEnabled(v);
    persist({ pushEnabled: v });
  };
  const updateEventReminders = (v: boolean) => {
    setEventReminders(v);
    persist({ eventReminders: v });
  };
  const updateCommunityAlerts = (v: boolean) => {
    setCommunityAlerts(v);
    persist({ communityAlerts: v });
  };
  const updateGroupMessages = (v: boolean) => {
    setGroupMessages(v);
    persist({ groupMessages: v });
  };
  const updateAchievementAlerts = (v: boolean) => {
    setAchievementAlerts(v);
    persist({ achievementAlerts: v });
  };
  const updateEmailUpdates = (v: boolean) => {
    setEmailUpdates(v);
    persist({ emailUpdates: v });
  };
  const updateLanguage = (code: string) => {
    setLanguage(code);
    persist({ language: code });
    setLangSheetOpen(false);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

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
                  <span className="text-xs">{user?.email ?? "—"}</span>
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
              {/* Master push toggle */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Push Notifications
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Master toggle for all push alerts
                    </span>
                  </div>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={updatePush} />
              </div>
              <Separator />

              {/* Sub-options */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Event Reminders
                  </span>
                </div>
                <Switch
                  checked={eventReminders}
                  onCheckedChange={updateEventReminders}
                  disabled={!pushEnabled}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Community Activity
                  </span>
                </div>
                <Switch
                  checked={communityAlerts}
                  onCheckedChange={updateCommunityAlerts}
                  disabled={!pushEnabled}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Group Messages
                  </span>
                </div>
                <Switch
                  checked={groupMessages}
                  onCheckedChange={updateGroupMessages}
                  disabled={!pushEnabled}
                />
              </div>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3 pl-8">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Achievement Alerts
                  </span>
                </div>
                <Switch
                  checked={achievementAlerts}
                  onCheckedChange={updateAchievementAlerts}
                  disabled={!pushEnabled}
                />
              </div>
              <Separator />

              {/* Email updates (independent) */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Email Updates
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Weekly digest &amp; recommendations
                    </span>
                  </div>
                </div>
                <Switch
                  checked={emailUpdates}
                  onCheckedChange={updateEmailUpdates}
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

              {/* Language selector */}
              <Sheet open={langSheetOpen} onOpenChange={setLangSheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Language
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="text-sm">{selectedLang.flag}</span>
                      <span className="text-xs">{selectedLang.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl max-w-lg mx-auto">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">
                      Select Language
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 max-h-80 overflow-y-auto -mx-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => updateLanguage(lang.code)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm font-medium text-foreground">
                            {lang.label}
                          </span>
                        </div>
                        {language === lang.code && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
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

          {/* ── Admin ── */}
          <section className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Admin</h2>
            <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
              <button
                onClick={() => navigate("/admin-events")}
                className="flex items-center justify-between px-4 py-3.5 w-full hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      Event Review
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Approve or reject pending events
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* ── Log Out ── */}
          <section className="px-4 pt-6 pb-6">
            <button
              onClick={async () => {
                await signOut();
                navigate("/login", { replace: true });
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
