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

## Gotchas

- TypeScript is **loose on purpose**: `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, unused-vars lint rule off. Existing code relies on this; tightening it repo-wide would cascade.
- `bun.lock`/`bun.lockb` and `package-lock.json` both exist. Use npm unless told otherwise.
- Migration files are additive and hand-run — adding one means running it by hand in the Supabase SQL editor.
- No `StrictMode` in `main.tsx`, so effects fire once — dev won't surface double-invoke bugs.
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

Then reload. The same applies to the production origin after a deploy.

Two more preview gotchas:

- **Previews share the production Supabase.** A successful sign-up on a preview
  creates a real user row. Use plus-addressed emails and delete them afterwards.
- **`Login.tsx` and `Signup.tsx` redirect logged-in visitors away**, so auth
  pages are unreachable with a live session. Test them in an incognito window.
