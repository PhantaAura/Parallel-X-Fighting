# Validation — Prototype 2.9A.25

## Passed static and behavior checks

- 79 JavaScript files passed `node --check`.
- 8 JSON/web-manifest files parsed successfully.
- 210 relative JavaScript module paths resolve to packaged files.
- 16 local `index.html` references resolve to packaged files.
- `index.html` uses one release query cache ID: `29a25-feel-team-collision-20260730`.
- Five browser/install icon images have the expected dimensions, and the manifest references both install icons.
- 17 targeted source assertions passed for results scoring, merged completion, menu-only debug code, camera reset, hub collision, Chapter 3 evidence sweeps, Chapter 4 teamwork, optional swarms, Rootstone shortcut, Hollow Watcher adaptation, Story-stat soft caps, music variation, future voice labeling, build version, and save schema.
- Ten hub/stage schemas required by Chapters 1–4 are present with bounds.
- Echo Village generates 32 solid collision shapes.
- Direct collision simulation pushed a fighter out of an Echo Village structure.
- Five important Chapter 4 spawn/return positions were checked and begin outside solid scenery.
- Story reward soft-cap behavior passed direct module testing.
- Ryuzankaro remains locked before `villageDefended` and unlocks after the completed defense state.
- The game root and smoke-test page were served successfully through a local HTTP server.
- 264 browser smoke-test cases are packaged in `tests/smoke.js`.

## Browser limitation

The 264-case smoke suite was not executed in the provided headless Chromium environment. Chromium timed out while attempting local navigation, so this release does not claim a full browser pass. Real Safari/Chrome, keyboard, controller, touch, collision, team-battle, and checkpoint testing remains required.

## Recommended first manual checks

1. Run into walls and major scenery in every Chapter 1–4 hub.
2. Complete Chapters 2 and 3 with optional quests and check the rank.
3. Complete a chapter and confirm only one results screen appears.
4. Try the secret code during gameplay and on the Story route menu.
5. Complete the three-wave Echo Village defense with Bark and Wade support.
6. Trigger both optional Project Hollow swarms and reload afterward.
7. Use the Rootstone shortcut and verify Return to Area after a loss.
8. Fight Hollow Watcher while alternating two attacks, then break its scan by changing spacing, timing, and approach.
