## Goal

1. Music starts automatically once the user taps "Tap to Begin".
2. Minimizing/hiding the music bar must NOT stop playback.

## Root causes

- In `src/components/MusicBar.tsx`, the expanded player is wrapped in `<AnimatePresence>` and unmounts the `<iframe>` when `expanded` is false → playback stops on minimize.
- Spotify's embed only autoplays after a user gesture in the current session. "Tap to Begin" is that gesture, but we don't currently propagate it as a signal that allows the iframe to play immediately on first mount.

## Changes

### 1. `src/components/MusicBar.tsx` — keep iframe always mounted

- Remove the inner `<AnimatePresence>` around the expanded player.
- Render the iframe container unconditionally whenever `spotifyId` exists; animate only `height`, `opacity`, and `marginBottom` between collapsed (0 / hidden / pointer-events-none) and expanded (152px / visible) states using a single `motion.div`.
- `overflow: hidden` on the wrapper so the collapsed state visually disappears but the iframe stays in the DOM and keeps playing.
- Keep `key={spotifyId}` on the iframe (still remounts only when the track itself changes, which is the desired behavior).
- Keep `autoplay=1`, `loading="eager"`, `allow="autoplay; ..."`.
- The collapse button now just toggles the wrapper's animated height — it never unmounts the iframe.
- Keep the existing "tap ▶ to play" nudge for first load when the browser blocks autoplay.

### 2. `src/routes/index.tsx` — surface the Begin gesture to MusicBar

- Pass `started` into `MusicBar` as a new `autoStart` prop (or reuse the existing `visible={started && ...}` — `visible` already implies Begin was tapped, so no extra prop is strictly needed).
- Confirm `MusicBar` mounts only after `started` is true so the iframe's first load coincides with the user gesture, satisfying Spotify's autoplay policy. Today `visible` already gates this — verify and leave as is.

## Out of scope

- No changes to memory data, carousel, calendar, or date logic.
- No new dependencies.

## Files

- `src/components/MusicBar.tsx` — restructure expanded section to persistent, height-animated wrapper.
- `src/routes/index.tsx` — verify `visible` gating; no behavior change expected unless needed.
