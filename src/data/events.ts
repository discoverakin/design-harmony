export type EventStatus = "pending" | "approved" | "rejected";

/** Row shape returned from the `events` table */
export interface DbEvent {
  id: string;
  title: string;
  description: string;
  date: string;          // YYYY-MM-DD
  time: string;
  location: string;
  emoji: string;
  flyer_url: string | null;
  external_link: string | null;
  max_attendees: number | null;
  group_name: string | null;
  created_by: string | null; // auth.users UUID — null for seed data
  created_by_name: string;
  price_cents: number;
  hobby_slug: string | null;
  /** Geocoded position. Added by hand in the dashboard — in no migration, and
   *  null on listings the scout could not place. */
  lat?: number | null;
  lng?: number | null;
  /** Curated synonyms used by search — see migration 012. */
  search_terms?: string[] | null;
  status: EventStatus;
  created_at: string;
}

/** Enriched event with per-user interaction flags. Saved state lives in
 *  `use-saved-events.tsx`, not here — see the note on `useEvents`. */
export interface CommunityEvent extends DbEvent {
  rsvp_count: number;
  is_attending: boolean;
  has_attended: boolean;
  attendance_minutes: number | null;
  has_paid: boolean;
}
