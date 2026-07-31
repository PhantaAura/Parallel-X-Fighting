# Validation — Prototype 2.9A.30

## Build

- Build label: `Prototype 2.9A.30 — Arena Identity & Focus Recovery`
- Release cache: `29a30-arena-focus-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.29.2 — Combat HUD & Feedback Unification`

## Passed static and module checks

- 84 JavaScript files passed `node --check`.
- 17 JSON and manifest files parsed successfully.
- 221 relative JavaScript module references were checked with no missing targets.
- 23 local references from `index.html` and `tests/smoke.html` were checked with no missing targets.
- `index.html` uses one release cache ID.
- The Arena module imported successfully under Node.
- All five playable Arena stages passed the existing stage-schema validator.
- Targeted behavior checks passed for Focus Recovery startup, gray-health cap, 5 HP-per-second rate, 2-Energy-per-HP conversion, 0.3-second release recovery, cleanup, and the Training completion condition.
- Targeted source assertions passed for the recovery HUD, mobile safe zone, release lock, CPU approach check, Training recovery controls, stage identity drawing, tournament crowd response, boundary feedback, and Classic-engine action lock.
- 291 browser smoke cases are packaged.

## Browser-suite status

A local browser run was attempted through system Chromium and Playwright. Localhost navigation was blocked by the environment with `ERR_BLOCKED_BY_ADMINISTRATOR`, so the 291-case browser suite is not claimed as run. Use the deployed `tests/smoke.html` page for the complete browser result.

## Required real-device checks

- Hold Block + Charge simultaneously on keyboard, controller, and iPhone touch.
- Confirm gray health, Energy spending, startup, interruption, and release recovery.
- Confirm no attack or special can begin during active Focus Recovery or release recovery.
- Confirm Focus Recovery audio is paced rather than playing every simulation frame.
- Confirm recovery state clears after Training reset, pause/exit, KO, respawn, and Story transition.
- Confirm CPU fighters do not recover while the player is visibly approaching.
- Confirm all five stage cards load their intended stage and camera profile.
- Confirm Global Tournament ring-outs, boundary feedback, crowd reactions, and respawns.
- Confirm wall splat never replaces a Tournament ring-out.
- Confirm Dojo, Facility, and Echo Caverns use distinct wall-impact feedback.
- Confirm the mobile recovery cue avoids health, Energy, hotbar, notch, and Home indicator.
