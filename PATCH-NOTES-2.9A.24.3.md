# Prototype 2.9A.24.3 — Ryuzankaro Quest Gate Fix

## Fixed

- The Old Man’s Potions and Ryuzankaro secret boss are now strictly unavailable before the mandatory Echo Village defense.
- Removed the fallback that could mark the quest available from the mountain-departure handler.
- Added runtime guards to both the Old Man interaction and the mountain gate.
- Chapter 4 save normalization now forces the quest to remain locked before `villageDefended` and unlocks it after that state is complete.
- Updated the failing smoke test to verify actual locked/unlocked save behavior and both runtime guards.

## Compatibility

- Save schema remains 266.
- Existing Chapter 4 saves are reconciled automatically.
- All 2.9A.24.2 camera-comfort changes remain included.
