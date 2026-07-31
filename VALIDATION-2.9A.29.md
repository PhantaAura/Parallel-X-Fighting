# Validation — Prototype 2.9A.29

## Build

- Build label: `Prototype 2.9A.29 — Pursuit & Combat Identity`
- Release cache: `29a29-pursuit-combat-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.28.1 — Spacious Mobile Story UI`

## Passed static and module checks

- 83 JavaScript files passed `node --check`.
- 13 JSON and manifest files parsed successfully.
- 218 relative JavaScript module references were checked with no missing targets.
- 20 local references from `index.html` and 2 from `tests/smoke.html` were checked with no missing targets.
- `index.html` uses exactly one release cache ID.
- The Arena module imported successfully under Node.
- Pure pursuit-rule assertions passed for bounded chase duration, launcher/heavy windows, one-use wall splats, one-use ground bounces, ring-out protection, and movement identity.
- Training-state assertions passed for linked pursuit finisher, wall-splat, ground-bounce, and pursuit-escape trials.
- Targeted source assertions passed for buffered chase input, incoming-pursuit tech, CPU pursuit defense, reaction-state cleanup, HUD prompts, camera framing, sound cues, Training dummy behavior, and Sage Manual coverage.
- 282 browser smoke cases are packaged.

## Browser-suite status

A local headless Chromium run was attempted. Chromium did not finish before the environment timeout and produced no completed DOM result, so the 282-case browser suite was not claimed as run. Use the deployed `tests/smoke.html` page for the full browser result.

## Required playtests

- Keyboard, controller, and touch pursuit input buffering
- Launcher → Dash → Light → Heavy reliability
- Incoming-pursuit Dash tech at and below 18 Energy
- CPU tech frequency on Easy, Normal, and Hard
- One wall splat and one ground bounce per combo
- Tournament ring-out behavior remaining unchanged
- Rrvvfo, Revvfo, Wade, Bark, Phanta, and Creed movement feel
- Training reset and round cleanup clearing all new state
- Mobile pursuit prompt avoiding health bars and touch controls
