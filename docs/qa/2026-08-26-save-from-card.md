# Save from the card — QA script

**PR:** #5 · **Shipped:** 2026-08-26 · **Test at:**
<https://design-harmony-ashen.vercel.app>

Open in a **fresh incognito window** for the logged-out half, then a normal
window (signed in) for the rest.

## What changed, in one paragraph

You can now save an event from a browsing card without opening it — a bookmark
in the top corner of the featured-feed card image, and beside the chevron on
the `/events` list rows. Saved events collect in the **Saved** tab on `/events`.
Saved state is shared across the cards, the list and the event detail page, so
saving in one place shows everywhere immediately.

---

## 1. The bookmark is where it should be, and misses forgive

**Do:** on home, look at **Featured this week**. Tap the bookmark deliberately
badly — at the very edge of the icon.
**Expect:** it still saves. The target is 44px around a 36px circle.
**Fail:** the event page opens instead. That was the first-pass bug: a press one
pixel outside the icon fell through to the card link.

**Also check placement:** the bookmark sits at the opposite end of the card from
**Book Now**. A thumb aiming at one should never reach the other.

## 2. Saving does not navigate

**Do:** tap a bookmark on the `/events` list, where the whole row is a link.
**Expect:** the icon fills, the page does not move.
**Fail:** the event detail page opens.

## 3. Logged out, it asks rather than failing quietly

**Do:** in incognito, tap any bookmark.
**Expect:** the sheet "Log in to save events" with a Create Account button; you
stay on the page.
**Fail:** nothing happens, or the icon fills and then silently forgets.

## 4. Saved events reach the Saved tab

**Do:** signed in, save two events from the featured feed, then go to
`/events` → **Saved**.
**Expect:** both are listed.

## 5. State is shared across surfaces — the regression to watch

**Do:** open one of those saved events, unsave it from the header bookmark,
then go back to the list.
**Expect:** that card now reads unsaved too.
**Fail:** the card still shows saved. Saved state was moved out of `useEvents`
into one provider precisely so this cannot drift; a mismatch here means that
broke.

## 6. It persists

**Do:** reload the page.
**Expect:** saved bookmarks are still filled — they come from the `event_saves`
table, not memory.

---

## Signed-in pass

Everything from step 4 on requires an account. Note that previews and
production share the same Supabase, so anything you save is a real row on a
real account.

## What is shakiest

**A failed write rolls the icon back.** If you save something and the bookmark
un-fills a moment later, that is not a rendering glitch — the write was
rejected (expired session, RLS, connectivity). Worth reporting with the console
open.

## Not covered

Community and group event cards (`CommunityEventCard`) and the hobby detail
rows have no save control — deliberate, not an oversight.
