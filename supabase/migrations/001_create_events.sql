-- ============================================
-- Events schema for Akin hobby community app
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  date date not null,
  time text not null,
  location text not null,
  emoji text not null default '🎯',
  flyer_url text,
  external_link text,
  max_attendees integer,
  group_name text,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text not null default 'Anonymous',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- 2. RSVPs table
create table event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- 3. Saved events table
create table event_saves (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- 4. Attendance tracking table
create table event_attendances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- ============================================
-- Indexes
-- ============================================
create index idx_events_status_date on events(status, date);
create index idx_event_rsvps_event on event_rsvps(event_id);
create index idx_event_rsvps_user on event_rsvps(user_id);
create index idx_event_saves_user on event_saves(user_id);
create index idx_event_attendances_user on event_attendances(user_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table events enable row level security;
alter table event_rsvps enable row level security;
alter table event_saves enable row level security;
alter table event_attendances enable row level security;

-- Events: any authenticated user can read all events (app-level filtering handles visibility)
create policy "events_select" on events
  for select using (auth.role() = 'authenticated');

-- Events: any authenticated user can create
create policy "events_insert" on events
  for insert with check (auth.role() = 'authenticated');

-- Events: any authenticated user can update (admin approval in prototype)
create policy "events_update" on events
  for update using (auth.role() = 'authenticated');

-- Events: any authenticated user can delete (prototype)
create policy "events_delete" on events
  for delete using (auth.role() = 'authenticated');

-- RSVPs: viewable by all authenticated users (needed for counts)
create policy "rsvps_select" on event_rsvps
  for select using (auth.role() = 'authenticated');

create policy "rsvps_insert" on event_rsvps
  for insert with check (auth.uid() = user_id);

create policy "rsvps_delete" on event_rsvps
  for delete using (auth.uid() = user_id);

-- Saves: users can only see and manage their own
create policy "saves_select" on event_saves
  for select using (auth.uid() = user_id);

create policy "saves_insert" on event_saves
  for insert with check (auth.uid() = user_id);

create policy "saves_delete" on event_saves
  for delete using (auth.uid() = user_id);

-- Attendances: users can only see and manage their own
create policy "attendances_select" on event_attendances
  for select using (auth.uid() = user_id);

create policy "attendances_insert" on event_attendances
  for insert with check (auth.uid() = user_id);

create policy "attendances_delete" on event_attendances
  for delete using (auth.uid() = user_id);

-- ============================================
-- Seed data (default community events)
-- ============================================
insert into events (title, description, date, time, location, emoji, max_attendees, group_name, created_by_name, status, created_at) values
  ('Outdoor Sketch Walk',
   'Join fellow artists for a relaxing sketch walk through Central Park. Bring your sketchbook and favorite pencils — all skill levels welcome! We''ll stop at scenic spots and draw together.',
   '2026-02-14', '10:00 AM', 'Central Park, Main Entrance', '🎨', 30,
   'Weekend Painters', 'Weekend Painters', 'approved', '2026-01-28T10:00:00Z'),

  ('5K Morning Run',
   'Start your Sunday right with an energising 5K along the river trail. All paces welcome — we run together, not against each other. Coffee meetup after!',
   '2026-02-15', '7:30 AM', 'River Trail, South Gate', '🏃', 60,
   'City Runners Club', 'City Runners Club', 'approved', '2026-01-30T08:00:00Z'),

  ('Jazz Appreciation Night',
   'An evening of live jazz, vinyl listening, and great conversation. BYOV (Bring Your Own Vinyl) for the community turntable. Drinks available at the bar.',
   '2026-02-16', '7:00 PM', 'Blue Note Lounge', '🎵', 40,
   'Vinyl & Vibes', 'Vinyl & Vibes', 'approved', '2026-02-01T12:00:00Z'),

  ('Recipe Swap Potluck',
   'Bring a dish and its recipe to share! We''ll taste, trade, and learn from each other''s culinary traditions. Vegetarian and vegan options always appreciated.',
   '2026-02-18', '6:30 PM', 'Community Kitchen, 2nd Floor', '👨‍🍳', 25,
   'Home Chefs United', 'Home Chefs United', 'approved', '2026-02-02T14:00:00Z'),

  ('Board Game Marathon',
   'An afternoon of strategy, laughter, and friendly competition. We''ll have Catan, Codenames, Ticket to Ride, and more. Beginners always welcome!',
   '2026-02-20', '2:00 PM', 'The Game Den Café', '🎲', 20,
   'Tabletop Tribe', 'Tabletop Tribe', 'approved', '2026-02-03T09:00:00Z'),

  ('Sunrise Yoga in the Park',
   'Greet the morning with a gentle yoga flow outdoors. Mats provided, just bring yourself and an open mind. Perfect for de-stressing mid-week.',
   '2026-02-19', '6:30 AM', 'Riverside Meadow', '🧘', 35,
   'Flow Studio Community', 'Flow Studio Community', 'approved', '2026-02-04T07:00:00Z'),

  ('Street Photography Walk',
   'Explore the city through your lens. We''ll walk through downtown capturing candid moments and urban architecture.',
   '2026-02-22', '3:00 PM', 'Downtown Arts District', '📸', null,
   null, 'Alex W.', 'pending', '2026-02-05T16:00:00Z'),

  ('Beginner Salsa Night',
   'Never danced salsa before? This is your night! Professional instructors will guide you through basic steps. No partner needed.',
   '2026-02-23', '8:00 PM', 'Rhythm & Motion Studio', '💃', null,
   null, 'Dance Community', 'pending', '2026-02-06T11:00:00Z');
