import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { subDays, format, startOfDay } from "date-fns";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

  const conversionRate = totalViews > 0 ? ((bookings.length / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Business Metrics</h2>
          <p className="text-sm text-muted-foreground">Track your performance and industry trends</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* My Business section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">📊 My Business</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+22%" />
          <MetricCard label="Avg. Booking" value={`$${avgBooking.toFixed(0)}`} change="+5%" />
          <MetricCard label="Return Rate" value={`${returnRate}%`} change="+12%" />
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
        </CardContent>
      </Card>

      {/* General section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">⚙️ General</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Active Users" value={totalViews.toLocaleString()} change="+18%" />
          <MetricCard label="Conversion" value={`${conversionRate}%`} change="-0.4%" negative />
          <MetricCard label="Engagement" value="8.4/10" change="+0.6" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, negative }: { label: string; value: string; change: string; negative?: boolean }) {
  return (
    <Card className="border-border">
      <CardContent className="p-3 text-center">
        <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className={`text-[10px] mt-1 ${negative ? "text-destructive" : "text-green-600"}`}>
          {negative ? "↘" : "↗"} {change}
        </p>
      </CardContent>
    </Card>
  );
}
