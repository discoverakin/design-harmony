-- ============================================
-- Community groups, memberships, and group events
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- Groups table
-- ============================================
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text not null default '🎨',
  description text not null default '',
  category text not null default 'Other',
  bg_color text not null default 'hsl(200 80% 93%)',
  meeting_schedule text not null default '',
  location text not null default '',
  cover_image_url text,
  rules text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_groups_slug on groups(slug);
create index idx_groups_category on groups(category);

-- ============================================
-- Group memberships table
-- ============================================
create table group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index idx_group_memberships_group on group_memberships(group_id);
create index idx_group_memberships_user on group_memberships(user_id);

-- ============================================
-- Group events table
-- ============================================
create table group_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  title text not null,
  description text not null default '',
  date text not null,
  time text not null default '',
  location text not null default '',
  emoji text not null default '📅',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_group_events_group on group_events(group_id);

-- ============================================
-- Materialised member count (fast reads)
-- ============================================
create or replace function group_member_count(g groups)
returns bigint
language sql stable
as $$
  select count(*) from group_memberships where group_id = g.id;
$$;

-- ============================================
-- Row Level Security
-- ============================================
alter table groups enable row level security;
alter table group_memberships enable row level security;
alter table group_events enable row level security;

-- Groups: anyone can read, authenticated users can create
create policy "groups_select" on groups
  for select using (true);

create policy "groups_insert" on groups
  for insert with check (auth.role() = 'authenticated');

-- Only the creator can update or delete their group
create policy "groups_update" on groups
  for update using (auth.uid() = created_by);

create policy "groups_delete" on groups
  for delete using (auth.uid() = created_by);

-- Memberships: anyone can read, authenticated users can join/leave
create policy "memberships_select" on group_memberships
  for select using (true);

create policy "memberships_insert" on group_memberships
  for insert with check (auth.uid() = user_id);

create policy "memberships_delete" on group_memberships
  for delete using (auth.uid() = user_id);

-- Group events: anyone can read, authenticated users can create
create policy "group_events_select" on group_events
  for select using (true);

create policy "group_events_insert" on group_events
  for insert with check (auth.role() = 'authenticated');

-- ============================================
-- Seed existing hardcoded groups
-- ============================================
insert into groups (id, name, slug, emoji, description, category, bg_color, meeting_schedule, location, rules, created_by) values
(
  '00000000-0000-4000-a000-000000000001',
  'Weekend Painters',
  'weekend-painters',
  '🎨',
  'A welcoming group for hobbyist painters who love spending weekends creating art. All skill levels are welcome — from first-time brushstrokes to experienced artists looking for community.',
  'Arts & Crafts',
  'hsl(18 100% 92%)',
  'Every Saturday, 10 AM – 1 PM',
  'Central Park Pavilion',
  ARRAY['Be respectful and supportive of all skill levels', 'Bring your own materials unless stated otherwise', 'RSVP to events so we can plan supplies', 'Share your work — we love seeing progress!'],
  null
),
(
  '00000000-0000-4000-a000-000000000002',
  'City Runners Club',
  'city-runners',
  '🏃',
  'Whether you''re training for a marathon or just want a casual morning jog, City Runners Club is your tribe. We run together 3× a week and celebrate every milestone.',
  'Sports',
  'hsl(209 100% 95%)',
  'Mon / Wed / Fri, 6:30 AM',
  'River Trail Starting Point',
  ARRAY['Show up on time — we start together', 'All paces welcome, no one gets left behind', 'Wear reflective gear for early-morning runs', 'Hydrate and have fun!'],
  null
),
(
  '00000000-0000-4000-a000-000000000003',
  'Vinyl & Vibes',
  'vinyl-vibes',
  '🎵',
  'A community of music lovers who appreciate the warmth of vinyl records. We host listening sessions, swap records, and discuss everything from jazz to indie rock.',
  'Music',
  'hsl(40 100% 93%)',
  'Every other Friday, 7 PM',
  'Blue Note Lounge',
  ARRAY['Handle records with care', 'Respect everyone''s taste — music is subjective', 'Bring a record to share at listening nights', 'No selling or trading without permission'],
  null
),
(
  '00000000-0000-4000-a000-000000000004',
  'Book Worms Society',
  'book-worms',
  '📚',
  'Join fellow bookworms for monthly reads, lively discussions, and author spotlights. We rotate genres so there''s always something new to explore.',
  'Reading',
  'hsl(270 100% 95%)',
  'Last Sunday of each month, 4 PM',
  'Elm Street Library, Room B',
  ARRAY['Read (or attempt!) the monthly pick before meetups', 'No spoilers outside of discussion threads', 'Be open to genres outside your comfort zone', 'Recommend freely — sharing is caring'],
  null
),
(
  '00000000-0000-4000-a000-000000000005',
  'Home Chefs United',
  'home-chefs',
  '👨‍🍳',
  'From weeknight dinners to weekend baking marathons, Home Chefs United brings together food enthusiasts who love cooking at home. Share recipes, swap tips, and eat well together.',
  'Cooking',
  'hsl(120 100% 93%)',
  'Wednesdays, 6:30 PM',
  'Community Kitchen, 2nd Floor',
  ARRAY['Label all allergens when sharing food', 'Clean up after yourself', 'Share your recipes — secret ingredients encouraged!', 'Respect the kitchen space and equipment'],
  null
);

-- Seed group events (from hardcoded communityEvents)
insert into group_events (id, group_id, title, date, time, location, emoji) values
(
  '00000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000001',
  'Outdoor Sketch Walk',
  'Sat, Feb 8',
  '10:00 AM',
  'Central Park',
  '🎨'
),
(
  '00000000-0000-4000-b000-000000000002',
  '00000000-0000-4000-a000-000000000002',
  '5K Morning Run',
  'Sun, Feb 9',
  '7:30 AM',
  'River Trail',
  '🏃'
),
(
  '00000000-0000-4000-b000-000000000003',
  '00000000-0000-4000-a000-000000000003',
  'Jazz Appreciation Night',
  'Mon, Feb 10',
  '7:00 PM',
  'Blue Note Lounge',
  '🎵'
),
(
  '00000000-0000-4000-b000-000000000004',
  '00000000-0000-4000-a000-000000000005',
  'Recipe Swap Potluck',
  'Wed, Feb 12',
  '6:30 PM',
  'Community Kitchen',
  '👨‍🍳'
);
