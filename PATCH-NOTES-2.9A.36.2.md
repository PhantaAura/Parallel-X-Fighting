# Prototype 2.9A.36.2 — Chapter 4 False Completion Recovery

## Fixed
- Detects Chapter 4 saves that claim completion without the ending checkpoints.
- The route menu now shows **SAVE REPAIR NEEDED** and **START FRESH** for that contradiction.
- Repair removes only the false Chapter 4 mission/state and Chapter 4 unlock markers.
- Chapters 1–3, Story level, XP, stats, settings, and other saves are preserved.
- The repaired run starts as a normal saveable Chapter 4 playthrough, not temporary Replay.
- Temporary Replay runs are clearly labeled **REPLAY (DOES NOT SAVE)** in the Story Menu.

## Compatibility
- Valid modern completions and legacy completions with an ending checkpoint and Shadow’s Lookout unlock remain complete.
- Save schema remains 268.
