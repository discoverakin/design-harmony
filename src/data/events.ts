import type { HobbyCategory } from "./hobbies";

export type EventStatus = "pending" | "approved" | "rejected";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  emoji: string;
  hobbyCategory: HobbyCategory;
  flyerUrl?: string; // URL to flyer image or Instagram link
  externalLink?: string; // e.g. Instagram post link
  flyerBase64?: string; // uploaded flyer stored as base64
  attendees: string[]; // list of user IDs / names who RSVP'd
  savedBy: string[]; // list of user IDs / names who saved
  createdBy: string;
  status: EventStatus;
  createdAt: string;
  maxAttendees?: number;
  group?: string;
}

const STORAGE_KEY = "akin-events";

export const defaultEvents: CommunityEvent[] = [
  {
    id: "evt-1",
    title: "Outdoor Sketch Walk",
    description:
      "Join fellow artists for a relaxing sketch walk through Central Park. Bring your sketchbook and favorite pencils — all skill levels welcome! We'll stop at scenic spots and draw together.",
    date: "2026-02-14",
    time: "10:00 AM",
    location: "Central Park, Main Entrance",
    emoji: "🎨",
    hobbyCategory: "Creative",
    attendees: ["You", "Sarah K.", "Liam P."],
    savedBy: [],
    createdBy: "Weekend Painters",
    status: "approved",
    createdAt: "2026-01-28T10:00:00Z",
    maxAttendees: 30,
    group: "Weekend Painters",
  },
  {
    id: "evt-2",
    title: "5K Morning Run",
    description:
      "Start your Sunday right with an energising 5K along the river trail. All paces welcome — we run together, not against each other. Coffee meetup after!",
    date: "2026-02-15",
    time: "7:30 AM",
    location: "River Trail, South Gate",
    emoji: "🏃",
    hobbyCategory: "Active",
    attendees: ["You", "James T.", "Nina R.", "Carlos M."],
    savedBy: ["You"],
    createdBy: "City Runners Club",
    status: "approved",
    createdAt: "2026-01-30T08:00:00Z",
    maxAttendees: 60,
    group: "City Runners Club",
  },
  {
    id: "evt-3",
    title: "Jazz Appreciation Night",
    description:
      "An evening of live jazz, vinyl listening, and great conversation. BYOV (Bring Your Own Vinyl) for the community turntable. Drinks available at the bar.",
    date: "2026-02-16",
    time: "7:00 PM",
    location: "Blue Note Lounge",
    emoji: "🎵",
    hobbyCategory: "Creative",
    attendees: ["Maria L.", "David R."],
    savedBy: [],
    createdBy: "Vinyl & Vibes",
    status: "approved",
    createdAt: "2026-02-01T12:00:00Z",
    maxAttendees: 40,
    group: "Vinyl & Vibes",
  },
  {
    id: "evt-4",
    title: "Recipe Swap Potluck",
    description:
      "Bring a dish and its recipe to share! We'll taste, trade, and learn from each other's culinary traditions. Vegetarian and vegan options always appreciated.",
    date: "2026-02-18",
    time: "6:30 PM",
    location: "Community Kitchen, 2nd Floor",
    emoji: "👨‍🍳",
    hobbyCategory: "Social",
    attendees: ["Aisha M."],
    savedBy: ["You"],
    createdBy: "Home Chefs United",
    status: "approved",
    createdAt: "2026-02-02T14:00:00Z",
    maxAttendees: 25,
    group: "Home Chefs United",
  },
  {
    id: "evt-5",
    title: "Board Game Marathon",
    description:
      "An afternoon of strategy, laughter, and friendly competition. We'll have Catan, Codenames, Ticket to Ride, and more. Beginners always welcome!",
    date: "2026-02-20",
    time: "2:00 PM",
    location: "The Game Den Café",
    emoji: "🎲",
    hobbyCategory: "Social",
    attendees: [],
    savedBy: [],
    createdBy: "Tabletop Tribe",
    status: "approved",
    createdAt: "2026-02-03T09:00:00Z",
    maxAttendees: 20,
    group: "Tabletop Tribe",
  },
  {
    id: "evt-6",
    title: "Sunrise Yoga in the Park",
    description:
      "Greet the morning with a gentle yoga flow outdoors. Mats provided, just bring yourself and an open mind. Perfect for de-stressing mid-week.",
    date: "2026-02-19",
    time: "6:30 AM",
    location: "Riverside Meadow",
    emoji: "🧘",
    hobbyCategory: "Active",
    attendees: ["Sarah K."],
    savedBy: [],
    createdBy: "Flow Studio Community",
    status: "approved",
    createdAt: "2026-02-04T07:00:00Z",
    maxAttendees: 35,
    group: "Flow Studio Community",
  },
  // Pending events for admin review
  {
    id: "evt-pending-1",
    title: "Street Photography Walk",
    description:
      "Explore the city through your lens. We'll walk through downtown capturing candid moments and urban architecture.",
    date: "2026-02-22",
    time: "3:00 PM",
    location: "Downtown Arts District",
    emoji: "📸",
    hobbyCategory: "Creative",
    attendees: [],
    savedBy: [],
    createdBy: "Alex W.",
    status: "pending",
    createdAt: "2026-02-05T16:00:00Z",
    externalLink: "https://instagram.com/p/example",
  },
  {
    id: "evt-pending-2",
    title: "Beginner Salsa Night",
    description:
      "Never danced salsa before? This is your night! Professional instructors will guide you through basic steps. No partner needed.",
    date: "2026-02-23",
    time: "8:00 PM",
    location: "Rhythm & Motion Studio",
    emoji: "💃",
    hobbyCategory: "Active",
    attendees: [],
    savedBy: [],
    createdBy: "Dance Community",
    status: "pending",
    createdAt: "2026-02-06T11:00:00Z",
  },
];

export function loadEvents(): CommunityEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  // Seed with defaults on first load
  saveEvents(defaultEvents);
  return defaultEvents;
}

export function saveEvents(events: CommunityEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
