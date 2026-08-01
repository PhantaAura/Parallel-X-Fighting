# Validation — Prototype 2.9A.31.3

## Confirmed package integrity
- 85 JavaScript files pass ECMAScript module syntax validation.
- 23 JSON and web-manifest files parse successfully, including the 31.3 build manifest and full-chain manifest.
- 224 relative JavaScript module references resolve to existing files.
- 26 local HTML page references resolve to existing files.
- No duplicate HTML IDs were found.
- 5 manifest image references resolve to packaged files.
- Build version is `Prototype 2.9A.31.3 — Save, Stage, Chapter 4 & Fallback Reliability`.
- Active cache ID is `29a313-save-stage-ch4-reliability-20260731`.
- Save schema remains 268.

## Requested 2.9A.31 release checks
- **Basic attack buffering:** PASS. A late Light input entered during recovery is retained and chains when the recovery window opens.
- **Fighter identity:** PASS. Rrvvfo, Revvfo, Wade, and Bark return four distinct combat-feel signatures covering rhythm, recovery, movement weight, and effect identity.
- **Instant Rematch:** PASS. Match score, round state, results state, and fighter state reset for a fresh rematch.
- **Random Rematch in Story:** PASS. Random Rematch is hidden and rejected whenever the battle is created with Story-safe `allowRandomRematch=false`.
- **Victory animation reset:** PASS. Victory-pose and victory-timer state clear when the battle resets.
- **Fighter Identity Guide:** PASS. The guide opens and closes without changing Training's paused state or trapping input.

## Full browser smoke suite
- **309 / 309 PASS.** The complete suite reached `Initial run complete — all tests passed` in a Chromium browser using a local virtual-origin route to the packaged files.
- The suite completed with 309 passes, 0 failures, no unhandled page errors, and no timeout contamination.
- A Chapter 4 replay assertion uncovered one real release-candidate mismatch. The Chapter 4 constructor now keeps `replayMode` specific to replay while initializing the temporary Playtest Hub with its own clean state. The complete 309-test suite passed after this repair.

## Save, stage, and fallback checks
- All 16 managed save keys export and reset correctly.
- Incompatible save schema values are rejected.
- Failed Story writes return the previous verified checkpoint.
- The shared public Stage list contains exactly five stages.
- Ring-outs are data-driven through stage boundary profiles.
- Asset-less fighters use configured fallback accents without requesting unsupported sprite manifests.

## Deployment status
The release candidate is verified, but the connected GitHub integration rejected branch, Git-tree, and Contents writes with HTTP 403 (`Resource not accessible by integration`). No claim of a live GitHub Pages deployment is made by this report.
