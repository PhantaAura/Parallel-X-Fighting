# Validation — Prototype 2.9A.37

## Build
- **Prototype 2.9A.37 — First-Play Story Reliability & RPG Flow**
- Cache ID: `29a37-first-play-story-reliability-rpg-flow-20260801`
- Save schema: **268**

## Browser smoke suite
- **356 / 356 PASS**
- The complete packaged suite was executed in headless Chromium using an intercepted virtual HTTPS origin because direct localhost navigation is blocked in this execution environment.
- No smoke case was skipped or shortened.

## Static validation
- **91 / 91 JavaScript modules parse with ECMAScript module grammar.**
- **257 / 257 relative imports resolve.**
- **41 / 41 JSON and manifest files parse.**
- **259 HTML IDs checked; no duplicates.**
- Active page, smoke bootstrap, smoke module, and centralized build info use the 2.9A.37 cache identity.

## Story reliability confirmed
- FIRST PLAY is reported as a saveable run.
- REPLAY and PLAYTEST are reported as temporary, non-saveable runs.
- Chapter order and checkpoint order are exposed in the hidden playtest inspector.
- A modern partial Chapter 4 state cannot pass as a legacy completed save.
- Contradictory Chapter 4 completion markers are removed before persistence.
- The reliability guard preserves Chapters 1–3, Story level, XP, and partial Chapter 4 progress.
- Genuine old completion-only Chapter 4 saves remain supported through the legacy evidence path.

## RPG flow confirmed
- Chapter results require player input before Story chaining continues.
- Results include a short Adventure Beat showing what changed and where the journey goes next.
- Chapters 1–4 each have distinct afterglow text.
- Optional Ryuzankaro completion is acknowledged in Chapter 4's afterglow.
- No artificial timers, slower movement, or extra fetch requirements were added for pacing.

## Scope
- Chapters 1–4 story events remain unchanged.
- Chapters 5–8 remain undescribed until their official Story plans exist.
- Save schema remains 268.
