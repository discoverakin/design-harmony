import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Plus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";
import FeedbackButton from "@/components/FeedbackButton";

const dummyBookings = [
  { name: "Sarah K.", class: "Watercolor Basics", date: "Apr 14", amount: "$45" },
  { name: "James L.", class: "Pottery Workshop", date: "Apr 13", amount: "$65" },
  { name: "Mia T.", class: "Jazz Night", date: "Apr 12", amount: "$30" },
];

export default function Dashboard() {
  const { profile } = useProfile();

  const rawName = profile?.name || "Host";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const verificationStatus = "verified";

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
        <p className="text-sm" style={{ color: "#8B6B61" }}>Hello,</p>
        <h2 className="text-2xl font-bold mt-0.5" style={{ color: "#2D1810" }}>{displayName}</h2>
        <p className="text-sm mt-1" style={{ color: "#8B6B61" }}>Here's what's happening with your business today</p>
      </div>

      {/* Verification Banner */}
      {verificationStatus === "verified" && (
        <div className="p-4 rounded-2xl border-2 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">
                Verified Business
              </p>
              <p className="text-green-700 text-xs mt-0.5">
                Your business profile has been verified. You have full access to all features!
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
          <StatCard label="Revenue" value="$1,240" />
          <StatCard label="Bookings" value="18" />
          <StatCard label="Reviews" value="4.8" />
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
        <Card className="border-border">
          <CardContent className="p-0">
            {dummyBookings.map((b, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < dummyBookings.length - 1 ? "border-b border-border" : ""}`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#FF5C3B" }}
                >
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {b.class} · {b.date}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">{b.amount}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      </main>
      <FeedbackButton />
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
