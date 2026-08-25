-- ============================================
-- Backfill events.search_terms from hobby_slug
-- Run this in the Supabase SQL Editor, after 012
--
-- WHY
-- Migration 012's seed terms match events by title, so they only apply to the
-- events created by migrations 001/005. On a database whose events came from
-- anywhere else those updates matched nothing and search_terms stayed empty,
-- which makes the column inert.
--
-- This seeds every event from its hobby instead: a pottery class becomes
-- findable by "clay", "kiln", "glazing" without anyone typing those in. It is
-- coarse by design — one vocabulary per hobby, not per class. Hosts refine it
-- per event via the "Search Keywords" field on Create Event.
--
-- Only fills events whose search_terms is still empty, so re-running it is safe
-- and it never clobbers a host's own keywords.
--
-- The slugs below include `fitness`, `yoga`, `photography` and `gaming`, which
-- migration 005 assigned to events but which exist nowhere in the app's hobby
-- taxonomy (see "Two disagreeing hobby taxonomies" in CLAUDE.md). Keywords are
-- currently the only way those events surface at all.
--
-- Terms are single lowercase words on purpose: array matching is exact per
-- element, so "fiber arts" is only found by that exact phrase while "fiber" and
-- "arts" are each matchable.
-- ============================================

with hobby_terms(slug, terms) as (
  values
    ('cooking',     '{baking,cuisine,recipe,chef,food,meal,prep,grilling,pastry,fermentation,kitchen}'::text[]),
    ('arts-crafts', '{painting,drawing,sculpture,watercolor,acrylic,creative,handmade,diy,craft,art}'::text[]),
    ('pottery',     '{clay,wheel,throwing,sculpting,glazing,kiln,ceramics,handbuilding,earthenware,stoneware}'::text[]),
    ('knitting',    '{yarn,wool,sewing,embroidery,textile,fiber,needlework,weaving,macrame,handcraft,quilting}'::text[]),
    ('coding',      '{programming,web,development,app,python,javascript,software,robotics,ai,data,tech}'::text[]),
    ('dance',       '{salsa,hiphop,ballet,contemporary,latin,swing,ballroom,choreography,movement,dancing}'::text[]),
    ('music',       '{guitar,piano,drums,singing,instrument,band,production,songwriting,ukulele,vocals}'::text[]),
    -- legacy slugs from migration 005, unmatched by the app's taxonomy
    ('fitness',     '{running,run,cardio,workout,exercise,training,endurance,trail,strength}'::text[]),
    ('yoga',        '{stretching,meditation,mindfulness,breathwork,vinyasa,wellness,flow,relaxation}'::text[]),
    ('photography', '{photo,camera,lens,portrait,street,composition,editing,darkroom}'::text[]),
    ('gaming',      '{boardgames,tabletop,strategy,cards,dice,videogames,tournament,puzzle}'::text[])
)
update events e
set search_terms = h.terms
from hobby_terms h
where e.hobby_slug = h.slug
  and coalesce(cardinality(e.search_terms), 0) = 0;
