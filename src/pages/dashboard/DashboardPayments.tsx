import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Bookings query
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["host-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: experiences } = await supabase
        .from("experiences")
        .select("id, title")
        .eq("host_id", user!.id);
      if (!experiences?.length) return [];
      const expIds = experiences.map((e) => e.id);
      const { data: rows, error } = await supabase
        .from("bookings")
        .select("*, experience_sessions(starts_at)")
        .in("experience_id", expIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const expMap = Object.fromEntries(experiences.map((e) => [e.id, e.title]));
      return (rows ?? []).map((b: any) => ({
        ...b,
        experience_title: expMap[b.experience_id] ?? "Unknown",
        session_date: b.experience_sessions?.starts_at ?? null,
      }));
    },
  });

  // Payouts query
  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ["host-payouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Summary
  const totalRevenue = bookings.reduce((s: number, b: any) => s + Number(b.net_amount), 0);
  const totalBookings = bookings.length;
  const pendingPayouts = payouts
    .filter((p: any) => p.status === "pending")
    .reduce((s: number, p: any) => s + Number(p.amount), 0);

  // TODO: wire to real Stripe Connect status from profiles table
  const hasStripe = false;

  const handleRequestPayout = async () => {
    try {
      const { error } = await supabase.functions.invoke("request-payout", {
        body: { host_id: user!.id },
      });
      if (error) throw error;
      toast({ title: "Payout requested", description: "Your payout is being processed." });
      queryClient.invalidateQueries({ queryKey: ["host-payouts"] });
    } catch {
      toast({ title: "Error", description: "Failed to request payout.", variant: "destructive" });
    }
  };

  const handleConnectStripe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", {
        body: { host_id: user!.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast({ title: "Error", description: "Failed to start Stripe onboarding.", variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": case "transferred": return "default";
      case "pending": return "secondary";
      case "refunded": case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>

      {!hasStripe && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm font-medium">Connect your Stripe account to receive payouts.</p>
            </div>
            <Button onClick={handleConnectStripe} size="sm">
              <ExternalLink className="mr-2 h-4 w-4" /> Connect Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalBookings}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">${pendingPayouts.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {bookingsLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No bookings yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Experience</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Attendee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Fee (10%)</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.experience_title}</TableCell>
                      <TableCell>{b.session_date ? format(new Date(b.session_date), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>{b.attendee_name || "Anonymous"}</TableCell>
                      <TableCell className="text-right">${Number(b.amount_paid).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${Number(b.platform_fee).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${Number(b.net_amount).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={statusColor(b.status) as any}>{b.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payouts">
          <div className="mb-4 flex justify-end">
            <Button onClick={handleRequestPayout} disabled={!hasStripe}>
              Request Payout
            </Button>
          </div>
          {payoutsLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading…</p>
          ) : payouts.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No payouts yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={statusColor(p.status) as any}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sponsorship Request Panel */}
      <SponsorshipRequestForm hostId={user?.id} />
    </div>
  );
}

function SponsorshipRequestForm({ hostId }: { hostId?: string }) {
  const [concept, setConcept] = useState("");
  const [attendance, setAttendance] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [sponsorEmail, setSponsorEmail] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!hostId) throw new Error("Not authenticated");
      const id = crypto.randomUUID();
      const { error } = await supabase.from("sponsorship_requests").insert({
        id,
        host_id: hostId,
        concept,
        expected_attendance: parseInt(attendance) || 0,
        amount: parseFloat(amount) || 0,
        category,
        sponsor_email: sponsorEmail,
      });
      if (error) throw error;

      await supabase.functions.invoke("send-sponsorship-request", {
        body: {
          sponsorship_request_id: id,
          sponsor_email: sponsorEmail,
          concept,
          amount: parseFloat(amount) || 0,
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Sent!", description: "Sponsorship request sent to sponsor." });
      setConcept(""); setAttendance(""); setAmount(""); setCategory("other"); setSponsorEmail("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send sponsorship request.", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request Sponsorship</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div className="sm:col-span-2">
            <label className="text-sm font-medium mb-1 block">Workshop Concept</label>
            <Textarea value={concept} onChange={(e) => setConcept(e.target.value)} required placeholder="Describe your workshop concept…" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Expected Attendance</label>
            <Input type="number" min={1} value={attendance} onChange={(e) => setAttendance(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ask Amount (USD)</label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Sponsor Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fnb">F&B</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Sponsor Email</label>
            <Input type="email" value={sponsorEmail} onChange={(e) => setSponsorEmail(e.target.value)} required placeholder="sponsor@company.com" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Send Sponsorship Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
