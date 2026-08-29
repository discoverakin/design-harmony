# Event data quality (deferred)

**Status:** not started, except the price check in section 2 (run 2026-08-25,
came back clean) and the coordinate count in section 4 (measured 2026-08-26 on
a preview deploy). Noted while fixing search. Nothing here is
blocking — the app degrades gracefully around all of it — but each item costs
something quietly, and the source keeps producing more.

## 1. Placeholder dates

Listings whose schedule could not be extracted carry a sentinel date. Two forms
exist in production:

| Sentinel | Behaviour today | Cost |
|---|---|---|
| `2099-01-01` | Permanently "upcoming". Renders as **"Schedule varies"** (see `hasKnownDate` in `src/lib/eventDates.ts`) | Never ages out. As real events pass and drop off, placeholders become a growing share of every undated result set. Invisible to date queries — "this weekend" can never match 2099 — so they are simultaneously always-present and never-findable |
| `2026-01-01` | In the past, so `isUpcoming` filters it out of the UI entirely | **Lost inventory.** "Intro to Clear Glazes and Slips [Summer 2026]" is a real course no seeker can find. A host would have no way to know why |

**What a seeker sees:** of the 174 events currently listed as upcoming, **29
carry the `2099-01-01` sentinel**. They appear in the unfiltered list and drop
out of every date filter, which now says so out loud ("Not shown: 29 with no
confirmed date").

Several of these records say so in their own description: *"Schedule not
confirmed: Booking calendar exists on site but dates could not be extracted —
check site directly."*

Size it:

```sql
select date, count(*), min(title) as example
from events
where date in ('2099-01-01', '2026-01-01')
group by date;
```

**Fixing the rows buys a few weeks.** The rows share
`created_by_name = 'Akin Scout'`; whatever writes them falls back to a
placeholder whenever a schedule can't be parsed. The durable options are to
write `null` and give the schema a real "date unknown" state, or to hold such
listings out of `approved` until a date is resolved. Both are larger than a
data cleanup.

## 2. Unknown prices stored as null

Scraped listings leave `price_cents` null and put the real price in
`price_display` as free text ("$80 per person", "$35–$325"). `formatPrice` used
to render null as **"Free"**, so paid classes advertised themselves as free;
it now returns "See details".

**Checked 2026-08-25 — the risk did not materialise.** A genuinely free class
stored as null rather than `0` would now read "See details" and look paid. The
query below returned four rows, and all four are false positives: the word
"free" inside *free-form*, *stress-free*, and "free vocal assessment" on a class
whose `price_display` is "$50 per single lesson". No event needs correcting.
Re-run it after any bulk import:

```sql
select id, title, price_cents, price_display
from events
where price_cents is null
  and (price_display ilike '%free%' or description ilike '%free%')
  and status = 'approved';
```

Anything genuinely free that comes back should be set to `price_cents = 0`.

### What the same measurement did surface

Of **306 approved events**:

| `price_cents` | Count | Renders as |
|---|---|---|
| `0` | 30 | "Free" |
| `> 0` | 201 | A dollar amount |
| `null` | **75** | See below |

Of those 75, **26 carry a `price_display`** and now show that text ("from $50",
"$80 per person"). The other **49 have no price information at all** and show
"See details".

Measured again against the upcoming list on 2026-08-26: of 174 upcoming events,
**17 are free, 102 are paid, and 55 have no price** — a third, a worse ratio
than the whole-table figure, because unpriced listings skew toward the
never-ageing sentinel dates in section 1.

That last number is the finding: **one event in six has no price**. It is a
bigger gap than the placeholder dates in section 1 — a seeker cannot compare
those classes to anything, and a listing with no price reads as less trustworthy
than a competitor's that shows one. Same root cause as the dates (the scout
cannot always extract a price from the source page) and the same two options:
accept unpriced listings as a permanent state and design for it, or hold them
out of `approved` until a price is resolved.

The Free/Paid filter on `/events` now makes the gap visible to seekers rather
than to a SQL query: an unknown price is neither free nor paid, so those
listings drop out of a filtered list and the page prints how many it held back
("Not shown: 75 with no listed price"). Same for the sentinel dates in section
1 under a date filter. That is honest, but it is a running count of the problem
displayed to users — the number is worth watching.

```sql
select count(*) filter (where price_cents is null) as unknown,
       count(*) filter (where price_cents = 0)    as free,
       count(*) filter (where price_cents > 0)    as paid
from events
where status = 'approved';
```

## 3. Events outside Ann Arbor

Search returns Toronto listings (Toronto Public Library, Repair Café Toronto,
The Fifth Dance, ARTiculations) in an app whose positioning, landmark
geocoding, and copy are all Ann Arbor. Either the scout's scope widened or the
data was seeded from elsewhere.

This matters beyond tidiness: `api/search.ts` resolves location hints against a
hard-coded Ann Arbor landmark table, so a Toronto event can never be found by
proximity and will only ever surface through keyword or hobby matching. Decide
whether the catalogue is Ann Arbor-only (delete or unpublish them) or
multi-city (then the landmark table, the copy, and probably a city filter all
need to follow).

```sql
select count(*) from events where location ilike '%toronto%' or location ilike '%, on %';
```

## 4. Events with no coordinates — the distance filter can barely work

Measured on the `feat/browse-filters` preview on 2026-08-26, anonymous view,
upcoming events only (174 of the 306 approved rows; the rest are past).

| | Count | Share |
|---|---|---|
| Upcoming events | 174 | — |
| No `lat`/`lng` at all | **116** | 67% |
| Mapped, within 10 mi of downtown | 28 | 16% |
| Mapped, farther than 10 mi | 30 | 17% |

The 28 that a radius can find are **26 ongoing/recurring listings and 2 dated
ones**. So of 148 dated upcoming events, exactly two can appear under any
distance filter; the other 146 are either unmapped or out of town (section 3 —
the >10 mi group is largely the Toronto listings).

The filter itself is correct and said what it held back ("Not shown: 116 not
yet mapped"), but until the backfill happens a radius mostly returns the
recurring classes — so **the distance chips are switched off in the UI**
(`DISTANCE_FILTER_ENABLED` in `src/lib/eventFilters.ts`). Geocode the rows,
flip the constant, and the filter comes back as-is. `NearYouMap` has the same ceiling — it queries
`.not("lat", "is", null)`, so two-thirds of the catalogue was never on the map
either; that was simply invisible before a filter put a number on it.

Same root cause as sections 1 and 2: the scout writes a row whether or not it
could resolve the field. Geocoding the 116 is a one-off job against an address
column that already exists (`location`), and it is the cheapest of the three
gaps to close.

```sql
select count(*) filter (where lat is null or lng is null) as unmapped,
       count(*) filter (where lat is not null and lng is not null) as mapped
from events
where status = 'approved';
```

## 5. Events with no hobby slug

Three events have `hobby_slug = null`. They are reachable only by words in
their own title and description — no hobby path, no mood path, and no
backfilled `search_terms` (migrations 013/014 key on the slug). Low volume,
easy to fix by hand, and worth doing whenever the taxonomy work in
[hobby-taxonomy.md](hobby-taxonomy.md) happens.
