import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Copy, Code, Eye, MousePointerClick, Globe } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";

const BASE_URL = "https://discoverakin.com";

export default function DashboardMarketing() {
  const { user } = useAuth();

  const { data: experiences = [] } = useQuery({
    queryKey: ["host-pub-exps", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("experiences")
        .select("id, title")
        .eq("host_id", user!.id)
        .eq("status", "published");
      return data ?? [];
    },
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["host-marketing-analytics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("host_analytics")
        .select("experience_id, event_type, event_source")
        .eq("host_id", user!.id);
      return data ?? [];
    },
  });

  const { data: sponsorships = [] } = useQuery({
    queryKey: ["host-sponsorships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsorship_requests")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Per-experience stats
  const perfData = useMemo(() => {
    return experiences.map((exp) => {
      const expAnalytics = analytics.filter((a: any) => a.experience_id === exp.id);
      const views = expAnalytics.filter((a: any) => a.event_type === "view").length;
      const clicks = expAnalytics.filter((a: any) => a.event_type === "click").length;
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

      // Top source
      const sourceCounts: Record<string, number> = {};
      expAnalytics.forEach((a: any) => {
        const src = a.event_source || "direct";
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      });
      const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

      return { id: exp.id, title: exp.title, views, ctr, topSource };
    });
  }, [experiences, analytics]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const getShareLink = (id: string) =>
    `${BASE_URL}/e/${id}?utm_source=host_share&utm_medium=link&utm_campaign=${id}`;

  const getEmbedSnippet = (id: string) =>
    `<iframe src="${BASE_URL}/e/${id}?embed=true" width="400" height="600" frameborder="0" style="border-radius:12px;border:1px solid #ddd;"></iframe>`;

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": case "paid": return "default";
      case "pending": case "sent": return "secondary";
      case "declined": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Marketing & Sponsorships</h1>

      {/* Section 1 — Listing Performance */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Listing Performance</CardTitle></CardHeader>
        <CardContent>
          {perfData.length === 0 ? (
            <p className="text-muted-foreground text-sm">Publish an experience to see performance data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead>Top Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="text-right">{row.views}</TableCell>
                    <TableCell className="text-right">{row.ctr}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <Globe className="mr-1 h-3 w-3" />{row.topSource}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section 2 — Promotional Tools */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MousePointerClick className="h-4 w-4" /> Promotional Tools</CardTitle></CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <p className="text-muted-foreground text-sm">No published experiences yet.</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between rounded-lg border p-4">
                  <span className="font-medium text-sm">{exp.title}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getShareLink(exp.id), "Shareable link")}
                    >
                      <Copy className="mr-1 h-3 w-3" /> Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(getEmbedSnippet(exp.id), "Embed snippet")}
                    >
                      <Code className="mr-1 h-3 w-3" /> Copy Embed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3 — Sponsorship Request Tracker */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sponsorship Requests</CardTitle></CardHeader>
        <CardContent>
          {sponsorships.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sponsorship requests yet. Create one from the Payments page.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sponsor Email</TableHead>
                  <TableHead className="text-right">Ask Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsorships.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{s.sponsor_email}</TableCell>
                    <TableCell className="text-right">${Number(s.amount).toFixed(2)}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status) as any}>{s.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
