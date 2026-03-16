import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface ProfileData {
  name: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function useProfile(defaults: { name: string; handle: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: defaults.name,
    handle: defaults.handle,
    avatarUrl: null,
    bio: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setProfile({ name: defaults.name, handle: defaults.handle, avatarUrl: null, bio: null });
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, handle, avatar_url, bio")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setProfile({ name: defaults.name, handle: defaults.handle, avatarUrl: null, bio: null });
      } else if (data) {
        setProfile({
          name: data.display_name,
          handle: data.handle,
          avatarUrl: data.avatar_url,
          bio: data.bio,
        });
      } else {
        // No profile row yet — create one with defaults
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user!.id,
            display_name: defaults.name,
            handle: defaults.handle,
          })
          .select("display_name, handle, avatar_url, bio")
          .single();

        if (cancelled) return;

        if (insertError) {
          console.error("Failed to create profile:", insertError.message);
        } else if (inserted) {
          setProfile({
            name: inserted.display_name,
            handle: inserted.handle,
            avatarUrl: inserted.avatar_url,
            bio: inserted.bio,
          });
        }
      }

      setLoading(false);
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [user?.id, defaults.name, defaults.handle]);

  const updateProfile = useCallback(
    async (patch: Partial<ProfileData>) => {
      // Optimistically update local state
      setProfile((prev) => ({ ...prev, ...patch }));

      if (!user) return;

      const updates: Record<string, unknown> = {};
      if (patch.name !== undefined) updates.display_name = patch.name;
      if (patch.handle !== undefined) updates.handle = patch.handle;
      if (patch.avatarUrl !== undefined) updates.avatar_url = patch.avatarUrl;
      if (patch.bio !== undefined) updates.bio = patch.bio;

      if (Object.keys(updates).length === 0) return;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to update profile:", error.message);
      }
    },
    [user],
  );

  return { profile, updateProfile, loading };
}
