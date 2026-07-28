# Home redesign — verse-first (2026-07-29)

Decisions (with Prince): **A — verse-first home** · **paper app, clay cards** ·
**Today tab → Topics**.

## Principle

The home screen stops explaining the product and becomes the product:
Scripture visible and playable in zero taps. All explanatory copy dies.

## Home (`/`)

1. **Hero — Verse of the Day**, server-rendered for instant paint
   (Asante Twi default; client swaps language after hydration if the
   stored preference differs). Eyebrow "Today · Day N", then the
   `VerseCard` reading surface (reference, version chip, big serif local
   text, English companion, Play + pace, attribution), then the share
   row. `export const revalidate = 3600` keeps it fast.
2. **"What's on your heart?"** — large display-serif section heading
   directly below, with the existing `VerseFlow` (input, mic, language
   chips, suggestion chips). The "Try this" hint panel is removed; the
   chips are self-explanatory.

Removed: the header H1 + blurb, `TodayTeaser`, the idle hint panel.

## Topics (`/topics`, replaces Today in the nav)

The 11 curated topics (Anxiety … Trust) as a tappable list; tapping a
topic expands it inline with its primary verse (fetched by explicit
reference — deterministic) plus audio and share. Zero new API surface.

`/today` becomes a redirect to `/` so old links and docs never 404.

## Out of scope (post-hackathon)

Conversation-feed home (direction B), dark site-wide identity,
reflection on topic pages.
