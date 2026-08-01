# Prototype 2.9A.37 — First-Play Story Reliability & RPG Flow

## Story reliability
- FIRST PLAY, REPLAY, and PLAYTEST are now explicit runtime modes.
- Temporary runs are marked as non-saveable in diagnostics.
- Contradictory Chapter 4 completion markers are stripped before persistence instead of allowing the route to become falsely complete.
- Earlier chapters, Story level, XP, partial Chapter 4 progress, and unrelated unlocks remain intact when that guard runs.
- The secret playtest menu reports save health, run mode, checkpoint order, and per-chapter completion state.

## RPG pacing
- Chapter results now include an Adventure Beat afterglow rather than acting only as a score screen.
- Each released chapter summarizes what changed in the world and points toward the next leg of the journey.
- Optional Ryuzankaro completion is acknowledged in Chapter 4's afterglow.
- Normal chapter progression still waits for the player to choose CONTINUE JOURNEY before chaining forward.

## Scope
- Chapters 1–4 story events are unchanged.
- No Chapter 5 plot details were invented.
- Save schema remains 268.
