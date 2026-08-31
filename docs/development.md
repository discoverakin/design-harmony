# Development

## Commands

```sh
npm run dev          # Vite dev server on port 8080
npm run build        # production build
npm run build:dev    # build in development mode
npm run lint         # eslint
npm test             # vitest run (single pass)
npm run test:watch   # vitest watch
npx vitest run src/test/hobbies-search.test.ts   # single test file
npx vitest run -t "should find Music"            # single test by name
```

Tests live in `src/test/` (`vitest` + jsdom + Testing Library, globals enabled, `src/test/setup.ts` stubs `matchMedia`).

**Three test in `hobbies-search.test.ts` fail on `main`** and have since
`320f8af`. See [known-issues.md](known-issues.md) — expect them, don't debug
them.

Conventions that have held up:

- **Pull the logic out and test it directly.** `eventFilters.ts`,
  `eventDates.ts`, `geo.ts` and the `api/search.ts` helpers are pure and
  exported for this reason; that is where the interesting cases live.
- **Page tests mock the hooks, not the network.** `vi.mock` on `@/hooks/use-auth`,
  `@/hooks/use-events`, `@/hooks/use-saved-events` and `@/lib/supabase` — see
  `events-page-filters.test.tsx`. Mocking a whole Supabase chain is only worth
  it when the chain *is* the subject (`save-event-button.test.tsx`).
- **Query chips and card actions by role**, not by text: section headings reuse
  the same words as the filter chips (`getByRole("button", { name: "Tomorrow" })`).
- **Feature flags guard their own tests.** `it.skipIf(!DISTANCE_FILTER_ENABLED)`
  keeps the distance-chip tests in the file and out of the run, so flipping the
  flag flips the coverage back on too.

## Gotchas

- TypeScript is **loose on purpose**: `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, unused-vars lint rule off. Existing code relies on this; tightening it repo-wide would cascade.
- `bun.lock`/`bun.lockb` and `package-lock.json` both exist. Use npm unless told otherwise.
- Migration files are additive and hand-run — adding one means running it by hand in the Supabase SQL editor.
- No `StrictMode` in `main.tsx`, so effects fire once — dev won't surface double-invoke bugs.
- **The app does not run locally without Supabase credentials.** No
  `.env.local` means `/events` and every other hook-driven page render empty,
  with `supabase.from(...).select is not a function` in the console — the
  fallback Proxy is broken (see [known-issues.md](known-issues.md)). Use a
  preview deploy to verify UI work, or get real env vars.
- Public browse routes have **no loading gate**, so they briefly render the anonymous view before auth resolves (the `OwnerBanner` flashes for logged-in users; `useEvents` fetches twice on a logged-in cold load — anon branch, then authed). Protected routes *do* gate on `loading`, so they don't flash. Expect this when debugging "wrong for a split second" renders.

## Verifying on a Vercel preview

**The PWA service worker will serve you a stale bundle.** All deployments of a
branch share one preview origin, so workbox keeps precached JS from an earlier
build and you end up testing old code while believing it's new. This has already
caused one working feature to look broken.

A hard reload is not reliably enough. Clear it first, in the page console:

```js
(await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
(await caches.keys()).forEach(n => caches.delete(n));
```

Then reload. **The same applies to the production origin after a deploy**, and
it is easy to forget because you are not thinking about caches by then: on
2026-08-31 the first load of production after a merge still showed the
pre-merge page in a browser that had visited the site before. One stale load,
then correct. Do not conclude a deploy failed on the strength of a single load.

**The cheapest way around all of it: use the immutable per-deployment URL**,
`design-harmony-<hash>-discoverakins-projects.vercel.app`, which every
deployment gets and which the Vercel MCP `list_deployments`/`get_deployment`
tools return as `url`. It is a *different origin* from both the branch alias and
production, so no service worker is registered on it and there is nothing to
clear. The trade-off is that it does not follow the branch — push again and you
need the new one.

**Getting to a preview.** Every push builds one; the branch alias
`design-harmony-git-<branch>-discoverakins-projects.vercel.app` always points at
the newest deployment of that branch — which is exactly why the service worker
bites there and not on the per-deployment URL.

**Previews are public.** Checked 2026-08-31: password protection, Vercel
Authentication and trusted IPs are all disabled on this project, and both the
branch alias and the per-deployment URL answer an unauthenticated `curl` with a
200. You can paste a preview link to anyone, and no share link is needed. Two
consequences: a tester needs no Vercel account, and anything on a preview is
world-readable. If protection is ever switched on, Vercel MCP
`get_access_to_vercel_url` mints a bypass link valid ~23h.

Two more preview gotchas:

- **Previews share the production Supabase.** A successful sign-up on a preview
  creates a real user row. Use plus-addressed emails and delete them afterwards.
- **`Login.tsx` and `Signup.tsx` redirect logged-in visitors away**, so auth
  pages are unreachable with a live session. Test them in an incognito window.
