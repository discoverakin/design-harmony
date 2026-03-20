import { useState, useCallback, useEffect } from "react";
import { groups as fallbackGroups, type CommunityGroup } from "@/data/community";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

/** A group is user-editable if the current user created it */
export function isOwnGroup(group: CommunityGroup, userId: string | undefined) {
  return !!userId && group.createdBy === userId;
}

// Keep the old export name so GroupDetail still compiles — it now always
// returns false for seed groups (created_by = null) which is correct.
export function isCustomGroup(groupId: string) {
  // Seed-data groups have deterministic UUIDs starting with 00000000-
  return !groupId.startsWith("00000000-");
}

function rowToGroup(row: any, memberCount: number): CommunityGroup {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    description: row.description,
    category: row.category,
    bgColor: row.bg_color,
    meetingSchedule: row.meeting_schedule,
    location: row.location,
    coverImageUrl: row.cover_image_url,
    members: memberCount,
    isJoined: false, // filled in by the caller
    recentPhotos: [],
    rules: row.rules ?? [],
    createdBy: row.created_by,
  };
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>(fallbackGroups);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !rows) {
      console.warn("Failed to fetch groups, using fallback:", error);
      setGroups(fallbackGroups);
      setLoading(false);
      return;
    }

    // Fetch member counts in one query
    const { data: counts } = await supabase
      .from("group_memberships")
      .select("group_id");

    const countMap: Record<string, number> = {};
    (counts || []).forEach((row: any) => {
      countMap[row.group_id] = (countMap[row.group_id] || 0) + 1;
    });

    const mapped = rows.map((row: any) =>
      rowToGroup(row, countMap[row.id] || 0)
    );

    setGroups(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const allGroups = groups;

  const addGroup = useCallback(
    async (data: {
      name: string;
      emoji: string;
      category: string;
      description: string;
      meetingSchedule: string;
      location: string;
    }) => {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const bgColor = `hsl(${Math.floor(Math.random() * 360)} 80% 93%)`;

      const { data: row, error } = await supabase
        .from("groups")
        .insert({
          name: data.name,
          slug,
          emoji: data.emoji,
          category: data.category,
          description: data.description,
          meeting_schedule: data.meetingSchedule,
          location: data.location,
          bg_color: bgColor,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error || !row) {
        console.error("Failed to create group:", error);
        // Fallback: add locally
        const local: CommunityGroup = {
          id: crypto.randomUUID(),
          slug,
          name: data.name,
          emoji: data.emoji,
          category: data.category,
          description: data.description,
          meetingSchedule: data.meetingSchedule,
          location: data.location,
          members: 1,
          bgColor,
          isJoined: true,
          coverImageUrl: null,
          recentPhotos: [],
          rules: [],
          createdBy: user?.id ?? null,
        };
        setGroups((prev) => [...prev, local]);
        return local;
      }

      const newGroup = rowToGroup(row, 1);
      newGroup.isJoined = true;
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    },
    [user]
  );

  const updateGroup = useCallback(
    async (
      groupId: string,
      data: {
        name: string;
        emoji: string;
        category: string;
        description: string;
        meetingSchedule: string;
        location: string;
      }
    ) => {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await supabase
        .from("groups")
        .update({
          name: data.name,
          slug,
          emoji: data.emoji,
          category: data.category,
          description: data.description,
          meeting_schedule: data.meetingSchedule,
          location: data.location,
        })
        .eq("id", groupId);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, ...data, slug } : g
        )
      );

      return slug;
    },
    []
  );

  const deleteGroup = useCallback(async (groupId: string) => {
    await supabase.from("groups").delete().eq("id", groupId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  return { allGroups, addGroup, updateGroup, deleteGroup, loading, refresh: fetchGroups };
}
