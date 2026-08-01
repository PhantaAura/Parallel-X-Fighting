# Validation — Prototype 2.9A.31.2

## Confirmed
- 85 JavaScript files pass ECMAScript module syntax validation.
- 22 JSON and web-manifest files parse successfully, including the new 31.2 build manifest.
- 223 relative JavaScript module references resolve to existing files.
- 25 local HTML page references resolve to existing files.
- The smoke registry still contains exactly 301 tests.
- Base Lens activates at 60 Energy, 25 HP, and 240 frames when mastery is explicitly zero.
- Lens smoke checks restore the prior `pxLensMasteryV1` value after testing.
- Chapter 4 normalization rejects early Ryuzankaro availability and enables it after the completed village-defense state.
- The runtime defense branch calls `unlockRyuzankaroAfterVillageDefense()`, which records `villageDefended` before deriving quest availability.
- Build version is `Prototype 2.9A.31.2 — Final Smoke Cleanup`; save schema remains 268.
- Active runtime and test assets use cache ID `29a312-final-smoke-cleanup-20260731`.

## Browser limitation
A local Playwright/Chromium run was attempted, but local navigation was blocked by the execution environment with `ERR_BLOCKED_BY_ADMINISTRATOR`. The complete deployed browser run remains required to confirm 301/301.
