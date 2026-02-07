import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeeklyChartProps {
  data: { day: string; date: string; minutes: number }[];
}

const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const today = new Date().toISOString().split("T")[0];
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="rounded-xl bg-secondary/40 p-4">
      <h3 className="text-xs font-bold text-foreground mb-3">This Week</h3>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide domain={[0, maxMinutes * 1.2]} />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={
                    entry.date === today
                      ? "hsl(var(--primary))"
                      : entry.minutes > 0
                      ? "hsl(var(--primary) / 0.4)"
                      : "hsl(var(--border))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;
