import { useState, useCallback } from "react";
import { groups as defaultGroups } from "@/data/community";

const STORAGE_KEY = "akin-group-membership";

function getStoredMembership(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed from default data
  const initial: Record<number, boolean> = {};
  defaultGroups.forEach((g) => {
    initial[g.id] = g.isJoined;
  });
  return initial;
}

function saveMembership(membership: Record<number, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(membership));
}

export function useGroupMembership() {
  const [membership, setMembership] = useState<Record<number, boolean>>(
    getStoredMembership
  );

  const isJoined = useCallback(
    (groupId: number) => membership[groupId] ?? false,
    [membership]
  );

  const toggleMembership = useCallback((groupId: number) => {
    setMembership((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      saveMembership(next);
      return next;
    });
  }, []);

  const joinGroup = useCallback((groupId: number) => {
    setMembership((prev) => {
      const next = { ...prev, [groupId]: true };
      saveMembership(next);
      return next;
    });
  }, []);

  return { isJoined, toggleMembership, joinGroup };
}
