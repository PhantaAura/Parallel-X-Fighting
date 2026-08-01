# Validation — Prototype 2.9A.32

## Build

- **Name:** Prototype 2.9A.32 — Hub Charm & Progression Celebration
- **Base:** Prototype 2.9A.31.3 — Save, Stage, Chapter 4 & Fallback Reliability
- **Cache ID:** `29a32-hub-charm-progression-celebration-20260731`
- **Save schema:** 268

## Confirmed

- All 86 JavaScript files parse with ECMAScript module grammar.
- All JSON manifests and `site.webmanifest` parse successfully.
- All relative JavaScript imports resolve to packaged files.
- `index.html` contains no duplicate element IDs.
- The active index, smoke page, smoke bootstrap, smoke module, and runtime imports use the 2.9A.32 cache identity.
- The browser smoke registry, progress UI, and runner all declare 317 tests.
- The complete browser suite finished at **317 / 317 passed, 0 failed**.
- Save-export schema remains 268.
- Favicon and install-icon files are present and non-empty.

## Direct runtime checks

- Destination-arrival presentation becomes visible with the correct title and detail.
- Opening a Story menu clears active charm presentation without freezing the page.
- The future fighter-unlock API displays a `NEW FIGHTER` celebration correctly.
- Chapter 4 legacy state normalizes into state version 4 without losing Ryuzankaro checkpoint protection.

## 2.9A.32 coverage

- Shared Story arrival, banter, progression, route, and future-character celebration layer.
- State-aware Chapter 2 NPC chatter and festival decoration intensity.
- Festival Photo Stand with three character-driven choices and a persistent team photo.
- Chapter 3 area-arrival presentation for the after-hours grounds, Resonance Facility, and Remote Highlands.
- Echo Chime Jam with a short rhythm QTE and no item-fetch requirement.
- Echo Village villagers, banners, beacon energy, lift construction, and chime visuals react to Story progress.
- Level, permanent-stat, technique, chapter, mode, route, and future fighter unlock presentation.

## Browser execution note

The environment blocks direct navigation to local web servers. The complete smoke suite was therefore run in headless Chromium with local request interception and an in-memory storage shim. The smoke page itself reached its normal terminal state: `Initial run complete — all tests passed`.
