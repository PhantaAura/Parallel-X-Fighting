# Quest & Objective Overhaul Report — 2.9A.40.7

## Goal
Reduce the feeling of "follow marker → collect things → return" without destroying quests that already provide variety. The pass applies KEEP / TWEAK / THROW to Chapters 1–4 and uses the connected-world systems added in 40.3–40.6.

## Chapter 1
### KEEP
- Main Road / Forest / Cliff route choice.
- Transport Object Swap rescue.
- Runaway Cart sequence.
- Roadside fight.

### TWEAK
- Cliff-route reward presentation can continue to improve through later Gold Pass tuning.

### THROW
- None. Chapter 1 already has the cleanest mix of traversal, rescue, and combat and should remain the shortest route.

## Chapter 2
### KEEP
- Wade race.
- Festival exhibition.
- Controlled Flame activity.
- Training dummy mastery.
- Fake champion encounter.
- Challenger fight.
- Moving prize-cart activity.

### TWEAK
- **Lost Bracket:** either collect all three records or collect two and reconstruct the missing entry at Tournament Administration.
- **Lost Fan:** either locate Wade or search Market Street and reunite the fan with their family.
- Cracked Ring and Plouke Study remain candidates for deeper Gold Pass tuning rather than being deleted here.

## Chapter 3
### KEEP
- One Last Match.
- Controlled Flame.
- Incident reconstruction.

### TWEAK
- Unpaid Snacks, Pouki Equipment, and Medical Follow-Up retain their premises but remain Gold Pass candidates for stronger world use.

### THROW / REPLACE
The old marker-chain forms of four quests are retired:
- Final Announcement → **signal routing**.
- Cleanup Echoes → **echo triangulation**.
- Fake Ploukes → **observation**.
- Late Fan → **route choice**.

The replacement activities are short and require interpretation rather than walking between arbitrary spawned markers.

## Chapter 4
### KEEP
- Beacon / team repair.
- Party field route.
- Village defense.
- Optional Ryuzankaro boss.
- Hollow Watcher.
- Floating-lookout Object Swap finale.

### TWEAK
- **Old Man Potions:** standard route uses four field catalysts; discovering the Old Apothecary Formula creates a skilled route requiring any two stable catalysts.
- **Mountain Signals:** any two of the three bearings triangulate the Hollow Watcher. The third route is optional exploration.
- Lift-parts material remains a Gold Pass candidate if it still feels like collection busywork in human playtesting.

## Save / migration behavior
- Save schema remains 268.
- Chapter 3 optional quest state is migrated to v3.
- Old incomplete states for the four retired marker-chain quests are reset only within those optional activities so the player receives the new interaction instead of stale markers.
- Existing chapter completion, RPG growth, world discovery, interiors, field skills, revisit rewards, and Ryuzankaro state remain intact.

## Chapter 5 boundary
No Chapter 5 story, bases, stealth, clone scenes, or Shots of Agony prototype unlocks are introduced by this patch.
