import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const { data: stats } = useQuery({
    queryKey: ["host-dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [exps, bookingsRes] = await Promise.all([
        supabase.from("experiences").select("id", { count: "exact", head: true }).eq("host_id", user!.id).eq("status", "published"),
        supabase.from("bookings").select("amount_paid, status, attendee_name, experience_id, created_at").limit(10),
      ]);

      const bookings = bookingsRes.data ?? [];
      const totalRevenue = bookings.reduce((s, b) => s + Number(b.amount_paid), 0);

      return {
        revenue: totalRevenue,
        bookings: bookings.length,
        reviews: 4.8,
        recentBookings: bookings.slice(0, 3),
      };
    },
  });

  const displayName = profile?.name || "Host";
  const greeting = getGreeting();

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">Here's what's happening with your business today</p>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          📊 Quick Stats
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Revenue" value={`$${(stats?.revenue ?? 0).toLocaleString()}`} change="+15% this week" />
          <StatCard label="Bookings" value={String(stats?.bookings ?? 0)} change="+8% this week" />
          <StatCard label="Reviews" value={String(stats?.reviews ?? "—")} change="+0.2 this week" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          ＋ Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dashboard/experiences/new">
            <Card className="bg-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Add New Listing</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/analytics">
            <Card className="bg-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">View Reports</p>
                </div>
                <ChevronRight className="h-5 w-5" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            📋 Recent Bookings
          </h3>
          <Link to="/dashboard/payments" className="text-xs text-primary font-medium">View All</Link>
        </div>
        <div className="space-y-3">
          {(stats?.recentBookings ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent bookings</p>
          ) : (
            stats?.recentBookings?.map((b, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{b.attendee_name || "Guest"}</p>
                      <Badge
                        variant={b.status === "confirmed" ? "default" : "secondary"}
                        className={b.status === "confirmed" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}
                      >
                        {b.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      </main>
      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-3 text-center">
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-green-600 mt-1">↗ {change}</p>
      </CardContent>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
