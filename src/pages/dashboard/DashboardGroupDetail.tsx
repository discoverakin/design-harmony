import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, Send, Link } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardGroupDetail() {
  const { id: groupId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  // Group info
  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data } = await supabase.from("community_groups").select("*").eq("id", groupId!).single();
      return data;
    },
  });

  // Members
  const { data: members = [] } = useQuery({
    queryKey: ["group-members", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Linked experiences
  const { data: linkedExps = [] } = useQuery({
    queryKey: ["group-experiences", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data } = await supabase
        .from("group_experiences")
        .select("experience_id, experiences(id, title)")
        .eq("group_id", groupId!);
      return (data ?? []).map((r: any) => r.experiences).filter(Boolean);
    },
  });

  // Host's published experiences for linking
  const { data: hostExps = [] } = useQuery({
    queryKey: ["host-published-exps", user?.id],
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

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["group-members", groupId] });
    qc.invalidateQueries({ queryKey: ["group", groupId] });
  };

  // Update member status
  const updateMember = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      const { error } = await supabase.from("group_members").update({ status }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast({ title: "Member updated" }); },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("group_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast({ title: "Member removed" }); },
  });

  // Toggle moderator
  const toggleModerator = async (userId: string, isMod: boolean) => {
    if (!group) return;
    const mods: string[] = (group as any).moderator_ids ?? [];
    const updated = isMod ? mods.filter((id: string) => id !== userId) : [...mods, userId];
    const { error } = await supabase.from("community_groups").update({ moderator_ids: updated }).eq("id", groupId!);
    if (error) { toast({ title: "Error", variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["group", groupId] });
    toast({ title: isMod ? "Moderator removed" : "Moderator added" });
  };

  // Link experience
  const linkExp = useMutation({
    mutationFn: async (expId: string) => {
      const { error } = await supabase.from("group_experiences").insert({ group_id: groupId!, experience_id: expId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-experiences", groupId] });
      toast({ title: "Experience linked" });
    },
  });

  // Announcement
  const [message, setMessage] = useState("");
  const sendAnnouncement = useMutation({
    mutationFn: async () => {
      if (!message.trim() || !user) return;
      const id = crypto.randomUUID();
      const { error } = await supabase.from("group_announcements").insert({
        id,
        group_id: groupId!,
        host_id: user.id,
        message: message.trim(),
      });
      if (error) throw error;
      await supabase.functions.invoke("send-group-announcement", {
        body: { announcement_id: id, group_id: groupId, message: message.trim() },
      });
    },
    onSuccess: () => { setMessage(""); toast({ title: "Announcement sent!" }); },
    onError: () => toast({ title: "Error sending announcement", variant: "destructive" }),
  });

  const moderatorIds: string[] = (group as any)?.moderator_ids ?? [];
  const unlinkedExps = hostExps.filter((e) => !linkedExps.some((l: any) => l.id === e.id));

  if (!group) return <p className="text-muted-foreground p-6">Loading…</p>;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{(group as any).name}</h1>

      {/* Members */}
      <Card>
        <CardHeader><CardTitle className="text-base">Members</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m: any) => {
                  const isMod = moderatorIds.includes(m.user_id);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.display_name || "User"}</TableCell>
                      <TableCell>{format(new Date(m.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "approved" ? "default" : m.status === "pending" ? "secondary" : "destructive"}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {m.status === "approved" && (
                          <Switch checked={isMod} onCheckedChange={() => toggleModerator(m.user_id, isMod)} />
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {m.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateMember.mutate({ memberId: m.id, status: "approved" })}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateMember.mutate({ memberId: m.id, status: "denied" })}>
                              Deny
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => removeMember.mutate(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Linked Experiences */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Linked Experiences</CardTitle>
          {unlinkedExps.length > 0 && (
            <Select onValueChange={(v) => linkExp.mutate(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Link experience…" />
              </SelectTrigger>
              <SelectContent>
                {unlinkedExps.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          {linkedExps.length === 0 ? (
            <p className="text-muted-foreground text-sm">No linked experiences. Group members get priority booking for linked experiences.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {linkedExps.map((e: any) => (
                <Badge key={e.id} variant="outline" className="flex items-center gap-1">
                  <Link className="h-3 w-3" /> {e.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader><CardTitle className="text-base">Send Announcement</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => { e.preventDefault(); sendAnnouncement.mutate(); }}
          >
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement…"
              required
            />
            <Button type="submit" disabled={sendAnnouncement.isPending || !message.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {sendAnnouncement.isPending ? "Sending…" : "Send Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </main>
      <BottomNav />
    </div>
  );
}
