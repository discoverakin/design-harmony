import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

const dummyListings = [
  {
    title: "Watercolor Basics",
    category: "Painting",
    price: "$45",
    bookings: 12,
    status: "active",
    emoji: "🎨",
  },
  {
    title: "Pottery Workshop",
    category: "Crafts",
    price: "$65",
    bookings: 6,
    status: "active",
    emoji: "🏺",
  },
];

export default function DashboardExperiences() {
  const { profile } = useProfile();
  const isVerified = profile?.verificationStatus === "verified";

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto shadow-xl bg-background">
      <AkinHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Listings</h2>
          <p className="text-sm text-muted-foreground">Manage your hobby experiences and workshops</p>
        </div>
        <button
          disabled={!isVerified}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FF5C3B" }}
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {!isVerified && (
        <p className="text-xs text-muted-foreground -mt-3">
          Adding listings is available once your account is verified
        </p>
      )}

      {/* Current Listings header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          Current Listings
        </h3>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
          {dummyListings.length} Active
        </Badge>
      </div>

      {/* Listing cards */}
      <div className="space-y-3">
        {dummyListings.map((listing, i) => (
          <Card key={i} className="border-border overflow-hidden">
            <CardContent className="p-4 flex gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#F9E9E4" }}
              >
                <span className="text-2xl">{listing.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm text-foreground">{listing.title}</h4>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-1.5 py-0">
                    Active
                  </Badge>
                </div>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: "#F9E9E4", color: "#8B6B61" }}
                >
                  {listing.category}
                </span>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{listing.price}</span>
                  <span>{listing.bookings} bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </main>
      <BottomNav />
    </div>
  );
}
