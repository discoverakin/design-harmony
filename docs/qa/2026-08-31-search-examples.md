# Teaching what the search bar does — QA script

**PR:** #13 · **Shipped:** 2026-08-31 · **Test at:**
<https://design-harmony-ashen.vercel.app/search>

Open in a **fresh incognito window**. No login needed.

## What changed, in one paragraph

A tester read the search bar as an ordinary keyword box and never discovered it
understands phrases like "relaxing evening this weekend". The empty search page
— previously nothing but an input — now explains the difference in two lines
and offers five example phrases you can tap to run. The placeholder asks you to
describe rather than to search, and the two examples on the home search box are
tappable rather than decorative text.

---

## 1. The empty search page teaches, rather than sitting blank

**Do:** go to `/search` with no query (tap the search box on home, or open the
URL directly).
**Expect:** the heading "Say what you're in the mood for", a line explaining it
reads the whole phrase — a vibe, a night, a budget — and five tappable example
chips below it.
**Fail:** an empty page below the input, which is what was there before.

## 2. The examples are phrases, not keywords

**Do:** read the five chips.
**Expect:** "relaxing after work", "free classes to try", "beginner, no
experience", "meet people and make something", "fun with my kid" — each
demonstrating something different (mood, price, skill level, social intent, who
you are with).
**Fail:** a one-word example like "pottery". That teaches the exact habit this
change exists to break.

## 3. Tapping an example actually searches it

**Do:** tap **relaxing after work**.
**Expect:** it appears in the search box, the URL becomes
`/search?q=something relaxing after work`, and real classes come back (9 at the
time of writing). The teaching block disappears once results are on screen.
**Fail:** a chip that fills the box but does not search, or results that look
like a keyword match on the word "relaxing".

## 4. The results are worth the promise — the honest check

**Do:** tap two or three different examples and read what comes back.
**Expect:** results that plausibly answer the phrase, and a decent number of
them. Measured on 2026-08-31 each of the five returned 6-12 classes: relaxing
after work 9, free classes to try 6, beginner 11, meet people 12, with my kid
6.
**Fail:** results that ignore the phrase entirely. Worth reporting with the
exact wording — a promise made in an example and broken by the results is worse
than no example, and it points at `api/search.ts` rather than this change.

## 5. The home search box invites the same thing

**Do:** on home, look under **Browse Hobbies** at the search box.
**Expect:** "Try:" followed by two tappable chips. Tapping one goes straight to
`/search` with that phrase and runs it.
**Fail:** plain grey text you cannot tap — that was the old hint, and the
tester's eye slid past it.

## 6. Typing a hobby name still filters hobbies

**Do:** on home, type `pottery` into that same box, slowly.
**Expect:** the hobby grid filters as you type — that box does two jobs, and
this one still works. Pressing **Search classes** hands the phrase to the AI
search instead.
**Fail:** the grid not filtering, or the button vanishing.

## 7. The dead end explains itself

**Do:** on home, type something no hobby matches, e.g. `something calming`.
**Expect:** a short block saying no hobby matches, and telling you the Search
classes button will read it as a description.
**Fail:** the old copy, which announced "Search classes with AI" without saying
what that buys you.

---

## Signed-in pass

Nothing here is auth-dependent. Worth one pass only to confirm the examples do
not push the layout around when the header shows a signed-in menu.

## What is shakiest

**The examples age with the catalogue.** They were chosen by running candidates
against the live search and keeping the ones that returned 6-12 classes and
were not dominated by the out-of-area Toronto listings. As inventory changes
those counts drift, and an example that returns one result teaches that the
feature is broken. If a chip comes back nearly empty, that is worth reporting —
the fix is to re-measure and swap the phrase, not to change the code.

**No example demonstrates dates**, deliberately: "relaxing evening this
weekend" returned a single Toronto workshop, and "learn something new this
month" came back 8 of 9 Toronto. Dates parse correctly; there is not enough
local inventory in a given week to show it off. Worth revisiting after the
catalogue-scope question in [../data-quality.md](../data-quality.md) §3.

## Not covered

The wording of the examples is not tested for result quality — only that
tapping one runs it. Search results depend on a live model call, so a chip that
returns something odd is a data or parsing issue, tracked separately in
[../known-issues.md](../known-issues.md).
