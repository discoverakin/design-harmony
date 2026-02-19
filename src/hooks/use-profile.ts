import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "akin-profile";

export interface ProfileData {
  name: string;
  handle: string;
  avatarUrl: string | null;
}

function getStored(): ProfileData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useProfile(defaults: { name: string; handle: string }) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    const stored = getStored();
    return stored ?? { name: defaults.name, handle: defaults.handle, avatarUrl: null };
  });

  // Sync defaults when auth user changes
  useEffect(() => {
    const stored = getStored();
    if (!stored) {
      setProfile({ name: defaults.name, handle: defaults.handle, avatarUrl: null });
    }
  }, [defaults.name, defaults.handle]);

  const updateProfile = useCallback((patch: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { profile, updateProfile };
}
