# Validation — Prototype 2.9A.28.1

## Build

- Build label: `Prototype 2.9A.28.1 — Spacious Mobile Story UI`
- Release cache: `29a28p1-mobile-hub-space-20260730`
- Save schema: `268`

## Passed static checks

- 81 JavaScript source files passed `node --check`.
- `tests/smoke.js` passed `node --check`.
- 12 JSON and manifest files parsed successfully.
- 211 relative JavaScript module references were checked with no missing targets.
- 20 local references from `index.html` and 2 from `tests/smoke.html` were checked with no missing targets.
- `index.html` uses one release cache ID.
- The previous 2.9A.28 release cache ID is absent from active text sources.
- The new mobile Story stylesheet has balanced braces.
- Targeted source assertions passed for:
  - compact two-column mobile hub headers;
  - one Story Menu button per mobile hub;
  - expandable objective details;
  - map-on-demand behavior;
  - full-width scrollable Story sheets;
  - horizontal technique-card rails;
  - single-column mobile journals and case boards;
  - safe-area-aware full map and tracker layouts.
- 279 browser smoke cases are packaged.

## Browser-suite status

A local headless Chromium smoke run was attempted, but Chromium did not finish before the environment timeout and produced no completed DOM result. The 279-case browser suite therefore still needs to be run from the deployed smoke-test page or a normal browser.

## Required device checks

- iPhone Safari and Home Screen launch
- Portrait and landscape hub HUD spacing
- Objective detail expand/collapse
- Chapter 1–4 Story-menu scrolling
- Full-map safe-area fit
- Touch controls remaining clear of objectives and prompts
- Desktop Story HUD remaining unchanged
