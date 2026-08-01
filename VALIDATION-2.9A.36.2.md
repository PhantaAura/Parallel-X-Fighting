# Validation — Prototype 2.9A.36.2

## Build
- **Prototype 2.9A.36.2 — Chapter 4 False Completion Recovery**
- Cache ID: `29a362-chapter4-false-completion-recovery-20260801`
- Save schema: **268**

## Confirmed
- Contradictory Chapter 4 completion markers are detected.
- False completion no longer raises the route to 4/8 or blocks Continue from returning to Chapter 4.
- Repair removes only `rrvvfo-04`, Chapter 4 state, and Chapter 4-specific unlock markers.
- Chapters 1–3 remain completed.
- Story level, XP, bonus stats, settings, and non-Chapter-4 data remain unchanged.
- A repaired Chapter 4 starts as a normal saveable run, not temporary Replay.
- Valid completed saves retain Replay.
- Valid completed saves also receive a confirmed **START FRESH** option.
- Temporary Replay is labeled **REPLAY (DOES NOT SAVE)** and provides **START CHAPTER 4 FRESH** in the Story Menu.
- The previous completion, choice, and QTE overlay fix remains active.

## Automated validation
- Browser smoke suite: **347 / 347 passed**
- JavaScript modules parsed: **90 / 90**
- Relative module imports resolved: **252 / 252**
- JSON and web-manifest files parsed: **37 / 37**
- HTML IDs checked: **259**, no duplicates
- Save schema remains **268**

## Manual recovery path
1. Open Rrvvfo's route.
2. On Chapter 4, choose **START FRESH**.
3. Confirm **RESET CHAPTER 4**.
4. Confirm the chapter starts at Lower Echo Region without a Replay warning.
5. Open the Story Menu and confirm it does not say `REPLAY (DOES NOT SAVE)`.
