import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Clock, MapPin, DollarSign, Pencil, Trash2 } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

export default function DashboardExperiences() {
  const { user } = useAuth();

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
          ⊞ Current Listings
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
          <p className="text-sm text-muted-foreground text-center py-8">No listings yet. Create your first one!</p>
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

      {/* Quick Tools */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          ＋ Quick Tools
        </h3>
        <Link to="/dashboard/experiences/new">
          <Card className="bg-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="font-semibold text-sm">Add New Listing</p>
              <ChevronRight className="h-5 w-5" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pro Tip */}
      <Card className="border-border bg-accent/30">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-foreground mb-1">💡 Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Active listings with high-quality images get 3x more bookings. Make sure to add detailed descriptions!
          </p>
        </CardContent>
      </Card>
      </main>
      <BottomNav />
    </div>
  );
}
