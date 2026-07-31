# Validation — Prototype 2.9A.30.1

## Build

- Build label: `Prototype 2.9A.30.1 — Stability & Interface Cleanup`
- Release cache: `29a301-stability-cleanup-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.30 — Arena Identity & Focus Recovery`

## Validation coverage

- 84 JavaScript files passed `node --check`, including the browser smoke suite.
- 18 JSON and web-manifest files parsed successfully.
- 166 relative ES-module references were checked with no missing targets.
- 24 local `src`/`href` references from `index.html` and `tests/smoke.html` were checked with no missing targets.
- `index.html` uses one active release cache ID.
- 33 targeted behavior and source assertions passed for startup-only cancellation, active release recovery, unavailable recovery fallback, unsafe-state cancellation, current-channel totals, Story restart scaling, stage cameras, Training knockout cleanup, percentage-based CPU recovery, open-stage wall behavior, size labels, mobile prompt lanes, collapsible Training, and mobile Stage Select.
- 297 browser smoke cases are packaged.
- ZIP integrity and checksum are checked after packaging.

## Browser-suite status

The browser smoke suite is packaged but is not claimed as run in this environment. Use the deployed `tests/smoke.html` page for the complete browser result.

## Required device checks

- Restart scaled Story fights in Chapters 2–4 and confirm both fighters keep their intended maximum HP.
- Hold Block + Charge with no gray health and confirm Block still works.
- Begin recovery startup, move before healing, stop, and confirm the full startup must begin again.
- Tap Block + Charge briefly and confirm no release-recovery lag occurs.
- Recover twice and confirm the cue starts each new channel from `+0 HP`.
- Trigger a Training knockout and confirm gray health cannot reappear from the previous life.
- Confirm Mountain Path produces no invisible-wall splat.
- Confirm every stage opens with stable camera framing.
- On iPhone landscape, confirm pursuit, recovery, event, and edge cues do not overlap.
- Collapse and reopen the Training drawer.
- Navigate every Stage Select card with the mobile arrows.
