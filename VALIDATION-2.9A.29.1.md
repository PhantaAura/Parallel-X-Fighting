# Validation — Prototype 2.9A.29.1

## Build

- Build label: `Prototype 2.9A.29.1 — Pursuit Feel & Stability`
- Release cache: `29a29p2-hud-feedback-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.29 — Pursuit & Combat Identity`

## Passed static and module checks

- 83 JavaScript files passed `node --check`.
- 14 JSON and manifest files parsed successfully.
- 218 relative JavaScript module references were checked with no missing targets.
- 22 local references from `index.html` and `tests/smoke.html` were checked with no missing targets.
- `index.html` uses exactly one release cache ID.
- The Arena module imported successfully under Node.
- Pursuit-rule assertions passed for the exact 15-Energy threshold, cooldown enforcement, Full/Minimal/Off prompt behavior, ring-out wall-splat protection, one-use wall splats, one-use ground bounces, and bounded reactions.
- Training assertions passed for the Ideal Pursuit Combo route and Good/Great/Perfect timing grades.
- Targeted source assertions passed for pursuit-only feedback, lock-on, camera easing, mobile prompt linger, character movement cues, audio ducking, Reset Combat State, dummy defense choices, Chapter 1 refresher coverage, and Sage Manual coverage.
- 286 browser smoke cases are packaged.

## Browser-suite status

A local headless Chromium run was attempted for 45 seconds. Chromium did not produce a completed DOM result before timing out, so the 286-case browser suite is not claimed as run. Use the deployed `tests/smoke.html` page for the complete browser result.

## Required real-device checks

- Keyboard, controller, and touch pursuit buffering
- Exactly 15 Energy versus less than 15 Energy for Pursuit Tech
- Full, Minimal, and Off pursuit prompts
- Mobile safe-area placement and enlarged Dash touch target
- Camera return after hit, miss, Tech, pause, round end, and exit
- One wall splat and one ground bounce per combo
- Chapter 2 tournament ring-outs remaining unchanged
- Rrvvfo, Revvfo, Wade, Bark, Phanta, and Creed movement identity
- Training Reset Combat State and normal reset clearing all temporary state
