# Architecture

**Discover Akin** — a mobile-first PWA for finding creative classes, hobby groups, and events in Ann Arbor, MI. Two audiences share one app: *seekers* (browse hobbies, RSVP/pay for events, join groups, track practice) and *hosts/business owners* (a separate `/dashboard/*` section for listing experiences, payouts, analytics).

Originally scaffolded by Lovable (the README is Lovable boilerplate and largely stale; `lovable-tagger` still runs as a dev-only Vite plugin).

### Three backends, not one

1. **Supabase** (`src/lib/supabase.ts`) — primary datastore + auth. Every table has RLS; migrations are numbered SQL files in `supabase/migrations/` applied manually via the Supabase SQL editor (no CLI migration runner wired up).
2. **Vercel serverless functions** (`api/*.ts`) — Node handlers calling the Anthropic API. `api/quiz.ts` turns 5 quiz answers into hobby recommendations; `api/search.ts` is natural-language event search with Ann Arbor landmark geocoding and mood→hobby mapping. Called from the client as `fetch("/api/quiz")` / `fetch("/api/search")`. `vercel.json` rewrites everything *except* `/api/*` to `/` for SPA routing.
   `api/account-exists.ts` answers "does this email have an account?" for the
   sign-in page. Supabase deliberately returns the same `"Invalid login
   credentials"` for a wrong password and a missing account, so the client
   cannot tell them apart — hence a server-side lookup with the service-role
   key. **It is an account-enumeration oracle by design**: a deliberate,
   documented product tradeoff made to fix the sign-up dead end, not an
   oversight. Throttled by a Postgres-backed counter (`account_lookup_attempts`,
   migration 010) rather than an in-process one, because serverless instances
   don't share memory. Read the file header and migration 010 before changing
   any of it — both record the alternatives weighed and when to replace them
   (a Vercel WAF rule, if the project ever moves to a Pro plan).
3. **Supabase Edge Functions** (Deno, `supabase/functions/`) — `create-checkout-session` and `stripe-webhook` handle Stripe embedded checkout. Note several functions are invoked from the dashboard (`request-payout`, `stripe-connect-onboarding`, `send-group-announcement`, `send-sponsorship-request`) but are **not in this repo** — they're deployed separately.

The Supabase client is *meant* to degrade gracefully: when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are absent it becomes a Proxy resolving every call to `{ data: null, error }`, so the UI renders against seed data instead of crashing. **In practice it throws on the second call in any chain** (`supabase.from(x).select(...)`), which is every call site — see "The seed-data fallback does not actually work" in [known-issues.md](known-issues.md). Preserve the intent when touching `src/lib/supabase.ts`, and do not assume the app runs locally without credentials.

## Env vars

