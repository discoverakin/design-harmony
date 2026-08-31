# Known issues

Audited 2026-08-14. Findings from a read-only audit. Verify before relying on any of them — and check the live Supabase schema rather than the migration files.

**Status as of 2026-08-29:** all still open except the search-scope and
proximity date-filter items below, which the full-record search change fixed.
Four PRs have merged since (signup password revalidation, the sign-in path to
account creation, the browse filters on `/events`, and save-from-card); none
touched anything below. The two entries added at the bottom — the broken
offline fallback and the red test suite — were found while building those and
are the two most likely to waste the next person's morning.

### Schema drift — migrations are NOT the source of truth
`profiles.user_type` and `events.lat`/`events.lng` are read and written by application code but **created by no migration** — they were added by hand in the Supabase dashboard. Assume `supabase/migrations/` is incomplete and verify against the real database.

### Authorization gaps
- **`/admin-events` has no admin check.** It's wrapped in `RequireAuth` only, and migration 001's RLS is `for update/delete using (auth.role() = 'authenticated')` — so **any logged-in user can approve, reject, or delete any event**, via the UI or directly. Most significant gap.
- **`event_payments` is user-writable.** Migration 002 admits it in a comment (*"for prototype we allow authenticated inserts"*); a user can insert a `completed` payment for themselves.
- **`user_type` is self-assigned** client-side with no server validation. Harmless while cosmetic; a problem the moment anything authorizes on it.
- **Anonymous browse contradicts RLS.** `groups` uses `for select using (true)` (genuinely public), but `events` requires `auth.role() = 'authenticated'` — yet `/events` is public and `useEvents` has an anon branch. Either anon visitors see zero events or the live policy was changed by hand.

### Dead code
The Stripe payment path is **fully built but disconnected**. `initiatePayment` (`use-events.ts`) and `components/EmbeddedCheckout.tsx` are complete and nothing imports either; commit `8101009 "replace Stripe checkout with external RSVP link"` removed the UI entry point. The edge functions and tables are solid. Confirm with the team whether this is coming back before deleting or debugging it.

### `api/search.ts` bugs
- ~~**Search only matched `title`.**~~ Fixed — matching now spans title, description, location, group name, hobby slug, and the `search_terms` array, with price and date parsed as their own filters. See "Search" under Architecture.
- ~~**The proximity branch drops the date filter.**~~ Fixed in the same change — the landmark branch now applies the date, price, and keyword filters in memory before returning.
- **The live hobby vocabulary is 37 slugs; the code knows 7.** Those 7 cover 138 of 309 events (45%); the other 168 use slugs that exist nowhere in code — `baking` (30 rows), `drawing` (17), `3d-printing` (15) and 26 more. So `/hobby/:slug` 404s for 55% of events, and the hobby/mood paths in search reached only the canonical 45% until `HOBBY_SLUG_ALIASES` (`api/search.ts`) started mapping canonical slugs onto live ones. Deferred deliberately — full write-up, counts, and the work required are in [hobby-taxonomy.md](hobby-taxonomy.md).
- **Distance math is elliptical.** Euclidean distance over raw lat/lng degrees treats them as equal, but at 42°N a longitude degree is ~74% as wide, so the 0.8-mi radius is wider east-west than north-south. Still open **here** — the client-side "within N miles" filter on `/events` uses a real great-circle distance (`src/lib/geo.ts`), so the two paths currently disagree about what "near" means. Porting `distanceMiles` into `api/search.ts` would settle it.
- **`time_of_day` is parsed and then ignored.** Claude returns "morning"/"afternoon"/"evening" and nothing consumes it; `events.time` is free text (`"10:00 AM"`), so filtering on it needs parsing first.

### Privacy: profile handles expose the email address
Default handles and display names are derived from the email local part
(`sue@gmail.com` → `@sue`), and the value is **persisted** in `profiles`.
Because `profiles_select` allows any authenticated user to read every row, and
`events.created_by_name` is rendered on the PUBLIC event page, the fragment
reaches anonymous visitors. Reported independently by two testers.

A complete fix is parked, unmerged, on the local branch
`fix/privacy-preserving-handles` (generated handles, all four derivation sites
removed, migration 011 with a commented backfill, 12 tests). Read that commit
message before starting over. Nothing from it has been applied to the database.

### Event data quality
Placeholder dates (`2099-01-01`, `2026-01-01`), prices stored as null rather than 0, Toronto events in an Ann Arbor app, and three events with no hobby slug. The app degrades gracefully around all of it; the costs are quiet and cumulative. Sizing queries and the options are in [data-quality.md](data-quality.md).

Two more, measured 2026-08-31 while adding event durations ([data-quality.md](data-quality.md#6-end-times-exist-but-only-in-prose) §6):

- **`duration_minutes` is populated on roughly 1 event in 58.** The column already exists on `events` — hand-added, in no migration — and `resolveEventTiming` already prefers it over parsing prose. Backfilling it is a pure data job that needs no code change, and it is the only way end-time coverage goes above the ~28% the parser manages.
- **About a quarter of approved events store no clock at all**, just `See details` or `Evenings and afternoons` in `events.time`. A tester reported that only the start time is shown; for these rows not even that is true, and no amount of parsing fixes it.

### Miscellaneous
`Dashboard.tsx` hard-codes `const verificationStatus = "verified"` and renders the "Verified Business" badge from that constant, ignoring the real `profiles.verification_status` column.

### The seed-data fallback does not actually work
`CLAUDE.md` and [architecture.md](architecture.md) both say the app "renders
against seed data instead of crashing" when `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` are missing. **It does not.** With no `.env.local`,
`/events` renders blank and the console shows:

```
TypeError: supabase.from(...).select is not a function
    at use-events.ts:12
```

The Proxy in `src/lib/supabase.ts` returns a callable proxy from `get`, and
*calling* it hits the `apply` trap, which resolves a real `Promise`. So
`supabase.from("events")` is a Promise — and a Promise has no `.select`. Every
call site in the app chains (`.from().select().eq()`), so the fallback fires on
the first hop and throws on the second. `useEvents` never sets `loading` to
false, and the page sits empty forever.

Consequences worth knowing before you debug something else:

- **Local development without Supabase credentials is not a working app.** Any
  page driven by a hook that queries Supabase renders empty. Verify UI work on
  a Vercel preview, or get real env vars.
- **Anything mounted app-wide must survive it.** `SavedEventsProvider` wraps
  every route, so its fetch is wrapped in try/catch specifically to keep a
  broken client from taking the shell down. Do the same for the next provider.

The fix is to make the proxy chainable — return proxies that are also
thenables, so `.from().select().eq()` resolves to `{ data: null, error }` at
whatever depth it is awaited. Small, contained, and it would restore the
offline story the docs already promise. Not attempted yet; nothing in the app
depends on the current behaviour, since the current behaviour is a crash.

### `npm test` is not green on `main`
Three assertions in `src/test/hobbies-search.test.ts` fail: "should have 25
hobbies total", and the tag lookups for `yoga` and `boxing`. They have been
failing since `320f8af "update hobby slugs to match real event data"`, which
changed `src/data/hobbies.ts` without updating the test — the same taxonomy
drift described in [hobby-taxonomy.md](hobby-taxonomy.md).

They are **not** a signal that your change broke something. Expect
`3 failed | N passed` and check the names before investigating. Either fix the
test to the current taxonomy or fold it into the taxonomy work; leaving a red
suite means the next real failure is invisible.
