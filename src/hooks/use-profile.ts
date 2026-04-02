import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface ProfileData {
  name: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  hasCompletedOnboarding: boolean;
}

export function useProfile(defaults?: { name: string; handle: string }) {
  const { user } = useAuth();

  // Derive sensible defaults from the auth user when caller doesn't supply them
  const fallbackName =
    defaults?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const fallbackHandle =
    defaults?.handle ||
    `@${(user?.email?.split("@")[0] || "user").toLowerCase()}`;

  const [profile, setProfile] = useState<ProfileData>({
    name: fallbackName,
    handle: fallbackHandle,
    avatarUrl: null,
    bio: null,
    hasCompletedOnboarding: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase on mount / user change — auto-create if missing
  useEffect(() => {
    if (!user) {
      setProfile({ name: fallbackName, handle: fallbackHandle, avatarUrl: null, bio: null, hasCompletedOnboarding: false });
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, handle, avatar_url, bio, has_completed_onboarding")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setProfile({ name: fallbackName, handle: fallbackHandle, avatarUrl: null, bio: null, hasCompletedOnboarding: false });
      } else if (data) {
        setProfile({
          name: data.display_name,
          handle: data.handle,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          hasCompletedOnboarding: data.has_completed_onboarding ?? false,
        });
      } else {
        // No profile row yet — auto-create from user email / metadata
        const autoName =
          user!.user_metadata?.full_name ||
          user!.email?.split("@")[0] ||
          "User";
        const autoHandle = `@${(user!.email?.split("@")[0] || "user").toLowerCase()}`;

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: user!.id,
              display_name: autoName,
              handle: autoHandle,
            },
            { onConflict: "user_id" }
          )
          .select("display_name, handle, avatar_url, bio, has_completed_onboarding")
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
            hasCompletedOnboarding: inserted.has_completed_onboarding ?? false,
          });
        }
      }

      setLoading(false);
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [user?.id]);

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
      if (patch.hasCompletedOnboarding !== undefined) updates.has_completed_onboarding = patch.hasCompletedOnboarding;

      if (Object.keys(updates).length === 0) return;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("Failed to update profile:", error.message);
      }
    },
    [user],
  );

  return { profile, updateProfile, loading };
}
