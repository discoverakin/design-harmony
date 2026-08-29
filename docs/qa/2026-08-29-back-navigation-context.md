# Back-navigation context — QA script

**PR:** #7 · **Shipped:** pending merge · **Test at:** the branch preview
(`design-harmony-git-fix-back-navig-c15d77-discoverakins-projects.vercel.app`)
while open; <https://design-harmony-ashen.vercel.app> once merged.

Open in a **fresh incognito window**. Open **DevTools → Network**, filter the
box to `search`, tick **Fetch/XHR** — several checks below are about a request
*not* happening, and this is the only way to see that.

## What changed, in one paragraph

A tester tapped a class in her search results, pressed back, and landed in a
full category list instead of her search — and the search view had no back
control at all. Three things caused it: search results linked to
`/hobby/:slug` rather than the class, the category page's back button was
hard-wired to home, and returning to a search re-ran the whole query. Now a
result opens that class, back retraces real history, the search view has a
back control, search answers are reused for an hour, and both `/events` and
`/search` return you to the scroll position you left.

---

## 1. A search result opens the class, not the category

This is the root bug — everything else compounded on it.

**Do:** go to `/search?q=pottery`, wait for results, tap **Book Now** on a card.
**Expect:** the event detail page for *that class* — title matching the card,
with date, time, location and a bookmark in the header.
**Fail:** a page headed with a hobby name ("Pottery & Ceramics") listing many
classes.

## 2. Back from an event restores the search instantly

**Do:** from that event, press the **browser back** button, watching Network.
**Expect:** the search view, `pottery` still in the box, the same results in
the same order, **no spinner**, and **no new `/api/search` request**.
**Fail:** a spinner, a new request, different results, or an empty box.

**Repeat with the in-app back arrow** (top-left of the event page), pressed
once — same expectation.

## 3. The search view has a way out

**Do:** from home, run any search, then tap **Back** at the top-left.
**Expect:** you land back on home.
**Fail:** no back control, or it goes somewhere you have not been.

**Deep-link case.** Open `/search?q=knitting` directly in a **new** tab and tap
**Back**.
**Expect:** `/home`.
**Fail:** the tab tries to leave the site, or nothing happens.

## 4. The category page retraces one hop

**Do:** home → **Browse Hobbies** → a hobby → tap **Back**.
**Expect:** home.
**Then:** from that hobby page open a class, press back (hobby page), press
back again (home). Each press undoes one step.
**Fail:** any Back jumping straight to home from a deeper page. That was the
bug — `HobbyDetail` was `navigate("/")`.

## 5. Submitting still re-runs the search

**Do:** on a search you have already run, click the input and press **Enter**.
**Expect:** a spinner and **a new `/api/search` request**.
**Fail:** an instant repaint with no request — the cache must never swallow a
deliberate re-run, since that is how a user refreshes an answer they distrust.

## 6. Filters and scroll survive a round trip

**Do:** open `/events`, tap **This week** and **Paid**, scroll well down, tap a
card, press back.
**Expect:** URL still `?date=this-week&price=paid`, both chips highlighted, and
the list back at the **same scroll position**.
**Fail:** chips reset, or you land at the top.

**Counterpart:** open `/events` fresh in a new tab — it must start at the
**top**, not at a remembered position.

---

## Signed-in pass

Repeat 1, 2 and 6 logged in. Session state does not affect any of this logic,
but it changes what renders (saved bookmarks, RSVP flags). While logged in,
confirm a **saved bookmark still reads as saved** after the back navigation in
step 2 — that exercises #5 and #7 together.

## What is shakiest

**Scroll restoration (step 6).** It waits for the list to render before
restoring, so on a slow connection it can land near — rather than exactly on —
where you were. That is the known limitation, not a broken feature. Everything
else here is deterministic.

## Not covered

Search results depend on a live model call, so the *contents* of a result set
are not asserted anywhere — only that the same set comes back on a return
visit. Community and group event cards were not touched.
