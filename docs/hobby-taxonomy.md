# Hobby taxonomy reconciliation (deferred)

**Status:** not started. Deferred deliberately on 2026-08-25 while fixing the
search-scope bug. Nothing here blocks search; it blocks browsing.

## The problem

The code knows 7 hobbies. The database uses 37, of which the code's 7 are a
minority slice.

`src/data/hobbies.ts` and the `api/search.ts` / `api/quiz.ts` prompts all agree
on: `cooking, arts-crafts, pottery, knitting, coding, dance, music`. Those seven
account for **138 of 309 events (45%)**. The other **168 events (54%)** use 29
slugs that exist nowhere in code, plus 1 on `photography` (a legacy slug from
migration 005) and 3 with no slug at all.

Full count, 2026-08-25:

**Known to the code (138 events):** knitting 32, cooking 31, pottery 25,
dance 21, arts-crafts 19, coding 7, music 3.

**Not known to the code (168 events):** baking 30, drawing 17, 3d-printing 15,
painting 13, sewing 11, printmaking 8, wine-tasting 8, electronics 6, crochet 6,
maker-space 5, quilting 5, stained-glass 5, chocolate-making 4, ceramics 4,
candle-making 4, improv 4, fiber-arts 3, filmmaking 2, jewelry-making 2,
makerspace 2, glasswork 2, singing 2, acting 2, pastry 2, theatre 1, robotics 1,
cocktail-making 1, floral-design 1, sculpture 1.

**Neither:** photography 1 (assigned by migration 005, absent from `hobbies.ts`),
and 3 events with a null slug.

## What this currently breaks

- **`/hobby/:slug` 404s for 169 of 309 events (55%).** Hobby browse works for
  the 138 on canonical slugs and fails for the rest. This is the real cost, and
  it is a browsing problem, not a search one.
- **The quiz can only ever recommend 7 hobbies**, none of which match a real
  listing's slug.
- **The search results badge** (`HOBBY_EMOJI` in `src/pages/Search.tsx`) falls
  back to ✨ for every live slug.

## What is currently patching it

`HOBBY_SLUG_ALIASES` in `api/search.ts` maps each canonical slug onto the live
slugs that mean the same thing (`cooking` → `baking`, `pastry`, …). Without it
the hobby and mood paths reached only the 138 canonical-slug events — a query
for pottery missed every `ceramics` class, and "something relaxing" missed
`crochet`, `quilting` and `fiber-arts` entirely. With it they reach ~306.

It covers all 29 slugs as of 2026-08-25. It is a patch with two known limits:

1. Only `api/search.ts` consults it. Hobby pages, the quiz, and the badge do not.
2. It is hand-maintained. A new slug appearing in the data will not be in the
   map, and nothing will fail — those events just silently stop being routed by
   hobby. If the vocabulary keeps growing, add a test that reads the distinct
   slugs from the database and fails on one that is missing from the map.

Migrations 013 and 014 backfill `events.search_terms` per slug, so keyword
search reaches these events regardless of how the taxonomy is resolved.

## The work, when it is picked up

1. **Decide the canonical list.** Either promote the live vocabulary to first
   class (~30 hobbies, needs an emoji, colour, description, tags and benefits
   each in `hobbies.ts`) or collapse it into a smaller set of categories with
   the current slugs as sub-tags. The second is less content work and keeps the
   quiz tractable.
2. **Merge the near-duplicates first** — this is data cleanup and can happen
   independently: `maker-space` / `makerspace`, `ceramics` / `pottery`,
   `glasswork` / `stained-glass`, and `theatre` / `acting` / `improv`.
3. **Migrate `events.hobby_slug`** onto whatever the decision in (1) produces.
   Note migration 005 also assigned `fitness`, `yoga`, `photography`, `gaming`
   to seed events — same class of drift, already documented in CLAUDE.md.
4. **Update the three places that hard-code the seven**: `hobbies.ts`, the
   `hobby_slug` enum in `api/search.ts`'s system prompt, and the hobby list in
   `api/quiz.ts`'s system prompt. `MOOD_TO_HOBBIES` in `api/search.ts` needs to
   name whatever the new canonical slugs are.
5. **Retire `HOBBY_SLUG_ALIASES`** once the data and code agree.
6. **Fix `src/test/hobbies-search.test.ts`.** It has been failing since before
   this work: it asserts 20+ hobbies including `yoga` and `martial-arts`, which
   suggests a wider taxonomy existed in code once and was reduced to seven. That
   test is evidence about intent — read it before deciding step 1.

## Open questions

- Was the 20+ taxonomy in `hobbies.ts` removed on purpose, or lost? The stale
  test and the 24-option emoji picker in `CreateEvent.tsx` both point at a
  larger set having existed.
- Where do `improv` / `acting` / `theatre` / `filmmaking` belong? They have no
  canonical home today; search reaches them through an internal
  `performing-arts` group that is deliberately absent from the prompt enum,
  because a slug Claude can return should have a hobby page behind it.
