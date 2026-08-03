# Validation — Prototype 2.9A.40.7.1

## Result
**PASS** — the Chapter 3 sabotage rewrite is packaged with no known automated-test failure.

## Browser smoke suite
- **482 / 482 PASS**
- **0 failures**
- Chromium 144 headless.
- The execution environment blocks direct `localhost`, `file:` and synthetic-domain navigation. Browser validation therefore used the same safe harness used by recent builds: the smoke HTML was loaded into a blank Chromium document with a `https://px.test/tests/` base URL, while Playwright intercepted those resource requests and served the exact files from the package source directory. The smoke-test logic itself was not modified for this environment.

## Static validation
- Game JavaScript modules: **98 / 98 parse**.
- Test JavaScript modules: **2 / 2 parse**.
- Relative ES-module imports: **312 / 312 resolve**.
- `index.html` IDs: **259 total / 259 unique / 0 duplicates**.
- JSON/manifests after release manifest generation: **60 / 60 parse**.
- Active cache identity: `29a4072r-ch1-adventure-playtestlab-20260802`.
- Save schema: **268**.

## Dedicated 2.9A.40.7.1 regression coverage
The suite verifies:
- Chapter 3 begins on deliberate ring sabotage rather than Sage suspicion.
- Three ring clues and concrete witness statements precede Strange Man.
- The second medical-worker conversation contradicts the exact first Plouke/maintenance statement.
- Project Hollow is revealed gradually through maintenance, surveillance, robot and fighter-data infrastructure.
- Sage's trail establishes that he independently followed the same mystery.
- The real Sage remains dominant while lockdown/suppression create the escape danger.
- The blue clone is mandatory Story foundation but grants no clone move and no Shots of Agony.
- The teleporter-room sequence explicitly rejects Object Swap as the lesson.
- The blue clone disappears normally before the unstable teleport fires.
- Echo arrival immediately leads into Rrvvfo's multi-day blackout and Project Hollow's operation window.
- Old mid-facility and completed Chapter 3 saves migrate into one coherent v4 timeline.
- Chapter 4's wake-up continuity remains intact.

## Known scope boundaries
- Chapter 5 is not implemented or modified.
- `blueCloneTechniqueFoundationLearned` is future Story context only; it grants no combat ability.
- Strange Man remains unexplained.
- Project Hollow's main cloning headquarters, Rrvvfo clone, Revvfo target plan and complete objective remain unrevealed.
