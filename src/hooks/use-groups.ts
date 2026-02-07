import { useState, useCallback } from "react";
import { groups as defaultGroups, type CommunityGroup } from "@/data/community";

const STORAGE_KEY = "akin-custom-groups";

function getStoredGroups(): CommunityGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveGroups(groups: CommunityGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

let nextId = 1000;

export function useGroups() {
  const [customGroups, setCustomGroups] = useState<CommunityGroup[]>(getStoredGroups);

  const allGroups = [...defaultGroups, ...customGroups];

  const addGroup = useCallback(
    (data: {
      name: string;
      emoji: string;
      category: string;
      description: string;
      meetingSchedule: string;
      location: string;
    }) => {
      const id = nextId++;
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newGroup: CommunityGroup = {
        id,
        slug,
        name: data.name,
        emoji: data.emoji,
        category: data.category,
        description: data.description,
        meetingSchedule: data.meetingSchedule,
        location: data.location,
        members: 1,
        bgColor: `hsl(${Math.floor(Math.random() * 360)} 80% 93%)`,
        isJoined: true,
        recentPhotos: [],
        rules: [],
      };

      setCustomGroups((prev) => {
        const next = [...prev, newGroup];
        saveGroups(next);
        return next;
      });

      return newGroup;
    },
    []
  );

  return { allGroups, addGroup };
}
