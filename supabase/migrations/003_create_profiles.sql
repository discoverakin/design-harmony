-- ============================================
-- Profiles table for Akin hobby community app
-- Run this in the Supabase SQL Editor
-- ============================================

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  handle text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_profiles_user_id on profiles(user_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;

-- Profiles are readable by all authenticated users (needed for community features)
create policy "profiles_select" on profiles
  for select using (auth.role() = 'authenticated');

-- Users can only insert their own profile
create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = user_id);

-- Users can only update their own profile
create policy "profiles_update" on profiles
  for update using (auth.uid() = user_id);

-- ============================================
-- Auto-update updated_at on row change
-- ============================================
create or replace function update_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_profiles_updated_at();
