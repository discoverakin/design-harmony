import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, CalendarDays, Bookmark, Search, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import EventListCard from "@/components/events/EventListCard";
import { useEvents } from "@/hooks/use-events";

const Events = () => {
  const { approvedEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredEvents = useMemo(() => {
    let sorted = [...approvedEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.group?.toLowerCase().includes(q)
      );
    }
    return sorted;
  }, [approvedEvents, searchQuery]);

  const savedEvents = useMemo(
    () => approvedEvents.filter((e) => e.savedBy.includes("You")),
    [approvedEvents]
  );

  const attendedEvents = useMemo(
    () => approvedEvents.filter((e) => (e.attendedBy || []).includes("You")),
    [approvedEvents]
  );

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextWeekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  // Time-based sections
  const todayEvents = filteredEvents.filter((e) => e.date === today);
  const tomorrowEvents = filteredEvents.filter((e) => e.date === tomorrow);
  const thisWeekEvents = filteredEvents.filter(
    (e) => e.date > tomorrow && e.date <= nextWeekEnd
  );
  const laterEvents = filteredEvents.filter((e) => e.date > nextWeekEnd);

  const upcomingEvents = filteredEvents.filter((e) => e.date >= today);

  const EventSection = ({
    title,
    events,
    emptyHidden = true,
  }: {
    title: string;
    events: typeof filteredEvents;
    emptyHidden?: boolean;
  }) => {
    if (events.length === 0 && emptyHidden) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="space-y-3">
          {events.map((evt) => (
            <EventListCard key={evt.id} event={evt} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      <AppHeader />

      <main className="flex-1 overflow-y-auto pb-4">
        <div className="bg-card rounded-t-3xl -mt-1 shadow-lg">
          {/* Header */}
          <section className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Events</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover what's happening near you.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  {showSearch ? (
                    <X className="w-5 h-5 text-foreground" />
                  ) : (
                    <Search className="w-5 h-5 text-foreground" />
                  )}
                </button>
                <Button asChild size="sm" className="rounded-full gap-1.5">
                  <Link to="/events/create">
                    <Plus className="w-4 h-4" />
                    Create
                  </Link>
                </Button>
              </div>
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, locations, groups..."
                  className="pl-9 rounded-xl"
                  autoFocus
                />
              </div>
            )}
          </section>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="px-5 pt-3">
            <TabsList className="w-full bg-secondary/60 rounded-xl h-11">
              <TabsTrigger
                value="upcoming"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                Saved
              </TabsTrigger>
              <TabsTrigger
                value="attended"
                className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4 space-y-5 pb-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm text-muted-foreground">
                    No events found
                    {searchQuery ? ` matching "${searchQuery}"` : ""}.
                  </p>
                </div>
              ) : (
                <>
                  <EventSection title="Today" events={todayEvents} />
                  <EventSection title="Tomorrow" events={tomorrowEvents} />
                  <EventSection title="This Week" events={thisWeekEvents} />
                  <EventSection title="Coming Up" events={laterEvents} />
                </>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">Saved Events</h2>
              </div>
              {savedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🔖</p>
                  <p className="text-sm text-muted-foreground">
                    No saved events yet. Tap the bookmark on any event to save it.
                  </p>
                </div>
              ) : (
                savedEvents.map((evt) => (
                  <EventListCard key={evt.id} event={evt} />
                ))
              )}
            </TabsContent>

            {/* Attended / Past */}
            <TabsContent value="attended" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">Past Events</h2>
                {attendedEvents.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {attendedEvents.length} attended
                  </span>
                )}
              </div>
              {attendedEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm text-muted-foreground">
                    No attended events yet. RSVP to an event, go, and mark it as attended to see it here.
                  </p>
                </div>
              ) : (
                attendedEvents.map((evt) => (
                  <EventListCard key={evt.id} event={evt} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Events;
