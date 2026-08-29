import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus, CalendarDays, Bookmark, Search, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import AuthPromptSheet from "@/components/AuthPromptSheet";
import EventListCard from "@/components/events/EventListCard";
import EventFilterBar from "@/components/events/EventFilterBar";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useUserLocation } from "@/hooks/use-user-location";
import { useSavedEvents } from "@/hooks/use-saved-events";
import {
  applyEventFilters,
  applyFiltersToParams,
  countActiveFilters,
  dateRangeFor,
  DATE_PRESET_LABELS,
  filtersFromParams,
  NO_FILTERS,
  type EventFilters,
} from "@/lib/eventFilters";

const Events = () => {
  const { approvedEvents, loading } = useEvents();
  const { user } = useAuth();
  const { savedIds } = useSavedEvents();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Filters live in the URL, so a tap into an event and back keeps them.
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const setFilters = useCallback(
    (next: EventFilters) =>
      setSearchParams(applyFiltersToParams(next, searchParams), { replace: true }),
    [searchParams, setSearchParams]
  );

  // Only ask for the device location once a radius is actually chosen.
  const { origin, usingDeviceLocation, locating } = useUserLocation(
    filters.radiusMiles != null
  );

  const handleCreate = () => {
    if (user) {
      navigate("/events/create");
    } else {
      setAuthPromptOpen(true);
    }
  };

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
          e.group_name?.toLowerCase().includes(q)
      );
    }
    return sorted;
  }, [approvedEvents, searchQuery]);

  const savedEvents = useMemo(
    () => approvedEvents.filter((e) => savedIds.has(e.id)),
    [approvedEvents, savedIds]
  );

  const attendedEvents = useMemo(
    () => approvedEvents.filter((e) => e.has_attended),
    [approvedEvents]
  );

  // Date/price/distance are applied here rather than in the query: the whole
  // approved list is already in memory, so filtering is instant and works the
  // same for anonymous visitors.
  const result = useMemo(
    () => applyEventFilters(filteredEvents, filters, { origin }),
    [filteredEvents, filters, origin]
  );

  const activeFilterCount = countActiveFilters(filters);
  const dateRange = dateRangeFor(filters);
  const totalShown = result.dated.length + result.recurring.length;

  // With a date filter on, the relative headings below would contradict it
  // ("Next week" events landing under "This Week"), so the filter names the
  // one section instead.
  const dateFilterLabel = filters.day
    ? format(new Date(filters.day + "T00:00:00"), "EEEE, MMM d")
    : DATE_PRESET_LABELS[filters.date];

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextWeekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  // Time-based sections only for single-day events; ongoing/multi get their own
  // section since their anchor date may be in the past.
  const todayEvents = result.dated.filter((e) => e.date === today);
  const tomorrowEvents = result.dated.filter((e) => e.date === tomorrow);
  const thisWeekEvents = result.dated.filter(
    (e) => e.date > tomorrow && e.date <= nextWeekEnd
  );
  const laterEvents = result.dated.filter((e) => e.date > nextWeekEnd);

  // What a filter had to hold back for lack of data, so it can be said out
  // loud. A quarter of approved events have no price and some carry the
  // no-schedule sentinel date — see docs/data-quality.md.
  const heldBack = [
    result.hiddenUndated > 0 && `${result.hiddenUndated} with no confirmed date`,
    result.hiddenUnpriced > 0 && `${result.hiddenUnpriced} with no listed price`,
    result.hiddenUnmapped > 0 && `${result.hiddenUnmapped} not yet mapped`,
  ].filter(Boolean) as string[];

  const EventSection = ({
    title,
    events,
    note,
    emptyHidden = true,
  }: {
    title: string;
    events: typeof result.dated;
    note?: string;
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
        {note && <p className="text-[11px] text-muted-foreground mb-2">{note}</p>}
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
                <Button
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={handleCreate}
                >
                  <Plus className="w-4 h-4" />
                  Create
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
              {/* Filters — always visible, no typing required */}
              <div className="space-y-2">
                <EventFilterBar
                  filters={filters}
                  onChange={setFilters}
                  originLabel={
                    usingDeviceLocation ? "your location" : "downtown Ann Arbor"
                  }
                  locating={locating}
                />
                {!loading && heldBack.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Not shown: {heldBack.join(" · ")}.
                  </p>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : totalShown === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm text-muted-foreground">
                    No events found
                    {searchQuery ? ` matching "${searchQuery}"` : ""}
                    {activeFilterCount > 0 ? " for these filters" : ""}.
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...NO_FILTERS })}
                      className="text-sm font-semibold text-primary hover:underline mt-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {dateRange ? (
                    <EventSection title={dateFilterLabel} events={result.dated} />
                  ) : (
                    <>
                      <EventSection title="Today" events={todayEvents} />
                      <EventSection title="Tomorrow" events={tomorrowEvents} />
                      <EventSection title="This Week" events={thisWeekEvents} />
                      <EventSection title="Coming Up" events={laterEvents} />
                    </>
                  )}
                  <EventSection
                    title="Ongoing"
                    events={result.recurring}
                    note={
                      dateRange
                        ? "These run on a repeating schedule, so they may or may not fall on the dates you picked — check the listing."
                        : undefined
                    }
                  />
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

      <AuthPromptSheet
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        title="Log in to create an event"
        subtitle="Create a free account to publish your event on Discover Akin."
        pathname="/events/create"
      />
    </div>
  );
};

export default Events;
