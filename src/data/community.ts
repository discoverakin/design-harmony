export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  members: number;
  bgColor: string;
  category: string;
  isJoined: boolean;
  description: string;
  meetingSchedule: string;
  location: string;
  coverImageUrl: string | null;
  recentPhotos: string[];
  rules: string[];
  createdBy: string | null;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  emoji: string;
  group: string;
  groupSlug: string;
  groupId: string;
}

export interface ActivityFeedItem {
  id: number;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  likes: number;
  badge?: string;
}

export const groups: CommunityGroup[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    name: "Weekend Painters",
    slug: "weekend-painters",
    emoji: "🎨",
    members: 48,
    bgColor: "hsl(18 100% 92%)",
    category: "Arts & Crafts",
    isJoined: false,
    description:
      "A welcoming group for hobbyist painters who love spending weekends creating art. All skill levels are welcome — from first-time brushstrokes to experienced artists looking for community.",
    meetingSchedule: "Every Saturday, 10 AM – 1 PM",
    location: "Central Park Pavilion",
    coverImageUrl: null,
    recentPhotos: [],
    rules: [
      "Be respectful and supportive of all skill levels",
      "Bring your own materials unless stated otherwise",
      "RSVP to events so we can plan supplies",
      "Share your work — we love seeing progress!",
    ],
    createdBy: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    name: "City Runners Club",
    slug: "city-runners",
    emoji: "🏃",
    members: 124,
    bgColor: "hsl(209 100% 95%)",
    category: "Sports",
    isJoined: false,
    description:
      "Whether you're training for a marathon or just want a casual morning jog, City Runners Club is your tribe. We run together 3× a week and celebrate every milestone.",
    meetingSchedule: "Mon / Wed / Fri, 6:30 AM",
    location: "River Trail Starting Point",
    coverImageUrl: null,
    recentPhotos: [],
    rules: [
      "Show up on time — we start together",
      "All paces welcome, no one gets left behind",
      "Wear reflective gear for early-morning runs",
      "Hydrate and have fun!",
    ],
    createdBy: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    name: "Vinyl & Vibes",
    slug: "vinyl-vibes",
    emoji: "🎵",
    members: 67,
    bgColor: "hsl(40 100% 93%)",
    category: "Music",
    isJoined: false,
    description:
      "A community of music lovers who appreciate the warmth of vinyl records. We host listening sessions, swap records, and discuss everything from jazz to indie rock.",
    meetingSchedule: "Every other Friday, 7 PM",
    location: "Blue Note Lounge",
    coverImageUrl: null,
    recentPhotos: [],
    rules: [
      "Handle records with care",
      "Respect everyone's taste — music is subjective",
      "Bring a record to share at listening nights",
      "No selling or trading without permission",
    ],
    createdBy: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    name: "Book Worms Society",
    slug: "book-worms",
    emoji: "📚",
    members: 89,
    bgColor: "hsl(270 100% 95%)",
    category: "Reading",
    isJoined: false,
    description:
      "Join fellow bookworms for monthly reads, lively discussions, and author spotlights. We rotate genres so there's always something new to explore.",
    meetingSchedule: "Last Sunday of each month, 4 PM",
    location: "Elm Street Library, Room B",
    coverImageUrl: null,
    recentPhotos: [],
    rules: [
      "Read (or attempt!) the monthly pick before meetups",
      "No spoilers outside of discussion threads",
      "Be open to genres outside your comfort zone",
      "Recommend freely — sharing is caring",
    ],
    createdBy: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    name: "Home Chefs United",
    slug: "home-chefs",
    emoji: "👨‍🍳",
    members: 156,
    bgColor: "hsl(120 100% 93%)",
    category: "Cooking",
    isJoined: false,
    description:
      "From weeknight dinners to weekend baking marathons, Home Chefs United brings together food enthusiasts who love cooking at home. Share recipes, swap tips, and eat well together.",
    meetingSchedule: "Wednesdays, 6:30 PM",
    location: "Community Kitchen, 2nd Floor",
    coverImageUrl: null,
    recentPhotos: [],
    rules: [
      "Label all allergens when sharing food",
      "Clean up after yourself",
      "Share your recipes — secret ingredients encouraged!",
      "Respect the kitchen space and equipment",
    ],
    createdBy: null,
  },
];

export const communityEvents: CommunityEvent[] = [
  {
    id: "00000000-0000-4000-b000-000000000001",
    title: "Outdoor Sketch Walk",
    date: "Sat, Feb 8",
    time: "10:00 AM",
    location: "Central Park",
    attendees: 22,
    emoji: "🎨",
    group: "Weekend Painters",
    groupSlug: "weekend-painters",
    groupId: "00000000-0000-4000-a000-000000000001",
  },
  {
    id: "00000000-0000-4000-b000-000000000002",
    title: "5K Morning Run",
    date: "Sun, Feb 9",
    time: "7:30 AM",
    location: "River Trail",
    attendees: 45,
    emoji: "🏃",
    group: "City Runners Club",
    groupSlug: "city-runners",
    groupId: "00000000-0000-4000-a000-000000000002",
  },
  {
    id: "00000000-0000-4000-b000-000000000003",
    title: "Jazz Appreciation Night",
    date: "Mon, Feb 10",
    time: "7:00 PM",
    location: "Blue Note Lounge",
    attendees: 31,
    emoji: "🎵",
    group: "Vinyl & Vibes",
    groupSlug: "vinyl-vibes",
    groupId: "00000000-0000-4000-a000-000000000003",
  },
  {
    id: "00000000-0000-4000-b000-000000000004",
    title: "Recipe Swap Potluck",
    date: "Wed, Feb 12",
    time: "6:30 PM",
    location: "Community Kitchen",
    attendees: 18,
    emoji: "👨‍🍳",
    group: "Home Chefs United",
    groupSlug: "home-chefs",
    groupId: "00000000-0000-4000-a000-000000000005",
  },
];

export const activityFeed: ActivityFeedItem[] = [
  {
    id: 1,
    user: "Sarah K.",
    avatar: "🧑‍🎨",
    action: "completed a session",
    target: "Watercolour Basics",
    time: "2h ago",
    likes: 5,
  },
  {
    id: 2,
    user: "James T.",
    avatar: "🏃‍♂️",
    action: "earned a badge",
    target: "10K Milestone",
    time: "4h ago",
    likes: 12,
    badge: "🏅",
  },
  {
    id: 3,
    user: "Maria L.",
    avatar: "👩‍🍳",
    action: "shared a recipe",
    target: "Homemade Pasta Dough",
    time: "5h ago",
    likes: 8,
  },
  {
    id: 4,
    user: "David R.",
    avatar: "🎸",
    action: "joined",
    target: "Vinyl & Vibes",
    time: "8h ago",
    likes: 3,
  },
  {
    id: 5,
    user: "Aisha M.",
    avatar: "📖",
    action: "reviewed",
    target: "The Alchemist",
    time: "1d ago",
    likes: 15,
  },
];

export const groupMembers = [
  { name: "Alex P.", emoji: "😊", role: "Organiser" },
  { name: "Sarah K.", emoji: "🧑‍🎨", role: "Member" },
  { name: "Jordan W.", emoji: "🎯", role: "Member" },
  { name: "Casey L.", emoji: "✨", role: "Member" },
  { name: "Riley M.", emoji: "🌟", role: "Member" },
  { name: "Jamie T.", emoji: "🎭", role: "Member" },
];
