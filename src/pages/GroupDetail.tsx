import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import CommunityEventCard from "@/components/community/CommunityEventCard";
import EditGroupSheet from "@/components/community/EditGroupSheet";
import DeleteGroupDialog from "@/components/community/DeleteGroupDialog";
import { communityEvents } from "@/data/community";
import { supabase } from "@/lib/supabase";
import { useGroupMembership } from "@/hooks/use-group-membership";
import { useGroups, isCustomGroup, isOwnGroup } from "@/hooks/use-groups";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface GroupMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isCreator: boolean;
}

const GroupDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allGroups, updateGroup, deleteGroup } = useGroups();
  const group = allGroups.find((g) => g.slug === slug);
  const { isJoined, toggleMembership } = useGroupMembership();

  if (!group) {
    return (
      <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl items-center justify-center gap-4">
        <p className="text-muted-foreground">Group not found.</p>
        <Button variant="outline" onClick={() => navigate("/community")}>
          Back to Community
        </Button>
      </div>
    );
  }

  const joined = isJoined(group.id);
  const groupEvents = communityEvents.filter((e) => e.groupSlug === group.slug);
  const canEdit = isCustomGroup(group.id) || isOwnGroup(group, user?.id);

  const [members, setMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (!group) return;

    (async () => {
      const { data, error } = await supabase
        .from("group_memberships")
        .select("user_id, profiles(display_name, avatar_url)")
        .eq("group_id", group.id);

      if (error || !data) {
        console.warn("Failed to fetch group members:", error);
        return;
      }

      const mapped: GroupMember[] = data.map((row: any) => {
        // profiles may be null if the user doesn't have a profile row yet
        const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          userId: row.user_id,
          displayName: prof?.display_name || "Member",
          avatarUrl: prof?.avatar_url || null,
          isCreator: row.user_id === group.createdBy,
        };
      });

      // Sort creator first
      mapped.sort((a, b) => (b.isCreator ? 1 : 0) - (a.isCreator ? 1 : 0));
      setMembers(mapped);
    })();
  }, [group?.id, group?.createdBy, joined]);

  const handleSave = (data: Parameters<typeof updateGroup>[1]) => {
    const newSlug = updateGroup(group.id, data);
    if (newSlug && newSlug !== slug) {
      navigate(`/community/${newSlug}`, { replace: true });
    }
  };

  const handleDelete = () => {
    deleteGroup(group.id);
    toast.success("Group deleted.");
    navigate("/community", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto shadow-xl">
      {/* Hero header */}
      <div
        className="relative px-5 pt-12 pb-6"
        style={{ backgroundColor: group.bgColor }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <span className="text-5xl mb-3">{group.emoji}</span>
          <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {group.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {group.members} members
            </span>
          </div>

          {/* Edit / Delete for custom groups */}
          {canEdit && (
            <div className="flex items-center gap-2 mt-3">
              <EditGroupSheet group={group} onSave={handleSave} />
              <DeleteGroupDialog groupName={group.name} onConfirm={handleDelete} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="bg-card rounded-t-3xl -mt-4 shadow-lg">
          {/* Join / Leave button */}
          <div className="px-5 pt-5 pb-2">
            <Button
              className="w-full rounded-xl h-11 font-semibold"
              variant={joined ? "secondary" : "default"}
              onClick={() => toggleMembership(group.id)}
            >
              {joined ? "Leave Group" : "Join Group"}
            </Button>
          </div>

          {/* About */}
          <section className="px-5 py-4">
            <h2 className="text-sm font-bold text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {group.description}
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                {group.meetingSchedule}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                {group.location}
              </div>
            </div>
          </section>

          <Separator className="mx-5" />

          {/* Members */}
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">
                Members ({members.length})
              </h2>
            </div>
            {members.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {member.displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {member.isCreator ? "Organiser" : "Member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members yet. Be the first to join!
              </p>
            )}
          </section>

          <Separator className="mx-5" />

          {/* Upcoming Events */}
          <section className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">
                Upcoming Events
              </h2>
              {groupEvents.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {groupEvents.length} event{groupEvents.length !== 1 && "s"}
                </span>
              )}
            </div>
            {groupEvents.length > 0 ? (
              <div className="space-y-3">
                {groupEvents.map((event) => (
                  <CommunityEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events yet.
              </p>
            )}
          </section>

          <Separator className="mx-5" />

          {/* Group Rules */}
          <section className="px-5 py-4 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Group Guidelines
              </h2>
            </div>
            {group.rules.length > 0 ? (
              <div className="space-y-2">
                {group.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground font-medium mt-0.5 flex-shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-muted-foreground">{rule}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No guidelines yet.
              </p>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default GroupDetail;
