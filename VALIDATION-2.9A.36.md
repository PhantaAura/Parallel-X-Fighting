# Validation — Prototype 2.9A.36

## Release identity
- Build: **Prototype 2.9A.36 — Playful Exploration & Quest Variety**
- Cache ID: `29a36-playful-exploration-quest-variety-20260801`
- Save schema: **268**
- This is a cumulative build; no older ZIP is required.

## Automated validation
- **343/343 browser smoke tests passed** with 0 failures.
- **90/90 JavaScript modules** parse with ECMAScript module grammar.
- **247/247 relative imports** resolve to packaged files.
- **33/33 JSON and manifest files** parse successfully.
- **259 HTML IDs** were checked with no duplicates.
- Active build, cache, smoke-runner, manifest, and save-export labels are synchronized.
- ZIP integrity is checked after packaging.

## Quest-variety coverage
- Chapter 1 requires the playable Runaway Tournament Cart beat and provides a safe retry.
- Chapter 2 requires the Festival Technique Exhibition before registration and stores its rank/poster.
- Chapter 3 preserves confirmed evidence during the five-event incident reconstruction.
- Chapter 4 requires Bark, Wade, and Rrvvfo field actions before the caverns.
- Older Chapter 2 and Chapter 4 saves migrate forward without repeating completed Story progress.
- Each signature activity leaves a persistent visual result in its hub.

## Browser-run method
The suite was executed in Chromium 144 using the packaged files on an intercepted virtual HTTPS origin because this container blocks direct localhost and `file:` navigation. The game code and all module requests were served from the release directory without changing test logic.

## Human playtest still required
Automated checks establish correctness, not fun. Use `FRIEND-PLAYTEST-CHECKLIST-2.9A.36.md` to judge timing fairness, clarity, pacing, and whether each activity feels meaningfully different from a fetch quest.
