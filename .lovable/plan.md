## Plan

1. **Fix date slot generation at the source**
   - Update `src/lib/memory-types.ts` so `buildSlots()` no longer creates local-time `Date` objects from `YYYY-MM-DD` strings.
   - Add a small `nextDay(iso)` helper that increments ISO calendar dates using `Date.UTC` only.
   - Keep all unlock comparisons as plain ISO string comparisons (`cursor <= end`, `cursor > today`, `cursor === today`).
   - Confirm `todayIso()` remains the single IST-based “today” helper in this module.

2. **Make carousel and locked-card date labels timezone-explicit**
   - Update `src/components/DateCardCarousel.tsx` with a shared `formatDateLabel()` helper.
   - Format `memory.date` and locked-card dates via `Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", ...opts })`.
   - Replace the existing `new Date(date + "T12:00:00")` label formatting in both `DateCard` and `LockedDayCard`.

3. **Replace impossible Spotify “forced autoplay” expectation with correct UX**
   - Update `src/components/MusicBar.tsx` so the Spotify embed auto-expands whenever `visible && spotifyId` is true.
   - Keep `autoplay=1`, `loading="eager"`, and `key={spotifyId}` for browsers/sessions where Spotify can honor it.
   - Add a lightweight pulsing `tap ▶ to play` nudge overlay on the embed, resetting when the track changes.
   - Keep the iframe remounted per track, and preserve the collapsed bar toggle.
   - Add the required icon imports (`Music2`, `X`) if used by the updated controls.

4. **Verify the targeted behavior**
   - Check the code for any remaining direct `new Date().toISOString().slice(0, 10)` usage that could bypass IST today logic.
   - Validate TypeScript syntax/imports for the three edited files.
   - Confirm the resulting UX matches the browser autoplay limitation: first visit requires a tap, later allowed sessions can autoplay.