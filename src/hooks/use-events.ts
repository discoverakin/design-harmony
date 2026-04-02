import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import type { CommunityEvent, DbEvent, EventStatus } from "@/data/events";
import { stripePromise } from "@/lib/stripe";

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch all events + enrich with per-user flags ── */
  const refresh = useCallback(async () => {
    if (!user) return;

    const [eventsRes, rsvpsRes, myRsvpsRes, mySavesRes, myAttRes, myPaymentsRes] =
      await Promise.all([
        supabase.from("events").select("*").order("date"),
        supabase.from("event_rsvps").select("event_id"),
        supabase.from("event_rsvps").select("event_id").eq("user_id", user.id),
        supabase.from("event_saves").select("event_id").eq("user_id", user.id),
        supabase
          .from("event_attendances")
          .select("event_id, duration_minutes")
          .eq("user_id", user.id),
        supabase
          .from("event_payments")
          .select("event_id")
          .eq("user_id", user.id)
          .in("status", ["completed", "pending"]),
      ]);

    // Build lookup structures
    const rsvpCounts = new Map<string, number>();
    (rsvpsRes.data ?? []).forEach((r) => {
      rsvpCounts.set(r.event_id, (rsvpCounts.get(r.event_id) ?? 0) + 1);
    });
    const myRsvpIds = new Set((myRsvpsRes.data ?? []).map((r) => r.event_id));
    const mySaveIds = new Set((mySavesRes.data ?? []).map((s) => s.event_id));
    const myAttMap = new Map(
      (myAttRes.data ?? []).map((a) => [a.event_id, a.duration_minutes as number])
    );
    const myPaidIds = new Set((myPaymentsRes.data ?? []).map((p) => p.event_id));

    console.log("[useEvents] raw Supabase events:", eventsRes.data, "| error:", eventsRes.error);

    const enriched: CommunityEvent[] = (
      (eventsRes.data ?? []) as DbEvent[]
    ).map((evt) => {
      const rsvpCount = rsvpCounts.get(evt.id) ?? 0;
      const isAttending = myRsvpIds.has(evt.id);
      const hasPaid = myPaidIds.has(evt.id);
      // If user paid but RSVP row hasn't been created yet (webhook delay), count them
      const paidButNotCounted = hasPaid && !isAttending;
      return {
        ...evt,
        rsvp_count: rsvpCount + (paidButNotCounted ? 1 : 0),
        is_attending: isAttending || hasPaid,
        is_saved: mySaveIds.has(evt.id),
        has_attended: myAttMap.has(evt.id),
        attendance_minutes: myAttMap.get(evt.id) ?? null,
        has_paid: hasPaid,
      };
    });

    setEvents(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ── Derived lists ── */
  const approvedEvents = events.filter((e) => e.status === "approved");
  const pendingEvents = events.filter((e) => e.status === "pending");
  const rejectedEvents = events.filter((e) => e.status === "rejected");

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const getEventsByHobby = useCallback(
    (hobbySlug: string) => {
      const today = new Date().toISOString().split("T")[0];
      if (approvedEvents.length > 0) {
        console.log("[useEvents] first event full shape:", JSON.stringify(approvedEvents[0], null, 2));
      }
      const allSlugs = approvedEvents.map((e) => `${e.title}: hobby_slug=${JSON.stringify(e.hobby_slug)} (type=${typeof e.hobby_slug})`);
      console.log("[useEvents] getEventsByHobby called with:", JSON.stringify(hobbySlug), "| today:", today, "| approvedEvents count:", approvedEvents.length);
      console.log("[useEvents] all hobby_slugs:", allSlugs);
      const filtered = approvedEvents.filter(
        (e) => e.hobby_slug === hobbySlug
      );
      console.log("[useEvents] filtered result count:", filtered.length, filtered.map((e) => e.title));
      return filtered;
    },
    [approvedEvents]
  );

  /* ── Mutations (optimistic + persist) ── */

  const addEvent = useCallback(
    async (input: {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      emoji: string;
      flyer_url?: string;
      external_link?: string;
      max_attendees?: number;
      group_name?: string;
      created_by_name: string;
      price_cents?: number;
    }) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("events")
        .insert({
          ...input,
          created_by: user.id,
          status: "pending" as const,
        })
        .select()
        .single();

      if (error || !data) return null;

      const newEvent: CommunityEvent = {
        ...(data as DbEvent),
        rsvp_count: 0,
        is_attending: false,
        is_saved: false,
        has_attended: false,
        attendance_minutes: null,
        has_paid: false,
      };
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    [user]
  );

  const updateEventStatus = useCallback(
    async (id: string, status: EventStatus) => {
      await supabase.from("events").update({ status }).eq("id", id);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    },
    []
  );

  const deleteEvent = useCallback(async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleRSVP = useCallback(
    async (eventId: string) => {
      if (!user) return;
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (event.is_attending) {
        await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, is_attending: false, rsvp_count: e.rsvp_count - 1 }
              : e
          )
        );
      } else {
        await supabase
          .from("event_rsvps")
          .insert({ event_id: eventId, user_id: user.id });
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, is_attending: true, rsvp_count: e.rsvp_count + 1 }
              : e
          )
        );
      }
    },
    [user, events]
  );

  const toggleSave = useCallback(
    async (eventId: string) => {
      if (!user) return;
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (event.is_saved) {
        await supabase
          .from("event_saves")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, is_saved: false } : e
          )
        );
      } else {
        await supabase
          .from("event_saves")
          .insert({ event_id: eventId, user_id: user.id });
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, is_saved: true } : e
          )
        );
      }
    },
    [user, events]
  );

  const markAttended = useCallback(
    async (eventId: string, durationMinutes: number) => {
      if (!user) return;
      await supabase
        .from("event_attendances")
        .insert({
          event_id: eventId,
          user_id: user.id,
          duration_minutes: durationMinutes,
        });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                has_attended: true,
                attendance_minutes: durationMinutes,
              }
            : e
        )
      );
    },
    [user]
  );

  const unmarkAttended = useCallback(
    async (eventId: string) => {
      if (!user) return;
      await supabase
        .from("event_attendances")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, has_attended: false, attendance_minutes: null }
            : e
        )
      );
    },
    [user]
  );

  const initiatePayment = useCallback(
    async (eventId: string) => {
      if (!user) return;
      const event = events.find((e) => e.id === eventId);
      if (!event || event.price_cents <= 0) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      console.log("[initiatePayment] full token:", token);
      console.log("[initiatePayment] apikey:", supabaseAnonKey);

      const res = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            event_id: eventId,
          }),
        }
      );

      if (!res.ok) return null;
      const { clientSecret } = await res.json();
      return clientSecret as string | null;
    },
    [user, events]
  );

  return {
    events,
    loading,
    approvedEvents,
    pendingEvents,
    rejectedEvents,
    getEvent,
    getEventsByHobby,
    addEvent,
    updateEventStatus,
    toggleRSVP,
    toggleSave,
    deleteEvent,
    markAttended,
    unmarkAttended,
    initiatePayment,
    refresh,
  };
}
