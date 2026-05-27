# Three bug fixes for june-bloom

## Bug 1 — Spotify autoplay & track switching

**File:** `src/components/MusicBar.tsx`

- Append `&autoplay=1` to the Spotify embed src (already present per earlier summary — verify and keep).
- Change iframe `loading` attribute to `"eager"` so it mounts immediately instead of lazy-loading after scroll.
- Add `key={spotifyId}` to the iframe element so React fully remounts it when the track changes, forcing Spotify to load and autoplay the new track instead of keeping the old player instance.

## Bug 2 — Music doesn't sync when swiping carousel / calendar picks open dialog

Root cause: `DateCardCarousel` owns `activeDate` as private state, so `index.tsx` can't know which memory is currently centered. Music is therefore tied to `current` (today) or to `openMemory` (dialog), never to the swiped card. Calendar also opens a separate dialog instead of navigating the carousel.

**File:** `src/components/DateCardCarousel.tsx`
- Convert to a controlled component: accept `activeIndex: number` and `onActiveChange: (i: number) => void` props.
- Replace internal `useState(activeDate)` with the prop; call `onActiveChange` from `snap()` and dot buttons.
- Keep `initialIndex` only as a fallback when uncontrolled.

**File:** `src/routes/index.tsx`
- Lift state: `const [activeIndex, setActiveIndex] = useState(unlocked.length - 1)`.
- Pass `activeIndex` + `onActiveChange={setActiveIndex}` to `<DateCardCarousel>`.
- Derive `activeMemory = unlocked[activeIndex] ?? current` and feed `MusicBar` from it (replacing the current `openMemory ?? current` for the carousel-driven path).
- Calendar `onPick(d)`: instead of `setOpenMemory(m)`, find the index of `d` within `unlocked` and call `setActiveIndex(idx)` + close the calendar. The dialog path is no longer used for calendar picks; the carousel scrolls to that day and the music bar follows automatically.
- Keep `MemoryDialog` mount for any other future trigger, but calendar no longer opens it.

When `activeIndex` changes from outside (e.g., calendar pick), the carousel's `useEffect` on `activeDate`/`stepRef` must re-run the `animate(xOuter, ...)` snap so the swipe visually follows. Add an effect that animates to the new controlled `activeIndex`.

## Bug 3 — Wrong start date (off-by-one) & carousel landing on wrong card

Two sub-causes:

**3a. Carousel default index** — `initialIndex` defaults to `memories.length - 1`, but when memories include unreleased days this lands on the wrong card. With the controlled refactor above, `index.tsx` sets `activeIndex` to the index of today within `unlocked` (which excludes locked days), so the carousel always lands on today.

**3b. Timezone off-by-one with `YYYY-MM-DD`** — `new Date("2026-06-23")` parses as UTC midnight, which renders as the previous day in IST/PST. 

**Files:** `src/components/DateCardCarousel.tsx` (both `DateCard` and `LockedDayCard` weekday/date label construction)
- Change `new Date(memory.date)` → `new Date(memory.date + "T12:00:00")` everywhere a date-string is converted for display formatting (weekday + month/day labels). Noon avoids DST/timezone day flips.
- Audit `Calendar.tsx` and `MemoryDialog.tsx` for the same pattern and apply the `T12:00:00` fix where date strings are parsed for display.

## Verification

- Swipe carousel → MusicBar title/artist/spotifyId updates → new track autoplays.
- Open calendar, pick a past day → calendar closes, carousel scrolls to that day, music updates. No dialog opens.
- Carousel opens centered on today (not yesterday, not last memory in sheet).
- Weekday labels match the actual date in IST.
