import { Users, Calendar, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import GroupCard from "@/components/community/GroupCard";
import CommunityEventCard from "@/components/community/CommunityEventCard";
import ActivityItem from "@/components/community/ActivityItem";
import { groups, communityEvents, activityFeed } from "@/data/community";

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
