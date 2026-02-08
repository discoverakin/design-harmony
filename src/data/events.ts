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
  status: EventStatus;
  created_at: string;
}

/** Enriched event with per-user interaction flags */
export interface CommunityEvent extends DbEvent {
  rsvp_count: number;
  is_attending: boolean;
  is_saved: boolean;
  has_attended: boolean;
  attendance_minutes: number | null;
  has_paid: boolean;
}
