## Goal

Turn the app into a date-driven content engine. All memories live in a Google Sheet. The UI generates date cards, carousels, music, unlock states, and the calendar from that data. Adding/editing a row in the sheet = a new memory live in the app. No code changes.

## Archive model

- **Day 1** = the website launch date (first time the app boots in production we capture "today" as the launch date, stored client-side in `localStorage` as a fallback; the canonical launch date also lives in the sheet's `meta` tab so it survives device changes).
- **Final day** = `2026-06-23` (already defined as `FINAL_DATE`).
- Each calendar day between launch and final date is a slot. A row in the sheet is matched to its slot by `date` (YYYY-MM-DD).
- **Unlock logic**: `today's date >= row.date` → unlocked; future → locked/chained; missing row for a past date → renders a soft "untitled day" placeholder so the timeline stays unbroken.
- **Countdown**: `sunsets remaining = FINAL_DATE − today` (already implemented, kept).
- **Highlight**: today's card gets the "now" treatment (ring, label, autoscroll target).

## Data source: Google Sheets via connector

One spreadsheet, two tabs:

**Tab `memories`** — one row per day:

```text
date | title | quote | song_title | song_artist | youtube_id | photos | videos | notes | unlock_message
```

- `date`: `YYYY-MM-DD`
- `photos`, `videos`, `notes`: pipe-separated lists (`url1 | url2 | url3`) — Cloudinary URLs for media, plain text for notes
- `unlock_message`: optional; if present, the row is treated as a "third-day surprise"

**Tab `meta`** — single row of key/value config:

```text
key            | value
launch_date    | 2026-05-25
final_date     | 2026-06-23
hero_title     | today, & every day before it.
```

## Architecture

```text
Google Sheet (memories + meta)
        │
        ▼
src/lib/memories.functions.ts    ← createServerFn, calls connector gateway
        │  returns { meta, memories: Memory[] }
        ▼
TanStack Query (queryKey: ['memories'])
        │
        ▼
src/routes/index.tsx (loader: ensureQueryData → useSuspenseQuery)
        │
        ▼
DateCardCarousel / Calendar / MusicBar / MemoryDialog
```

### Files to add/change

- **Add** `src/lib/memories.functions.ts` — `getMemoryArchive` server function that fetches both sheet tabs through the gateway (`https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/{ID}/values:batchGet?ranges=memories!A:Z&ranges=meta!A:B`), parses rows into typed `Memory[]` + `MetaConfig`, validates with Zod, and returns a plain DTO.
- **Add** `src/lib/memory-types.ts` — shared `Memory`, `MediaItem`, `MetaConfig` types + parsing helpers (split pipe lists, normalize dates, derive `locked`/`isToday`).
- **Replace** `src/lib/days.ts` — keep the `Memory` type re-export but remove all hardcoded `MEMORIES` / `FUTURE` / `G` gradients. Existing imports keep working.
- **Edit** `src/routes/index.tsx` — loader primes the query; component reads via `useSuspenseQuery`; passes memories + meta into existing components.
- **Edit** `src/components/Calendar.tsx`, `DateCardCarousel.tsx`, `DayCard.tsx`, `MemoryDialog.tsx`, `MusicBar.tsx` — accept memories as props (already mostly do); render media from `photos`/`videos` URLs instead of gradients; show placeholder gradient only when a memory has no media.
- **Edit** `src/lib/time.ts` — `FINAL_DATE` stays; add `getLaunchDate(meta)` and `isUnlocked(date, today)` helpers.
- **Add spreadsheet ID** as a runtime secret: `MEMORIES_SHEET_ID` (so the sheet can be swapped without redeploying).

### Connector wiring

1. Link the user's existing Google Sheets connection to the project (`standard_connectors--connect` with `google_sheets`).
2. Server function reads `process.env.LOVABLE_API_KEY`, `process.env.GOOGLE_SHEETS_API_KEY`, `process.env.MEMORIES_SHEET_ID` and calls the gateway. Token refresh is automatic.
3. Cache: TanStack Query `staleTime: 5 minutes` so the sheet is re-read regularly but not on every nav.

### Unlock + render rules (client)

- Today = `new Date()` truncated to local midnight.
- For each date between launch and final:
  - if a sheet row exists and `date <= today` → render full card.
  - if `date <= today` but no row → render "a quiet day" placeholder card (still counts as unlocked).
  - if `date > today` → render locked chain card (title from sheet if present, else generic).
- Calendar lists all days; locked ones are disabled.
- `MusicBar` and the hero subtitle bind to "today's" memory.

## What you get

- Add a row in Google Sheets → memory appears on its date with photos, video, quote, song, unlock message.
- No code edits needed to add days, swap songs, change media, or extend past 2026-06-23.
- Locking, countdown, today-highlight, and calendar all derive from the sheet.

## Setup the user does once (I'll guide step-by-step after approval)

1. Copy the starter sheet template (I'll generate the exact column headers).
2. Paste the spreadsheet ID when prompted (stored as `MEMORIES_SHEET_ID` secret).
3. Connect Google Sheets via the connector picker.
4. Start adding rows — page updates on next refresh.
