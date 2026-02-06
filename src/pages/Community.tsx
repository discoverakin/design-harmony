import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  MessageCircle,
  Heart,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Trophy,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

/* ── Mock data ─────────────────────────────────── */

const groups = [
  {
    id: 1,
    name: "Weekend Painters",
    emoji: "🎨",
    members: 48,
    bgColor: "hsl(18 100% 92%)",
    category: "Arts & Crafts",
    isJoined: true,
  },
  {
    id: 2,
    name: "City Runners Club",
    emoji: "🏃",
    members: 124,
    bgColor: "hsl(209 100% 95%)",
    category: "Sports",
    isJoined: true,
  },
  {
    id: 3,
    name: "Vinyl & Vibes",
    emoji: "🎵",
    members: 67,
    bgColor: "hsl(40 100% 93%)",
    category: "Music",
    isJoined: false,
  },
  {
    id: 4,
    name: "Book Worms Society",
    emoji: "📚",
    members: 89,
    bgColor: "hsl(270 100% 95%)",
    category: "Reading",
    isJoined: false,
  },
  {
    id: 5,
    name: "Home Chefs United",
    emoji: "👨‍🍳",
    members: 156,
    bgColor: "hsl(120 100% 93%)",
    category: "Cooking",
    isJoined: false,
  },
];

const events = [
  {
    id: 1,
    title: "Outdoor Sketch Walk",
    date: "Sat, Feb 8",
    time: "10:00 AM",
    location: "Central Park",
    attendees: 22,
    emoji: "🎨",
    group: "Weekend Painters",
  },
  {
    id: 2,
    title: "5K Morning Run",
    date: "Sun, Feb 9",
    time: "7:30 AM",
    location: "River Trail",
    attendees: 45,
    emoji: "🏃",
    group: "City Runners Club",
  },
  {
    id: 3,
    title: "Jazz Appreciation Night",
    date: "Mon, Feb 10",
    time: "7:00 PM",
    location: "Blue Note Lounge",
    attendees: 31,
    emoji: "🎵",
    group: "Vinyl & Vibes",
  },
  {
    id: 4,
    title: "Recipe Swap Potluck",
    date: "Wed, Feb 12",
    time: "6:30 PM",
    location: "Community Kitchen",
    attendees: 18,
    emoji: "👨‍🍳",
    group: "Home Chefs United",
  },
];

const activityFeed = [
  {
    id: 1,
    user: "Sarah K.",
    avatar: "🧑‍🎨",
    action: "completed a session",
    target: "Watercolour Basics",
    time: "2h ago",
    likes: 5,
  },
  {
    id: 2,
    user: "James T.",
    avatar: "🏃‍♂️",
    action: "earned a badge",
    target: "10K Milestone",
    time: "4h ago",
    likes: 12,
    badge: "🏅",
  },
  {
    id: 3,
    user: "Maria L.",
    avatar: "👩‍🍳",
    action: "shared a recipe",
    target: "Homemade Pasta Dough",
    time: "5h ago",
    likes: 8,
  },
  {
    id: 4,
    user: "David R.",
    avatar: "🎸",
    action: "joined",
    target: "Vinyl & Vibes",
    time: "8h ago",
    likes: 3,
  },
  {
    id: 5,
    user: "Aisha M.",
    avatar: "📖",
    action: "reviewed",
    target: "The Alchemist",
    time: "1d ago",
    likes: 15,
  },
];

/* ── Components ────────────────────────────────── */

const GroupCard = ({
  group,
}: {
  group: (typeof groups)[0];
}) => {
  const [joined, setJoined] = useState(group.isJoined);

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
        style={{ backgroundColor: group.bgColor }}
      >
        <span className="text-xl">{group.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Users className="w-3 h-3" />
          {group.members} members · {group.category}
        </p>
      </div>
      <Button
        variant={joined ? "secondary" : "default"}
        size="sm"
        className="rounded-full text-xs h-8 px-4 flex-shrink-0"
        onClick={() => setJoined(!joined)}
      >
        {joined ? "Joined" : "Join"}
      </Button>
    </div>
  );
};

const EventCard = ({ event }: { event: (typeof events)[0] }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card">
    <div className="flex flex-col items-center justify-center min-w-[44px] pt-0.5">
      <span className="text-2xl">{event.emoji}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">{event.title}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Calendar className="w-3 h-3" />
          {event.date}
        </span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {event.time}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
        <MapPin className="w-3 h-3" />
        {event.location}
      </span>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          {event.group}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {event.attendees} going
        </span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ item }: { item: (typeof activityFeed)[0] }) => {
  const [liked, setLiked] = useState(false);
  const likeCount = liked ? item.likes + 1 : item.likes;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary flex-shrink-0 text-lg">
        {item.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{item.user}</span>{" "}
          <span className="text-muted-foreground">{item.action}</span>{" "}
          <span className="font-medium">{item.target}</span>
          {item.badge && <span className="ml-1">{item.badge}</span>}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-muted-foreground">{item.time}</span>
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                liked ? "fill-primary text-primary" : ""
              }`}
            />
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Page ───────────────────────────────────────── */

const Community = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          <section className="px-5 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with fellow hobbyists near you.
            </p>
          </section>

          <Tabs defaultValue="groups" className="px-5 pt-2">
            <TabsList className="w-full bg-secondary/60 rounded-xl h-11">
              <TabsTrigger
                value="groups"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Groups
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="feed"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Feed
              </TabsTrigger>
            </TabsList>

            {/* Groups */}
            <TabsContent value="groups" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">Your Groups</h2>
              </div>
              {groups
                .filter((g) => g.isJoined)
                .map((g) => (
                  <GroupCard key={g.id} group={g} />
                ))}

              <div className="flex items-center justify-between mt-5 mb-1">
                <h2 className="text-sm font-bold text-foreground">Discover Groups</h2>
              </div>
              {groups
                .filter((g) => !g.isJoined)
                .map((g) => (
                  <GroupCard key={g.id} group={g} />
                ))}
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">This Week</h2>
                <span className="text-[11px] text-muted-foreground">
                  {events.length} events
                </span>
              </div>
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </TabsContent>

            {/* Activity Feed */}
            <TabsContent value="feed" className="mt-4 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
              </div>
              <div className="divide-y-0">
                {activityFeed.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Community;
