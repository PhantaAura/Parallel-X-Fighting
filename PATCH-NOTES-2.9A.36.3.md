# Prototype 2.9A.36.3 — Chapter 4 Menu State Recovery

## Fixed
- Chapter 4 Story Menu now obeys `hidden` on desktop, not only mobile.
- Return to Game and the close button now hide a stale visible menu even when JavaScript state incorrectly says it is already closed.
- Chapter 4 transition and HUD panels also obey `hidden` when the chapter deliberately dismisses them.
- Starting or replaying Chapter 4 clears Story Menu, Journal, choices, QTEs, completion, vibration, Watcher, enemy-role, and team-status overlays.
- Chapter completion closes the Story Menu and Journal before presenting results.

- The smoke bootstrap now allows the top-level 350-test module to finish on slower browsers while retaining the per-test stall watchdog.

## Compatibility
- No Story progression, combat, reward, or balance changes.
- Save schema remains 268.
