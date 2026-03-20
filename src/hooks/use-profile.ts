import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface ProfileData {
  name: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
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
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase on mount / user change — auto-create if missing
  useEffect(() => {
    if (!user) {
      setProfile({ name: fallbackName, handle: fallbackHandle, avatarUrl: null, bio: null });
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
        setProfile({ name: fallbackName, handle: fallbackHandle, avatarUrl: null, bio: null });
      } else if (data) {
        setProfile({
          name: data.display_name,
          handle: data.handle,
          avatarUrl: data.avatar_url,
          bio: data.bio,
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
          .insert({
            user_id: user!.id,
            display_name: autoName,
            handle: autoHandle,
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
  }, [user?.id]);

  const updateProfile = useCallback(
    async (patch: Partial<ProfileData>) => {
      console.log("[useProfile] updateProfile called with patch:", patch);
      console.log("[useProfile] current user:", user?.id, user?.email);

      // Optimistically update local state
      setProfile((prev) => ({ ...prev, ...patch }));

      if (!user) {
        console.warn("[useProfile] No user logged in — skipping Supabase update");
        return;
      }

      const updates: Record<string, unknown> = {};
      if (patch.name !== undefined) updates.display_name = patch.name;
      if (patch.handle !== undefined) updates.handle = patch.handle;
      if (patch.avatarUrl !== undefined) updates.avatar_url = patch.avatarUrl;
      if (patch.bio !== undefined) updates.bio = patch.bio;

      if (Object.keys(updates).length === 0) {
        console.warn("[useProfile] No fields to update after mapping");
        return;
      }

      console.log("[useProfile] Sending to Supabase profiles table:", {
        updates,
        userId: user.id,
      });

      const { data, error, status, statusText } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select();

      console.log("[useProfile] Supabase response:", {
        data,
        error,
        status,
        statusText,
      });

      if (error) {
        console.error("[useProfile] Failed to update profile:", error.message, error);
      } else {
        console.log("[useProfile] Profile updated successfully:", data);
      }
    },
    [user],
  );

  return { profile, updateProfile, loading };
}
