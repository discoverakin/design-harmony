import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin, DollarSign, Pencil, Trash2, Plus } from "lucide-react";
import { AkinHeader } from "@/components/dashboard/AkinHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";

const dummyListings = [
  {
    title: "Watercolor Basics",
    category: "Painting",
    price: "$45",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&fit=crop",
  },
  {
    title: "Pottery Workshop",
    category: "Crafts",
    price: "$65",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=120&h=120&fit=crop",
  },
  {
    title: "Jazz Appreciation Night",
    category: "Music",
    price: "$30",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=120&h=120&fit=crop",
  },
  {
    title: "Recipe Swap Potluck",
    category: "Cooking",
    price: "$25",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop",
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
          10 Active
        </Badge>
      </div>

      {/* Listing cards */}
      <div className="space-y-3">
        {dummyListings.map((listing, i) => (
          <Card key={i} className="border-border overflow-hidden">
            <CardContent className="p-3 flex gap-3">
              {/* Image */}
              <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-1 left-1 bg-green-600 text-white text-[9px] px-1 py-0">
                  ACTIVE
                </Badge>
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm text-foreground truncate">{listing.title}</h4>
                  <div className="flex items-center gap-0.5 text-primary ml-2 flex-shrink-0">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-medium">4.9</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{listing.category}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />{listing.price.replace("$", "")}
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
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tools */}
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
      </main>
      <BottomNav />
    </div>
  );
}
