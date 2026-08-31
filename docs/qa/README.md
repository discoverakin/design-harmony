# QA verification scripts

One script per shipped feature, written so someone who did not build the thing
can verify it without reading the diff.

**The rule: every feature PR ships with a script in this folder.** Written
before the PR is merged, while the person who built it still remembers what is
fragile. A PR that changes user-visible behaviour and adds nothing here is not
finished.

## The scripts

| Feature | PR | Shipped |
|---|---|---|
| [How long an event runs](2026-08-30-event-duration.md) | #12 | 2026-08-31 |
| [Teaching what the search bar does](2026-08-31-search-examples.md) | #13 | 2026-08-31 |
| [Price on the events list cards](2026-08-30-price-on-list-cards.md) | #10 | 2026-08-30 |
| [Carousel affordances](2026-08-29-carousel-affordances.md) | #9 | 2026-08-30 |
| [Back-navigation context](2026-08-29-back-navigation-context.md) | #7 | 2026-08-29 |
| [Save from the card](2026-08-26-save-from-card.md) | #5 | 2026-08-26 |
| [Browse filters on /events](2026-08-26-browse-filters.md) | #4 | 2026-08-26 |

Start from [TEMPLATE.md](TEMPLATE.md).

## What every script must contain

- **Where to test.** Production, or the branch preview while the PR is open.
  Branch previews disappear once the branch is deleted, so a merged feature's
  script should point at production:
  <https://design-harmony-ashen.vercel.app>. (Previews themselves need no share
  link — see "Before you start" below.)
- **Numbered scenarios**, each as **Do / Expect / Fail**. "Fail" is the part
  people skip and the part that makes a script usable by someone who has never
  seen the feature working — describe the old broken behaviour where there was
  one.
- **How to observe the invisible.** Several of these features are about
  something *not* happening (no network call, no navigation, no lost state).
  Say which DevTools panel shows it and what filter to type.
- **The signed-in pass, called out separately.** Claude cannot log in, so
  anything behind auth is unverified by the person who wrote the script and
  needs a human.
- **What is shakiest.** An honest note on the part most likely to fail in the
  wild, so a tester knows what deserves a second look versus what is
  deterministic.

## Before you start, every time

Clear the service worker on the origin you are testing, or you will test an old
bundle and believe it is new — see
[../development.md](../development.md#verifying-on-a-vercel-preview). An
incognito window sidesteps it entirely and is the fastest way in.

This bites on **production too**, not just previews: the first load after a
deploy can still show the pre-deploy page in a browser that has been to the site
before. One stale load, then correct — so re-load before reporting that a
shipped fix did not ship.

When a script points at a preview, prefer the **immutable per-deployment URL**
(`design-harmony-<hash>-…vercel.app`) over the branch alias. It is a different
origin, so no service worker exists on it at all. Preview links need no Vercel
account and no share link — deployment protection is off on this project.
