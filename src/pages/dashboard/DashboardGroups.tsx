import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["host-groups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_groups")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Community Groups</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-muted-foreground">No groups yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g: any) => (
            <Card key={g.id}>
              <CardHeader>
                <CardTitle className="text-lg">{g.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {g.member_count} members</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(g.created_at), "MMM d, yyyy")}</span>
                </div>
                {g.host_id === user?.id ? (
                  <Badge variant="default">Owner</Badge>
                ) : (
                  <Badge variant="secondary">Moderator</Badge>
                )}
                <Button size="sm" className="w-full" onClick={() => navigate(`/dashboard/groups/${g.id}`)}>
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </main>
      <BottomNav />
    </div>
  );
}
