# Validation — Prototype 2.9A.29.2

## Build

- Build label: `Prototype 2.9A.29.2 — Combat HUD & Feedback Unification`
- Release cache: `29a29p2-hud-feedback-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.29.1 — Pursuit Feel & Stability`

## Passed static and module checks

- 83 JavaScript files passed `node --check`.
- 15 JSON and manifest files parsed successfully.
- 218 relative JavaScript module references were checked with no missing targets.
- 23 local references from `index.html` and `tests/smoke.html` were checked with no missing targets.
- `index.html` uses one release cache ID.
- The Arena module imported successfully under Node.
- Pursuit-balance assertions passed for the fixed 15-Energy threshold, prompt modes, ring-out wall-splat protection, and ground-bounce rules.
- Targeted source assertions passed for Perfect Parry, Guard Break, Pursuit Tech, Wall Splat, Ground Bounce, full-Energy, critical-health, selected-ability, cooldown-ready, mobile safe-zone, and HUD-reduction hooks.
- 287 browser smoke cases are packaged.
- ZIP integrity passed after packaging.

## Browser-suite status

A local headless Chromium run was attempted for 45 seconds. Chromium did not produce a completed DOM result before timing out, so the 287-case browser suite is not claimed as run. Use the deployed `tests/smoke.html` page for the complete browser result.

## Required real-device checks

- Event icon timing and cleanup after pause, reset, round end, and exit
- Mobile safe-area placement on iPhone landscape
- Pursuit prompt and ability-row separation
- Guard-break and Energy-spend bar reactions
- Full-Energy and critical-health cues firing once per threshold crossing
- Selected ability and cooldown-ready emphasis
- Mode/Route carousel center-card focus
