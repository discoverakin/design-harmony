import { useState, useCallback, useEffect } from "react";
import {
  CommunityEvent,
  EventStatus,
  loadEvents,
  saveEvents,
  generateEventId,
} from "@/data/events";

export function useEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>(() => loadEvents());

  // Persist on every change
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const approvedEvents = events.filter((e) => e.status === "approved");
  const pendingEvents = events.filter((e) => e.status === "pending");
  const rejectedEvents = events.filter((e) => e.status === "rejected");

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const addEvent = useCallback(
    (event: Omit<CommunityEvent, "id" | "createdAt" | "attendees" | "attendedBy" | "savedBy" | "status">) => {
      const newEvent: CommunityEvent = {
        ...event,
        id: generateEventId(),
        createdAt: new Date().toISOString(),
        attendees: ["You"],
        attendedBy: [],
        savedBy: [],
        status: "approved",
      };
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    []
  );

  const updateEventStatus = useCallback(
    (id: string, status: EventStatus) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    },
    []
  );

  const toggleRSVP = useCallback(
    (id: string, userName = "You") => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const isAttending = e.attendees.includes(userName);
          return {
            ...e,
            attendees: isAttending
              ? e.attendees.filter((a) => a !== userName)
              : [...e.attendees, userName],
          };
        })
      );
    },
    []
  );

  const toggleSave = useCallback(
    (id: string, userName = "You") => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const isSaved = e.savedBy.includes(userName);
          return {
            ...e,
            savedBy: isSaved
              ? e.savedBy.filter((s) => s !== userName)
              : [...e.savedBy, userName],
          };
        })
      );
    },
    []
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const markAttended = useCallback(
    (id: string, userName = "You") => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const alreadyAttended = (e.attendedBy || []).includes(userName);
          if (alreadyAttended) return e;
          return {
            ...e,
            attendedBy: [...(e.attendedBy || []), userName],
          };
        })
      );
    },
    []
  );

  const unmarkAttended = useCallback(
    (id: string, userName = "You") => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          return {
            ...e,
            attendedBy: (e.attendedBy || []).filter((a) => a !== userName),
          };
        })
      );
    },
    []
  );

  return {
    events,
    approvedEvents,
    pendingEvents,
    rejectedEvents,
    getEvent,
    addEvent,
    updateEventStatus,
    toggleRSVP,
    toggleSave,
    deleteEvent,
    markAttended,
    unmarkAttended,
  };
}
