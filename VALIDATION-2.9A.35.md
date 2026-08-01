# Validation — Prototype 2.9A.35

## Automated browser suite
- **336 / 336 passed** in Chromium.
- The browser suite ran from an intercepted local release origin because normal localhost navigation is restricted in this environment.
- No test failures or fatal runner errors were reported.

## Source and package checks
- **89 / 89 JavaScript files** parse with ECMAScript module grammar.
- **238 relative JavaScript imports** resolve to packaged files.
- All JSON and manifest files parse.
- `index.html` contains no duplicate element IDs.
- Build label and cache identity are synchronized across the game and smoke runner.
- Smoke runner declarations and registered cases both equal **336**.
- Save export schema remains **268**.

## RPG pacing coverage
- Chapter 2 orientation requires Central Plaza, three total districts, and two conversations.
- Chapter 3 orientation requires the Main Arena plus another after-hours district.
- Chapter 4 orientation requires both the Resonance Wall and Water Channel.
- Quest waves remain unlocked when moving into aftermath phases.
- Chapter 2 registration, Chapter 3’s first lead, and Chapter 4 party arrival respect orientation state.
- Chapter 4 legacy saves that already reached Bark and Wade migrate past the new orientation gate.
- Chapter 1 keeps its lighter journey structure while storing phase progress safely.

## Human judgment still required
Automation cannot prove that pacing feels emotionally effective. Use the included friend-playtest checklist to judge:
- whether orientation feels natural rather than restrictive,
- whether aftermaths are long enough to register without becoming waiting,
- whether quest waves improve discovery,
- and whether each hub has enough space to establish its own identity.
