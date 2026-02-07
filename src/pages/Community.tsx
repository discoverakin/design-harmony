import { useState, useMemo } from "react";
import { Users, Calendar, MessageCircle, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GroupCard from "@/components/community/GroupCard";
import CommunityEventCard from "@/components/community/CommunityEventCard";
import ActivityItem from "@/components/community/ActivityItem";
import { groups, communityEvents, activityFeed } from "@/data/community";
import { useGroupMembership } from "@/hooks/use-group-membership";

const ALL_CATEGORIES = Array.from(new Set(groups.map((g) => g.category)));

const Community = () => {
  const { isJoined, toggleMembership } = useGroupMembership();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return groups.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      const matchesCategory =
        !activeCategory || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const yourGroups = filtered.filter((g) => isJoined(g.id));
  const discoverGroups = filtered.filter((g) => !isJoined(g.id));

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

            <TabsContent value="groups" className="mt-4 pb-6">
              {/* Search + category filter */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-9 h-10 rounded-xl bg-secondary/50 border-none text-sm placeholder:text-muted-foreground"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <Badge
                    variant={activeCategory === null ? "default" : "secondary"}
                    className="cursor-pointer flex-shrink-0 text-[11px] px-3 py-1 rounded-full"
                    onClick={() => setActiveCategory(null)}
                  >
                    All
                  </Badge>
                  {ALL_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? "default" : "secondary"}
                      className="cursor-pointer flex-shrink-0 text-[11px] px-3 py-1 rounded-full"
                      onClick={() =>
                        setActiveCategory(activeCategory === cat ? null : cat)
                      }
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {yourGroups.length === 0 && discoverGroups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No groups match your search.
                </p>
              )}

              <AnimatePresence mode="popLayout">
                {yourGroups.length > 0 && (
                  <motion.div
                    key="your-groups-section"
                    layout
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-foreground">
                        Your Groups
                      </h2>
                      <span className="text-[11px] text-muted-foreground">
                        {yourGroups.length} joined
                      </span>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {yourGroups.map((g) => (
                          <motion.div
                            key={g.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <GroupCard
                              group={g}
                              joined
                              onToggleJoin={toggleMembership}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {discoverGroups.length > 0 && (
                  <motion.div
                    key="discover-groups-section"
                    layout
                    className="mt-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-foreground">
                        Discover Groups
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {discoverGroups.map((g) => (
                          <motion.div
                            key={g.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <GroupCard
                              group={g}
                              joined={false}
                              onToggleJoin={toggleMembership}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="mt-4 space-y-3 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">This Week</h2>
                <span className="text-[11px] text-muted-foreground">
                  {communityEvents.length} events
                </span>
              </div>
              {communityEvents.map((e) => (
                <CommunityEventCard key={e.id} event={e} />
              ))}
            </TabsContent>

            {/* Activity Feed */}
            <TabsContent value="feed" className="mt-4 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-foreground">
                  Recent Activity
                </h2>
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
