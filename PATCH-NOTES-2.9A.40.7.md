# Prototype 2.9A.40.7 — Quest & Objective Overhaul

This cumulative patch uses the connected-world, interior, field-skill, and revisit systems from 2.9A.40.3–40.6 to reduce repetitive fetch/marker objectives across Chapters 1–4.

## Design rule
Every quest should earn its place through at least one of these: interesting movement, combat, decision, puzzle, character interaction, or discovery. Existing quests that already do this are preserved rather than rewritten unnecessarily.

## Chapter 1 — mostly KEEP
- Keeps route choice, cliff platforming, transport Object Swap, Runaway Cart rescue, and roadside combat.
- No forced redesign of the chapter simply to increase quest count.

## Chapter 2 — multi-route objectives
- **Lost Bracket:** find all three physical records OR find two and reconstruct the missing entry inside Tournament Administration.
- **Lost Fan:** resolve the problem through Wade OR locate the fan's family in Market Street.
- Existing Wade race, exhibition, Controlled Flame, dummy mastery, fake champion, challenger, and moving prize-cart activities remain.

## Chapter 3 — remove weak marker chains
Four old marker-chain errands are replaced:
- **Final Announcement:** signal-routing choice.
- **Cleanup Echoes:** echo-triangulation activity.
- **Fake Ploukes:** observation challenge.
- **Late Fan:** route-choice activity.

Old incomplete saves on those activities restart safely on the redesigned version instead of inheriting stale collection-marker progress.

## Chapter 4 — knowledge creates shortcuts
- **Old Man Potions:** normal route still supports four field catalysts; discovering the Old Apothecary Formula reduces the requirement to any two stable catalysts.
- **Mountain Signal Trail:** any two of the three signal paths are enough to triangulate the Hollow Watcher. The third bearing becomes optional world knowledge rather than mandatory busywork.
- Village defense, party field route, Hollow Watcher, Ryuzankaro optionality, and the floating-lookout ending are preserved.

## Technical
- New `quest-overhaul.js` centralizes quest-audit and alternate-route rules.
- Chapter 3 optional quest state advances to v3 for safe migration.
- Save schema remains **268**.
- Chapter 5 is untouched.
- Browser smoke suite: **472 / 472 PASS**.
