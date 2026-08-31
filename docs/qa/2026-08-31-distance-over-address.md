# Proximity instead of the street address — QA script

**PR:** #16 · **Shipped:** pending merge · **Test at:** the branch preview while
open; <https://design-harmony-ashen.vercel.app/events> once merged.

Open in a **fresh incognito window** for the first pass — incognito has no
location permission, which is the state most users are in.

## What changed, in one paragraph

A tester said she would rather see how far away a class is than its street
address. Cards now show a distance when the app can work one out, and the town
when it cannot — "2.4 mi" or "Ann Arbor, MI" in place of "3765 Plaza Dr, Ann
Arbor, MI 48108". The full address is still on the event page. **Distance
requires the event to have been geocoded, and two thirds have not been**, so
most cards show a place name today; that ratio improves on its own as the
backfill happens.

---

## 1. Cards show a place, not a street address

**Do:** open `/events` in incognito and scan the list.
**Expect:** every card's location line reads like "Ann Arbor, MI" or "Toronto,
ON" — short, no street number, no postcode, never truncated mid-word.
**Fail:** a full address, or a line cut off with an ellipsis.

## 2. The out-of-town listings are now obvious — the point of the change

**Do:** scroll the list and count roughly how many say **Toronto, ON**.
**Expect:** a lot of them (76 of 147 upcoming when measured). Before this, the
truncated address usually cut off before the city, so they looked local.
**Fail:** Toronto events reading as though they are in Michigan.

Worth saying out loud: this change does not add Toronto events, it stops hiding
them. If the list now looks alarmingly non-local, that is the catalogue
question in [../data-quality.md](../data-quality.md) §3, not a bug in this PR.

## 3. No permission prompt from browsing

**Do:** in that incognito window, browse `/events` and home for a minute.
**Expect:** the browser **never** asks for your location.
**Fail:** any location prompt. A browse list is the wrong moment to ask, and a
prompt nobody expects gets denied, which costs the answer permanently.

## 4. Distances appear once you have granted location

**Do:** in a normal window, grant location to the site (the map on home asks,
or use the distance filter if it is ever re-enabled). Reload `/events`.
**Expect:** cards for geocoded events switch to a distance — "0.4 mi", "2.4
mi", "12 mi". Ones without coordinates keep showing their town.
**Fail:** every card still showing a town after granting, or a distance that is
obviously wrong (a Toronto class reading "3 mi" from Ann Arbor).

## 5. The full address is one tap away

**Do:** open any event from a card.
**Expect:** the event page shows the complete street address, unshortened.
**Fail:** the shortened label on the detail page too — the address has to live
somewhere.

## 6. The featured cards match

**Do:** compare a class on home ("Featured this week") with the same class in
the `/events` list.
**Expect:** the same location line in both.

---

## Signed-in pass

Nothing here depends on being signed in. Location permission is per-browser,
not per-account.

## What is shakiest

**Address parsing.** The label is derived by splitting the `location` text, and
that text is scraped, so an unusual shape can produce an odd label. Venue-only
values ("Maker Works") are shown as-is by design. If you spot a label that
reads strangely, note the exact address — that is a parsing case worth adding.

**Distance coverage is a third of the catalogue.** Not a defect in this change;
it is the geocoding gap in [../data-quality.md](../data-quality.md) §4. Every
row geocoded is a card that upgrades from a town to a distance for free.

## Not covered

Search result cards have no coordinates — `/api/search` does not return them —
so they always show the place name even when you have granted location.
Community and group cards were not touched.
