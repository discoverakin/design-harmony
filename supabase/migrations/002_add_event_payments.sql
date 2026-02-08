-- ============================================
-- Add payment support to events
-- ============================================

-- 1. Add price column to events (0 = free)
alter table events add column price_cents integer not null default 0;

-- 2. Event payments table
create table event_payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_session_id text not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- Indexes
create index idx_event_payments_event on event_payments(event_id);
create index idx_event_payments_user on event_payments(user_id);
create index idx_event_payments_session on event_payments(stripe_session_id);

-- RLS
alter table event_payments enable row level security;

-- Users can view their own payments
create policy "payments_select_own" on event_payments
  for select using (auth.uid() = user_id);

-- Authenticated users can view payment existence for any event (needed for badge display)
create policy "payments_select_all" on event_payments
  for select using (auth.role() = 'authenticated');

-- Only service_role (edge functions) should insert/update payments,
-- but for prototype we allow authenticated inserts
create policy "payments_insert" on event_payments
  for insert with check (auth.role() = 'authenticated');

create policy "payments_update" on event_payments
  for update using (auth.role() = 'authenticated');

-- ============================================
-- Update seed events with sample prices
-- ============================================
update events set price_cents = 50  where title = 'Outdoor Sketch Walk';
update events set price_cents = 99  where title = 'Jazz Appreciation Night';
update events set price_cents = 75  where title = 'Recipe Swap Potluck';
update events set price_cents = 0   where title = '5K Morning Run';
update events set price_cents = 0   where title = 'Board Game Marathon';
update events set price_cents = 50  where title = 'Sunrise Yoga in the Park';
update events set price_cents = 0   where title = 'Street Photography Walk';
update events set price_cents = 99  where title = 'Beginner Salsa Night';
