import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { subDays, format, startOfDay } from "date-fns";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

type TimeRange = "7" | "30" | "90" | "all";

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30");

  const rangeStart = useMemo(() => {
    if (range === "all") return null;
    return startOfDay(subDays(new Date(), parseInt(range)));
  }, [range]);

  const { data: experiences = [] } = useQuery({
    queryKey: ["host-exp-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("experiences").select("id, title").eq("host_id", user!.id);
      return data ?? [];
    },
  });

  const expIds = useMemo(() => experiences.map((e) => e.id), [experiences]);

  const { data: views = [] } = useQuery({
    queryKey: ["host-analytics-views", user?.id, range],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("host_analytics").select("id, experience_id, created_at").eq("host_id", user!.id).eq("event_type", "view");
      if (rangeStart) q = q.gte("created_at", rangeStart.toISOString());
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["host-analytics-bookings", user?.id, range],
    enabled: !!user && expIds.length > 0,
    queryFn: async () => {
      let q = supabase.from("bookings").select("id, experience_id, amount_paid, status, created_at").in("experience_id", expIds);
      if (rangeStart) q = q.gte("created_at", rangeStart.toISOString());
      const { data } = await q;
      return data ?? [];
    },
  });

  const totalRevenue = bookings.reduce((s, b) => s + Number(b.amount_paid), 0);
  const avgBooking = bookings.length > 0 ? totalRevenue / bookings.length : 0;
  const totalViews = views.length;
  const returnRate = totalViews > 0 ? ((bookings.length / totalViews) * 100).toFixed(0) : "0";

  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      const day = format(new Date(b.created_at), "EEE");
      map[day] = (map[day] || 0) + Number(b.amount_paid);
    });
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d) => ({ day: d, revenue: map[d] || 0 }));
  }, [bookings]);

  const hasData = bookings.length > 0 || totalViews > 0;

  const rangeLabels: Record<TimeRange, string> = { "7": "7 days", "30": "30 days", "90": "90 days", "all": "All time" };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Business Metrics</h2>
          <p className="text-sm text-muted-foreground">Track your performance and industry trends</p>
        </div>
        <div className="flex gap-1 bg-[#F9E9E4] rounded-full p-0.5">
          {(["7", "30", "90", "all"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: range === r ? "#FF5C3B" : "transparent",
                color: range === r ? "#FFFFFF" : "#8B6B61",
              }}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* My Business section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">My Business</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <MetricCard label="Avg. Booking" value={`$${avgBooking.toFixed(0)}`} />
          <MetricCard label="Return Rate" value={`${returnRate}%`} />
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Weekly Revenue</h3>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {!hasData && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your analytics will appear here once you have bookings
            </p>
          )}
        </CardContent>
      </Card>
      </main>
      <BottomNav />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-3 text-center" style={{ borderLeft: "3px solid #FF5C3B" }}>
        <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
