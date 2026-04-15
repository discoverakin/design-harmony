import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

const dummyBookings = [
  { exp: "Watercolor Basics", attendee: "Sarah K.", paid: "$45", fee: "$4.50", net: "$40.50" },
  { exp: "Pottery Workshop", attendee: "James L.", paid: "$65", fee: "$6.50", net: "$58.50" },
  { exp: "Watercolor Basics", attendee: "Mia T.", paid: "$45", fee: "$4.50", net: "$40.50" },
  { exp: "Jazz Night", attendee: "Tom R.", paid: "$30", fee: "$3.00", net: "$27.00" },
  { exp: "Recipe Swap", attendee: "Anna M.", paid: "$25", fee: "$2.50", net: "$22.50" },
];

export default function DashboardPayments() {
  const [tab, setTab] = useState("bookings");

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Payments</h1>

      {/* Stripe Banner */}
      <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Connect your Stripe account to receive payouts
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Link your bank account so you can get paid for bookings.
            </p>
          </div>
          <button
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white flex-shrink-0"
            style={{ backgroundColor: "#FF5C3B" }}
          >
            Connect Stripe
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Total Revenue" value="$1,240" />
        <StatCard icon={<CreditCard className="h-4 w-4" />} label="Total Bookings" value="18" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Pending Payouts" value="$892" />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-3">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Experience</TableHead>
                  <TableHead className="text-xs">Attendee</TableHead>
                  <TableHead className="text-xs text-right">Paid</TableHead>
                  <TableHead className="text-xs text-right">Fee (10%)</TableHead>
                  <TableHead className="text-xs text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyBookings.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-xs">{b.exp}</TableCell>
                    <TableCell className="text-xs">{b.attendee}</TableCell>
                    <TableCell className="text-right text-xs">{b.paid}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{b.fee}</TableCell>
                    <TableCell className="text-right text-xs font-semibold">{b.net}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="mt-3">
          <p className="text-muted-foreground py-8 text-center text-sm">No payouts yet.</p>
        </TabsContent>
      </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-3 text-center" style={{ borderLeft: "3px solid #FF5C3B" }}>
        <div className="flex justify-center mb-1 text-muted-foreground">{icon}</div>
        <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
