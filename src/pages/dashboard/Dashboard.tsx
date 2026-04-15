import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Plus, BarChart3, CalendarCheck } from "lucide-react";
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
  const verificationStatus = profile?.verificationStatus ?? "pending";

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      {/* Hero Greeting */}
      <div
        className="rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #FFF0E8 0%, #F9E9E4 100%)",
          padding: "20px 16px 24px",
        }}
      >
        <p className="text-sm" style={{ color: "#8B6B61" }}>{greeting},</p>
        <h2 className="text-2xl font-bold mt-0.5" style={{ color: "#2D1810" }}>{displayName}</h2>
        <p className="text-sm mt-1" style={{ color: "#8B6B61" }}>Here's what's happening with your business today</p>
      </div>

      {/* Verification Banner */}
      {verificationStatus === "pending" && (
        <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                Verification Pending
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                We're reviewing your business profile. You'll be notified within 2-3 business days once approved. In the meantime, explore your dashboard!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Revenue" value={`$${(stats?.revenue ?? 0).toLocaleString()}`} />
          <StatCard label="Bookings" value={String(stats?.bookings ?? 0)} />
          <StatCard label="Reviews" value={String(stats?.reviews ?? "—")} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dashboard/experiences/new">
            <Card className="bg-white border-2 border-[#FF5C3B]/20 hover:border-[#FF5C3B]/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(255, 92, 59, 0.1)" }}
                >
                  <Plus className="h-4 w-4" style={{ color: "#FF5C3B" }} />
                </div>
                <p className="font-semibold text-sm text-foreground">Add Listing</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/analytics">
            <Card className="bg-white border-2 border-[#FF5C3B]/20 hover:border-[#FF5C3B]/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(255, 92, 59, 0.1)" }}
                >
                  <BarChart3 className="h-4 w-4" style={{ color: "#FF5C3B" }} />
                </div>
                <p className="font-semibold text-sm text-foreground">View Reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Recent Bookings
          </h3>
          <Link to="/dashboard/payments" className="text-xs text-primary font-medium">View All</Link>
        </div>
        <div className="space-y-3">
          {(stats?.recentBookings ?? []).length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(255, 92, 59, 0.08)" }}
                >
                  <CalendarCheck className="h-7 w-7" style={{ color: "#FF5C3B", opacity: 0.6 }} />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No bookings yet</p>
                <p className="text-xs text-muted-foreground">Bookings from your listings will show up here</p>
              </CardContent>
            </Card>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-3 text-center" style={{ borderLeft: "3px solid #FF5C3B" }}>
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
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
