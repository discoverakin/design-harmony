-- ============================================================
-- Host dashboard tables (consolidated from host-hub repo)
-- Adds: categories, experiences (+ sessions, tiers), bookings,
--       payouts, sponsorship_requests, host_analytics, community_groups
--       (+ members, announcements, experiences join table), and the
--       experience-covers storage bucket.
--
-- Skipped from host-hub: profiles (M1 — DH has its own), stripe_account_id
-- ALTER (handled separately), drop FK constraint (M7 — demo hack), and
-- public/anon RLS policies (M8 — security risk).
-- ============================================================

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_authenticated" ON public.categories;
CREATE POLICY "categories_select_authenticated" ON public.categories
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.categories (name, slug) VALUES
  ('Yoga', 'yoga'),
  ('Painting', 'painting'),
  ('Cooking', 'cooking'),
  ('Photography', 'photography'),
  ('Dance', 'dance'),
  ('Music', 'music'),
  ('Fitness', 'fitness'),
  ('Crafts', 'crafts'),
  ('Meditation', 'meditation'),
  ('Outdoor Adventure', 'outdoor-adventure')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- updated_at helper (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- Experiences (host listings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.experiences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             uuid NOT NULL,
  title               text NOT NULL,
  description         text,
  category            text,
  cover_image_url     text,
  pricing_type        text NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'tiered')),
  price               numeric(10,2),
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  schedule_type       text CHECK (schedule_type IN ('one_time', 'recurring')),
  frequency           text CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'custom')),
  days_of_week        integer[],
  time_of_day         time,
  start_date          date,
  end_date            date,
  ongoing             boolean DEFAULT false,
  max_seats           integer,
  waitlist_enabled    boolean DEFAULT false,
  waitlist_mode       text CHECK (waitlist_mode IN ('auto', 'manual')),
  cancellation_hours  integer DEFAULT 24,
  refund_policy       text DEFAULT 'full' CHECK (refund_policy IN ('full', 'partial', 'none')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experiences_select_own" ON public.experiences;
CREATE POLICY "experiences_select_own" ON public.experiences
  FOR SELECT TO authenticated USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "experiences_insert_own" ON public.experiences;
CREATE POLICY "experiences_insert_own" ON public.experiences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "experiences_update_own" ON public.experiences;
CREATE POLICY "experiences_update_own" ON public.experiences
  FOR UPDATE TO authenticated USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "experiences_delete_own" ON public.experiences;
CREATE POLICY "experiences_delete_own" ON public.experiences
  FOR DELETE TO authenticated USING (auth.uid() = host_id);

DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Experience sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.experience_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id       uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz NOT NULL,
  capacity            integer,
  waitlist_enabled    boolean DEFAULT false,
  cancellation_hours  integer DEFAULT 24,
  refund_policy       text DEFAULT 'full' CHECK (refund_policy IN ('full', 'partial', 'none')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experience_sessions_owner_all" ON public.experience_sessions;
CREATE POLICY "experience_sessions_owner_all" ON public.experience_sessions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.experiences
    WHERE experiences.id = experience_sessions.experience_id
    AND experiences.host_id = auth.uid()
  ));

-- ============================================================
-- Experience tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.experience_tiers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id  uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  label          text NOT NULL,
  price          numeric(10,2) NOT NULL,
  seat_limit     integer,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experience_tiers_owner_all" ON public.experience_tiers;
CREATE POLICY "experience_tiers_owner_all" ON public.experience_tiers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.experiences
    WHERE experiences.id = experience_tiers.experience_id
    AND experiences.host_id = auth.uid()
  ));

-- ============================================================
-- Storage bucket for experience cover photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('experience-covers', 'experience-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "experience_covers_select_authenticated" ON storage.objects;
CREATE POLICY "experience_covers_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'experience-covers');

DROP POLICY IF EXISTS "experience_covers_insert_own" ON storage.objects;
CREATE POLICY "experience_covers_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'experience-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "experience_covers_update_own" ON storage.objects;
CREATE POLICY "experience_covers_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'experience-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "experience_covers_delete_own" ON storage.objects;
CREATE POLICY "experience_covers_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'experience-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id   uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  session_id      uuid REFERENCES public.experience_sessions(id) ON DELETE SET NULL,
  user_id         uuid,
  attendee_name   text,
  amount_paid     numeric NOT NULL DEFAULT 0,
  platform_fee   numeric NOT NULL DEFAULT 0,
  net_amount      numeric NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_host" ON public.bookings;
CREATE POLICY "bookings_select_host" ON public.bookings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.experiences
    WHERE experiences.id = bookings.experience_id
    AND experiences.host_id = auth.uid()
  ));

DROP POLICY IF EXISTS "bookings_select_own" ON public.bookings;
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Payouts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             uuid NOT NULL,
  stripe_transfer_id  text,
  amount              numeric NOT NULL DEFAULT 0,
  fee                 numeric NOT NULL DEFAULT 0,
  status              text NOT NULL DEFAULT 'pending',
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payouts_select_own" ON public.payouts;
CREATE POLICY "payouts_select_own" ON public.payouts
  FOR SELECT TO authenticated USING (auth.uid() = host_id);

