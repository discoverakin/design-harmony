import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export function useGroupMembership() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Record<string, boolean>>({});

  // Fetch current user's memberships from Supabase
  useEffect(() => {
    if (!user) {
      setMembership({});
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("group_memberships")
        .select("group_id")
        .eq("user_id", user.id);

      if (error) {
        console.warn("Failed to fetch memberships:", error);
        return;
      }

      const map: Record<string, boolean> = {};
      (data || []).forEach((row: any) => {
        map[row.group_id] = true;
      });
      setMembership(map);
    })();
  }, [user]);

  const isJoined = useCallback(
    (groupId: string) => membership[groupId] ?? false,
    [membership]
  );

  const toggleMembership = useCallback(
    async (groupId: string) => {
      if (!user) return;

      const currentlyJoined = membership[groupId] ?? false;

      // Optimistic update
      setMembership((prev) => ({ ...prev, [groupId]: !currentlyJoined }));

      if (currentlyJoined) {
        const { error } = await supabase
          .from("group_memberships")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Failed to leave group:", error);
          // Revert
          setMembership((prev) => ({ ...prev, [groupId]: true }));
        }
      } else {
        const { error } = await supabase
          .from("group_memberships")
          .insert({ group_id: groupId, user_id: user.id });

        if (error) {
          console.error("Failed to join group:", error);
          // Revert
          setMembership((prev) => ({ ...prev, [groupId]: false }));
        }
      }
    },
    [user, membership]
  );

  const joinGroup = useCallback(
    async (groupId: string) => {
      if (!user) return;
      if (membership[groupId]) return;

      setMembership((prev) => ({ ...prev, [groupId]: true }));

      const { error } = await supabase
        .from("group_memberships")
        .insert({ group_id: groupId, user_id: user.id });

      if (error) {
        console.error("Failed to join group:", error);
        setMembership((prev) => ({ ...prev, [groupId]: false }));
      }
    },
    [user]
  );

  return { isJoined, toggleMembership, joinGroup };
}
