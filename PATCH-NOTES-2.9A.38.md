# Prototype 2.9A.38 — Combat Mastery & RPG Rewards

## Direction
Parallels X keeps its Sonic Battle-style real-time combat. This build adds RPG depth around that combat instead of replacing it with turn-based battles.

## Adventure Records
- Added **MASTERY & RECORDS** to Extras.
- Tracks wins, matches, best combo, perfect parries, guard breaks, pursuit finishers, wall splats, ground bounces, final KOs, and fighter signature moments.
- Rrvvfo, Revvfo, Wade, and Bark each keep their own mastery points, best battle rank, wins, best combo, and signature count.
- Records are additive and do not alter Story balance.

## Battle Mastery ranks
- Completed Arena-engine matches now receive **C / B / A / S** mastery grades.
- Ranking considers victory, combo variety, best combo, defensive reads, pursuit finishers, signature mechanics, damage taken, and clean wins.
- The results screen shows the rank, score out of 100, mastery-point award, and important combat records from that match.
- Ranking rewards skill expression instead of raw damage grinding.

## Optional mastery challenges
The existing Training trials now feed a persistent mastery challenge book. There are 15 released challenges:
- Perfect-Parry Trial
- Energy Discipline
- Focus Recovery
- Launch → Pursuit
- Ideal Pursuit
- Wall Splat
- Ground Bounce
- Pursuit Escape
- Pressure Answer
- Break & Punish
- Unpredictable Route
- Rrvvfo — Improvised Angle
- Revvfo — Relentless Pressure
- Wade — Lightning Near-Miss
- Bark — Armored Punish

They remain fully optional. Story completion never requires mastery medals.

## RPG rewards without grind
- The first clear of a challenge grants one mastery medal, mastery points, and a named reward/archive unlock.
- Repeating the same clear does **not** grant farmable mastery points.
- A better rank can replace the saved challenge grade without adding grind rewards.
- Milestones at 1, 4, 8, 12, and 15 unique challenge clears unlock titles/crest rewards in Adventure Records.
- Fighter identity trials award fighter-specific victory-aura reward entries for later cosmetic expansion.

## Save compatibility
- Added `pxMasteryRecordsV1` to the safe export/import allowlist.
- Existing saves begin with empty mastery records and keep all previous Story/progression data.
- Save schema remains **268**.

## Validation
- 364 / 364 browser smoke tests pass.
- 92 JavaScript modules parse.
- 256 relative imports resolve.
- 42 JSON/manifest files parse.
- 259 exact HTML IDs are unique.
