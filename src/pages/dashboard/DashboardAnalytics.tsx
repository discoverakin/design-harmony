import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

const weeklyData = [
  { day: 'Mon', revenue: 85 },
  { day: 'Tue', revenue: 120 },
  { day: 'Wed', revenue: 95 },
  { day: 'Thu', revenue: 140 },
  { day: 'Fri', revenue: 220 },
  { day: 'Sat', revenue: 310 },
  { day: 'Sun', revenue: 270 },
];

export default function DashboardAnalytics() {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Business Metrics</h2>
        <p className="text-sm text-muted-foreground">Track your performance and industry trends</p>
      </div>

      {/* My Business section */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">My Business</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total Revenue" value="$1,240" />
          <MetricCard label="Avg. Booking" value="$42" />
          <MetricCard label="Return Rate" value="28%" />
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
              <LineChart data={weeklyData}>
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