-- ============================================================
-- Sponsorship requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id               uuid NOT NULL,
  concept               text NOT NULL,
  expected_attendance   integer NOT NULL DEFAULT 0,
  amount                numeric NOT NULL DEFAULT 0,
  category              text NOT NULL DEFAULT 'other',
  sponsor_email         text NOT NULL,
  stripe_payment_link   text,
  status                text NOT NULL DEFAULT 'pending',
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sponsorship_requests_select_own" ON public.sponsorship_requests;
CREATE POLICY "sponsorship_requests_select_own" ON public.sponsorship_requests
  FOR SELECT TO authenticated USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "sponsorship_requests_insert_own" ON public.sponsorship_requests;
CREATE POLICY "sponsorship_requests_insert_own" ON public.sponsorship_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

-- ============================================================
-- Host analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.host_analytics (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id        uuid NOT NULL,
  experience_id  uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  event_type     text NOT NULL DEFAULT 'view',
  session_id     uuid REFERENCES public.experience_sessions(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- M6: event_source column
ALTER TABLE public.host_analytics ADD COLUMN IF NOT EXISTS event_source text DEFAULT 'direct';

ALTER TABLE public.host_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "host_analytics_select_own" ON public.host_analytics;
CREATE POLICY "host_analytics_select_own" ON public.host_analytics
  FOR SELECT TO authenticated USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "host_analytics_insert_authenticated" ON public.host_analytics;
CREATE POLICY "host_analytics_insert_authenticated" ON public.host_analytics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_host_analytics_host_event
  ON public.host_analytics (host_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_host_analytics_experience
  ON public.host_analytics (experience_id, created_at);

-- ============================================================
-- Community groups (host-managed, distinct from DH's `groups`/`group_memberships`)
-- NOTE: DH already has consumer-facing `groups`/`group_memberships`/`group_events`
-- from migration 004. The host-hub tables below serve a different purpose
-- (host moderation queues, announcements, linked experiences) and live
-- alongside the existing tables under different names.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id         uuid NOT NULL,
  name            text NOT NULL,
  description     text,
  moderator_ids   uuid[] DEFAULT '{}',
  member_count    integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_groups_select_authenticated" ON public.community_groups;
CREATE POLICY "community_groups_select_authenticated" ON public.community_groups
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "community_groups_insert_own" ON public.community_groups;
CREATE POLICY "community_groups_insert_own" ON public.community_groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "community_groups_update_owner_or_mod" ON public.community_groups;
CREATE POLICY "community_groups_update_owner_or_mod" ON public.community_groups
  FOR UPDATE TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = ANY(moderator_ids));

DROP POLICY IF EXISTS "community_groups_delete_own" ON public.community_groups;
CREATE POLICY "community_groups_delete_own" ON public.community_groups
  FOR DELETE TO authenticated USING (auth.uid() = host_id);

DROP TRIGGER IF EXISTS update_community_groups_updated_at ON public.community_groups;
CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Group members (host-hub style with status/moderation, distinct from DH's `group_memberships`)
CREATE TABLE IF NOT EXISTS public.group_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  display_name  text,
  status        text NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_members_select_owner_or_mod" ON public.group_members;
CREATE POLICY "group_members_select_owner_or_mod" ON public.group_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_members.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

DROP POLICY IF EXISTS "group_members_select_own" ON public.group_members;
CREATE POLICY "group_members_select_own" ON public.group_members
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_members_insert_own" ON public.group_members;
CREATE POLICY "group_members_insert_own" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_members_update_owner_or_mod" ON public.group_members;
CREATE POLICY "group_members_update_owner_or_mod" ON public.group_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_members.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

DROP POLICY IF EXISTS "group_members_delete_owner_or_mod" ON public.group_members;
CREATE POLICY "group_members_delete_owner_or_mod" ON public.group_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_members.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

-- Group announcements
CREATE TABLE IF NOT EXISTS public.group_announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  host_id     uuid NOT NULL,
  message     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_announcements_select_owner_or_mod" ON public.group_announcements;
CREATE POLICY "group_announcements_select_owner_or_mod" ON public.group_announcements
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_announcements.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

DROP POLICY IF EXISTS "group_announcements_insert_host" ON public.group_announcements;
CREATE POLICY "group_announcements_insert_host" ON public.group_announcements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

-- Group experiences (join table)
CREATE TABLE IF NOT EXISTS public.group_experiences (
  group_id       uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  experience_id  uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, experience_id)
);

ALTER TABLE public.group_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_experiences_select_authenticated" ON public.group_experiences;
CREATE POLICY "group_experiences_select_authenticated" ON public.group_experiences
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "group_experiences_insert_owner_or_mod" ON public.group_experiences;
CREATE POLICY "group_experiences_insert_owner_or_mod" ON public.group_experiences
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_experiences.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

DROP POLICY IF EXISTS "group_experiences_delete_owner_or_mod" ON public.group_experiences;
CREATE POLICY "group_experiences_delete_owner_or_mod" ON public.group_experiences
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_groups g
    WHERE g.id = group_experiences.group_id
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.moderator_ids))
  ));

-- Trigger: keep community_groups.member_count in sync with approved members
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.community_groups SET member_count = (
      SELECT count(*) FROM public.group_members
      WHERE group_id = OLD.group_id AND status = 'approved'
    ) WHERE id = OLD.group_id;
    RETURN OLD;
  ELSE
    UPDATE public.community_groups SET member_count = (
      SELECT count(*) FROM public.group_members
      WHERE group_id = NEW.group_id AND status = 'approved'
    ) WHERE id = NEW.group_id;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_member_count ON public.group_members;
CREATE TRIGGER update_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();