Client (`VITE_` prefix, must be in `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`.
Serverless (`api/*`): `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Routing and auth gating

All routes live in `src/components/AnimatedRoutes.tsx` — one file, wrapped in framer-motion `AnimatePresence` with each page in `<PageTransition>`. Three tiers:

- **Public browse** (`/home`, `/search`, `/hobby/:slug`, `/events`, `/events/:id`, `/community`, `/community/:slug`, `/tracker`) — anonymous users can read. Write actions are gated *inside the page* by opening `AuthPromptSheet`, which routes to `/login?redirect=...`. Do not wrap these in `RequireAuth`.
- **Protected** (`/profile`, `/settings`, `/quiz`, `/events/create`, `/admin-events`) and **all `/dashboard/*`** — wrapped in `RequireAuth`, which also preserves `?payment=success|cancel` context through the login round-trip.
- `/` redirects to `/home`. `HomeRoute` forces logged-in-but-not-onboarded users to `/onboarding`.

`useAuth` (`src/hooks/use-auth.tsx`) wraps Supabase auth (PKCE, storage key `akin-auth`). `useProfile` auto-creates the `profiles` row; `App.tsx` mounts a `ProfileEnsurer` so this happens on every page. Onboarding state reads from the profile with a `localStorage` fallback (`akin-onboarding-complete`).

## Data layer pattern

There is no global store and React Query is installed but barely used. State lives in hooks under `src/hooks/`, each owning one domain and doing its own Supabase fetching:

- `use-events.ts` — the heaviest. Fetches `events` plus RSVPs/saves/attendances/payments in parallel and *enriches* each `DbEvent` into a `CommunityEvent` with per-user flags (`is_attending`, `is_saved`, `has_paid`, …). Has a separate anonymous branch that skips per-user queries. Also owns `initiatePayment` (calls the checkout edge function directly with the user JWT).
- `use-saved-events.tsx` — **the exception to the pattern above: a provider, not a per-page hook.** Saving is reachable from the browse cards, the event list and the detail page at once, and `useEvents` is instantiated separately by every page, so save state kept there went stale the moment a card wrote to it. `SavedEventsProvider` (mounted in `App.tsx` inside the router) holds one `Set` of saved event ids, fetched once per session, and every surface reads and writes through it. It also owns the anonymous-tap auth prompt, so a scrolling feed needs one `AuthPromptSheet` rather than one per card. `useEvents` deliberately does **not** carry `is_saved`.
- `use-groups.ts`, `use-group-membership.ts`, `use-profile.ts` — same shape.
- `use-activity-log.ts`, `use-tracker-goals.ts` — **localStorage only** (`akin-activity-log`, goals). The hobby tracker is deliberately client-side; do not assume it hits Supabase.

`src/data/` mixes two things: shared TypeScript types (`events.ts` — `DbEvent`/`CommunityEvent`/`EventStatus`) and static seed/fallback content (`hobbies.ts`, `community.ts`, `quiz.ts`). Hooks fall back to this seed data when Supabase is unavailable. Seed groups have UUIDs starting `00000000-` and `created_by = null`, which is how ownership checks distinguish them.

## Search

`api/search.ts` matches a query against the **whole event record** — title,
description, location, group name, hobby slug, and `events.search_terms` (a
`text[]` of curated synonyms, migration 012) — not just the title. Claude parses
the query into keywords, `related_terms` (adjacent words a listing might use
instead), hobby, mood, location, price, and date; the keyword layer ORs every
term across every column and then ranks in memory (`scoreEvent` weights a title
hit above a description hit). Results fall back in tiers: exact → same topic
without date/price/location → anything on. `created_by_name` is deliberately
excluded from the searchable columns — see the privacy note in [known-issues.md](known-issues.md).

Migrations here are hand-run, so the handler treats `search_terms` as optional:
if the column is missing it notices once per instance, drops the condition, and
keeps matching on everything else. The pure helpers are exported and covered by
`src/test/event-search.test.ts`.

## Browse filters

`/events` carries date, price, and distance filters that are deliberately
**not** the search path: no model, no network, no typing. The whole approved
list is already in memory from `useEvents`, so `applyEventFilters`
(`src/lib/eventFilters.ts`) narrows it synchronously and works the same for
anonymous visitors. `api/search.ts` still owns natural-language queries; the
two never call each other.

Three things about it are load-bearing:

- **Missing data is disclosed, not dropped.** A quarter of approved events have
  no price and some carry the `2099-01-01` no-schedule sentinel (see
  [data-quality.md](data-quality.md)). An unknown price is neither free nor
  paid and an unknown date is not "today", so those listings are held back —
  and `applyEventFilters` returns `hiddenUnpriced` / `hiddenUndated` /
  `hiddenUnmapped` counts, which `/events` renders as a "Not shown:" line.
  Each held-back listing is counted once, under the first reason that applies.
- **Ongoing/recurring listings come back in their own bucket.** Their anchor
  date is not a date they happen on, so no range can be evaluated for them.
  They render under "Ongoing" with a note rather than being silently matched
  or silently dropped.
- **Filter state lives in the query string** (`date`, `day`, `price`,
  `radius`), so tapping into an event and coming back keeps it, and a filtered
  list is shareable. `filtersFromParams` ignores anything malformed.

**Distance is built but held back from the UI.** `DISTANCE_FILTER_ENABLED` in
`src/lib/eventFilters.ts` is `false`: 116 of 174 upcoming events have no
`lat`/`lng`, so a radius returns almost exclusively the recurring listings
(measured 2026-08-26 — [data-quality.md](data-quality.md) §4). While it is off
the chips do not render and a stale `?radius=` link is ignored, so nothing
filters without a visible control to undo it. Flipping the constant to `true`
after the geocode backfill restores all of it — the filtering, the URL param,
and the tests guarded by the same constant.

When on, distance measures from the device location if the user grants it and
from downtown Ann Arbor otherwise; the caption under the chips says which, and
geolocation is only requested once a radius is actually chosen
(`src/hooks/use-user-location.ts`). `src/lib/geo.ts` does great-circle
distance — unlike the degree-space approximation in `api/search.ts`, which is
elliptical at this latitude (see [known-issues.md](known-issues.md)).

Pure helpers are exported and covered by `src/test/event-filters.test.ts`; the
UI wiring by `src/test/event-filter-bar.test.tsx` and
`src/test/events-page-filters.test.tsx`.

`src/lib/weeklyShuffle.ts` — deterministic ISO-week-seeded Fisher–Yates, used for "Featured this week" carousels so the order is stable within a week and rolls automatically.

## Two parallel domains — the single biggest source of confusion

Migration 008's header says it plainly: *"consolidated from host-hub repo."* Two schemas model overlapping concepts and were never unified. There are **no foreign keys between them**.

| Concept | Seeker side (001–007) | Host side (008) |
|---|---|---|
| Listing | `events` (`pending→approved→rejected`, admin-moderated) | `experiences` (`draft→published`, self-serve) + `experience_sessions` + `experience_tiers` |
| Group | `groups`, `group_memberships`, `group_events` | `community_groups`, `group_members`, `group_announcements` |
| Money | `event_payments` (flat `price_cents`) | `bookings` (`amount_paid`/`platform_fee`/`net_amount`) + `payouts` |

`profiles` is the only hub — `user_id UNIQUE → auth.users`, with feature columns accreted over migrations 006/007/009. Everything else hangs off `auth.users` directly.

Two more asymmetries: the seeker side uses real FKs to `auth.users` while 008's root tables use bare `uuid` for `host_id`/`user_id` (only child→parent links are enforced); and the host domain has **no TypeScript models at all** outside the creation wizard (`components/dashboard/wizard/types.ts`) — dashboard pages query Supabase inline with untyped rows.

**Hobbies are not a table.** They're static TS in `src/data/hobbies.ts`, joined to events by a plain indexed `hobby_slug` text column (no FK). The taxonomy lives in code.

## UI conventions

- shadcn/ui in `src/components/ui/` — generated, don't hand-edit unless intentionally customizing. `components.json` is configured for further `npx shadcn@latest add`.
- **Mobile-first phone frame**: pages wrap content in `max-w-lg mx-auto` (~34 files). New pages should match.
- Theme is HSL CSS custom properties in `src/index.css`, surfaced through `tailwind.config.ts`. Use semantic tokens (`bg-primary`, `text-muted-foreground`) and the brand/hobby scales (`brand-orange`, `hobby-arts`, …) rather than hex. Some newer dashboard pages use inline hex styles — that's drift, not the pattern to copy. Dark mode is class-based via `use-theme.tsx`.
- Fonts: `font-sans` = Finlandica, `font-heading` = New Spirit.
- Feature components are grouped by domain (`components/tracker/`, `components/community/`, `components/dashboard/`, `components/social/`, `components/events/`, `components/profile/`).
- Bottom sheets (`Sheet side="bottom"`) are the standard mobile affordance for create/edit/log flows.
- **Card-level actions keep their distance from the card's primary CTA, and carry a 44px touch target.** `SaveEventButton` floats in the top corner of a card's image, the far end from "Book Now", and stops the click itself so it never triggers the surrounding card link — a tester reported mis-taps between the two on mobile. It shipped first at a flat 36px, and a press one pixel outside it fell through to the card link and opened the event; a transparent 4px border with `bg-clip-padding` now gives 44px of target around a 36px circle. Copy that pattern for any control that sits inside a linked card.

## PWA

`vite-plugin-pwa` with `registerType: "autoUpdate"`; Supabase requests use a `NetworkFirst` runtime cache with a 5-minute TTL. Changing the manifest or icons means touching `vite.config.ts` and `public/`.

## Auth model

No custom auth backend. Supabase Auth (email/password only, PKCE, `localStorage` key `akin-auth`, auto-refresh) issues JWTs; **authorization is enforced by Postgres RLS**, and the React route guards are UX only. Anything `RequireAuth` protects must also be enforced in RLS.

`Login.tsx` validates its `?redirect=` param with `startsWith("/") && !startsWith("//")` — a deliberate open-redirect defense. Preserve it if you touch that logic.

There is **no role system** — no roles table, no claims, no `is_admin`. `user_type` (`seeker`/`owner`) only picks a post-login redirect and some copy; it gates nothing. Real authorization is ownership-based RLS (`auth.uid() = created_by`, `auth.uid() = user_id`, or `EXISTS (... WHERE host_id = auth.uid())` on the host tables).

Server-side: the Deno edge functions authenticate properly (JWT verification, server-side price re-read, Stripe HMAC signature check). The Vercel functions in `api/` have **no auth at all** and hold the service-role key, which bypasses RLS — `api/search.ts` is safe only because it hard-codes `.eq("status", "approved")`. Any query added there is one forgotten filter from leaking everything.
