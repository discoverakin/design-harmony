-- ============================================
-- Associated search terms for events
-- Run this in the Supabase SQL Editor
--
-- Numbered 012, not 011: migration 011 is already claimed by the parked
-- fix/privacy-preserving-handles branch (see "Known issues" in CLAUDE.md).
--
-- WHY
-- Search matched on `title` alone, so a class only surfaced when the query
-- words were in its title — a search for "yarn" missed a felting workshop, and
-- "free" only worked when the word happened to be in the title. api/search.ts
-- now matches across title, description, location, group_name and hobby_slug,
-- and this column adds the piece the record itself cannot carry: the adjacent
-- language a seeker actually types. Tag a felting workshop with "yarn" and
-- "wool" and it becomes findable by people who don't know the word "felting".
--
-- api/search.ts degrades gracefully if this migration has not been run — it
-- detects the missing column once per instance and drops the condition — so
-- search keeps working either way, just without curated synonyms.
-- ============================================

alter table events add column if not exists search_terms text[] not null default '{}';

comment on column events.search_terms is
  'Lowercase single-word synonyms and adjacent terms for search. Prefer single '
  'words: matching is exact per array element, so "fiber arts" is only found by '
  'that exact phrase, while "fiber" and "arts" are each matchable.';

-- Array containment (`search_terms @> '{yarn}'`)
create index if not exists idx_events_search_terms on events using gin (search_terms);

-- ============================================
-- Trigram indexes so the ILIKE '%term%' scans stay cheap as the table grows.
-- Optional: if pg_trgm is unavailable, skip this block — the queries still work,
-- they just fall back to sequential scans.
-- ============================================
create extension if not exists pg_trgm;

create index if not exists idx_events_title_trgm       on events using gin (title gin_trgm_ops);
create index if not exists idx_events_description_trgm on events using gin (description gin_trgm_ops);
create index if not exists idx_events_location_trgm    on events using gin (location gin_trgm_ops);
create index if not exists idx_events_group_name_trgm  on events using gin (group_name gin_trgm_ops);

-- ============================================
-- Seed terms for the events created in migrations 001 / 005
-- ============================================
update events set search_terms = '{sketch,drawing,pencil,illustration,outdoor,walk,art}'
  where title = 'Outdoor Sketch Walk';

update events set search_terms = '{running,run,5k,jog,cardio,fitness,trail,morning}'
  where title = '5K Morning Run';

update events set search_terms = '{jazz,vinyl,records,listening,live,music,evening}'
  where title = 'Jazz Appreciation Night';

update events set search_terms = '{potluck,recipe,cooking,food,dish,swap,vegetarian,vegan}'
  where title = 'Recipe Swap Potluck';

update events set search_terms = '{boardgames,tabletop,catan,codenames,strategy,gaming}'
  where title = 'Board Game Marathon';

update events set search_terms = '{yoga,stretching,meditation,mindfulness,sunrise,outdoor,wellness}'
  where title = 'Sunrise Yoga in the Park';

update events set search_terms = '{photography,photo,camera,street,candid,architecture,downtown}'
  where title = 'Street Photography Walk';

update events set search_terms = '{salsa,dancing,latin,partner,beginner,social}'
  where title = 'Beginner Salsa Night';
