# Prototype 2.9A.31.2 — Final Smoke Cleanup

## Fixed
- Lens smoke checks now force zero mastery only for the duration of each test, then restore the player’s original Lens mastery value. The test page no longer fails because the player legitimately upgraded Lens.
- All Lens tests that temporarily change mastery now restore the previous saved value instead of deleting it.
- Arena Stage Select, Arena controls, Arena diagnostics, and the Sage Manual now read the shared `BUILD_VERSION` rather than displaying hard-coded release labels.
- Ryuzankaro availability is granted by a named Chapter 4 defense-completion helper. It requires both the `villageDefended` required step and the village-defense completion flag.
- The Chapter 4 smoke assertion now validates the actual unlock path without depending on one-line formatting.

## Scope
- No combat damage, Energy costs, Lens gameplay values, Focus Recovery values, pursuit balance, or fighter data changed.
- Save schema remains 268.
- 301 smoke tests remain packaged.
