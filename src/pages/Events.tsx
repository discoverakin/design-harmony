import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, CalendarDays, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import EventListCard from "@/components/events/EventListCard";
import EventFilters from "@/components/events/EventFilters";
import { useEvents } from "@/hooks/use-events";
import type { HobbyCategory } from "@/data/hobbies";

const Events = () => {
  const { approvedEvents } = useEvents();
  const [categoryFilter, setCategoryFilter] = useState<HobbyCategory | "All">("All");

  const filteredEvents = useMemo(() => {
    const sorted = [...approvedEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (categoryFilter === "All") return sorted;
    return sorted.filter((e) => e.hobbyCategory === categoryFilter);
  }, [approvedEvents, categoryFilter]);

  const savedEvents = useMemo(
    () => approvedEvents.filter((e) => e.savedBy.includes("You")),
    [approvedEvents]
  );

  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.date) >= new Date(new Date().toDateString())
  );

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
              <Button asChild size="sm" className="rounded-full gap-1.5">
                <Link to="/events/create">
                  <Plus className="w-4 h-4" />
                  Create
                </Link>
              </Button>
            </div>
          </section>

          {/* Filters */}
          <div className="px-5 pt-3 pb-1">
            <EventFilters selected={categoryFilter} onSelect={setCategoryFilter} />
          </div>

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
            </TabsList>

            <TabsContent value="upcoming" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">
                  {categoryFilter === "All" ? "All Events" : categoryFilter}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm text-muted-foreground">
                    No upcoming events
                    {categoryFilter !== "All" ? ` in ${categoryFilter}` : ""}.
                  </p>
                </div>
              ) : (
                upcomingEvents.map((evt) => (
                  <EventListCard key={evt.id} event={evt} />
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">Saved Events</h2>
                <span className="text-[11px] text-muted-foreground">
                  {savedEvents.length} saved
                </span>
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
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Events;
