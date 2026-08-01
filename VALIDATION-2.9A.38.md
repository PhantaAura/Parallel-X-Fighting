# Validation — Prototype 2.9A.38

## Build
- **Prototype 2.9A.38 — Combat Mastery & RPG Rewards**
- Cache ID: `29a38-combat-rank-patch-20260801`
- Save schema: **268**

## Browser smoke suite
- **364 / 364 PASS**
- The complete packaged suite was executed in headless Chromium using an intercepted virtual HTTPS origin because direct localhost navigation is blocked in this execution environment.
- No smoke case was skipped or shortened.

## Static validation
- **92 / 92 JavaScript modules parse with ECMAScript module grammar.**
- **256 / 256 relative imports resolve.**
- **44 / 44 JSON and manifest files parse.**
- **259 exact HTML IDs checked; no duplicates.**
- Active page, smoke bootstrap, smoke module, and centralized build info use the 2.9A.38 cache identity.

## Mastery confirmed
- Battle sessions record real-time combat events rather than fake menu scores.
- Battle results grade C / B / A / S and persist mastery points.
- Perfect parries, guard breaks, pursuit finishers, wall splats, ground bounces, signature mechanics, best combo, damage taken, and wins feed the record system.
- Fifteen optional Training/mastery challenges persist completion and grade.
- Duplicate clears cannot farm mastery points.
- Better challenge ranks can replace older grades.
- Milestone rewards unlock from unique challenge clears.
- Adventure Records renders fighter mastery, optional challenge status, totals, and rewards.

## Save compatibility confirmed
- `pxMasteryRecordsV1` exports and imports through the existing validated save system.
- Existing saves remain valid because the mastery key is additive.
- Save schema remains 268.

## Scope
- Combat remains Sonic Battle-style real-time action.
- No turn-based combat conversion was added.
- Mastery is optional and never blocks Story chapters.
- No equipment grind, random loot, daily challenge, or online leaderboard system was added.
