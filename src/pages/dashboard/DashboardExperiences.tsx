import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin, DollarSign, Pencil, Trash2, Plus } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardExperiences() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const isVerified = profile?.verificationStatus === "verified";

  const { data: experiences = [] } = useQuery({
    queryKey: ["host-experiences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const activeCount = experiences.filter((e) => e.status === "published").length;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Listings</h2>
        <p className="text-sm text-muted-foreground">Manage your hobby experiences and workshops</p>
      </div>

      {/* Current Listings header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          Current Listings
        </h3>
        {activeCount > 0 && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
            {activeCount} Active
          </Badge>
        )}
      </div>

      {/* Experience cards */}
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(255, 92, 59, 0.08)" }}
            >
              <span className="text-4xl">🎨</span>
            </div>
            <p className="text-lg font-bold text-foreground mb-1">No listings yet</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
              Create your first experience to start getting bookings
            </p>
            {isVerified ? (
              <Link to="/dashboard/experiences/new">
                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#FF5C3B" }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Listing
                </button>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: "#FF5C3B" }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Listing
                </button>
                <p className="text-xs text-muted-foreground">You can add listings once your account is verified</p>
              </div>
            )}

            {/* How it works */}
            <div className="w-full mt-10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">How it works</p>
              <div className="flex items-start justify-between gap-2">
                {[
                  { step: "1", icon: "✏️", label: "Create listing" },
                  { step: "2", icon: "📅", label: "Get bookings" },
                  { step: "3", icon: "💰", label: "Earn revenue" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{ backgroundColor: "#F9E9E4" }}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          experiences.map((exp) => (
            <Card key={exp.id} className="border-border overflow-hidden">
              <CardContent className="p-3 flex gap-3">
                {/* Image placeholder */}
                <div className="w-20 h-20 rounded-lg bg-accent flex-shrink-0 overflow-hidden relative">
                  {exp.cover_image_url ? (
                    <img src={exp.cover_image_url} alt={exp.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                  )}
                  {exp.status === "published" && (
                    <Badge className="absolute top-1 left-1 bg-green-600 text-white text-[9px] px-1 py-0">ACTIVE</Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-foreground truncate">{exp.title}</h4>
                    <div className="flex items-center gap-0.5 text-primary ml-2 flex-shrink-0">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{exp.category || "Uncategorized"}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />${exp.price ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />2 hours
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Downtown Studio</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Link to={`/dashboard/experiences/${exp.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Tools — only show when there are listings */}
      {experiences.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            Quick Tools
          </h3>
          {isVerified ? (
            <Link to="/dashboard/experiences/new">
              <Card className="bg-white border-2 border-[#FF5C3B]/20 hover:border-[#FF5C3B]/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(255, 92, 59, 0.1)" }}
                  >
                    <Plus className="h-4 w-4" style={{ color: "#FF5C3B" }} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Add New Listing</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="bg-white border-2 border-border opacity-50 cursor-not-allowed">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(255, 92, 59, 0.1)" }}
                >
                  <Plus className="h-4 w-4" style={{ color: "#FF5C3B" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Add New Listing</p>
                  <p className="text-xs text-muted-foreground">Available after verification</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </main>
      <BottomNav />
    </div>
  );
}
