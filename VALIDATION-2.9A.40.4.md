# Validation — Prototype 2.9A.40.4 — Buildings, Interiors & World Life

## Browser smoke suite

- **442 / 442 PASS**
- **0 test failures**
- Browser: Chromium 144-class headless validation environment
- Direct localhost/file navigation is blocked in the validation environment. The smoke page was loaded through the established `https://px.test/tests/` CDP interception harness serving the exact local build files. Test logic was unchanged.
- Two console network errors are expected from the smoke test that deliberately requests `assets/fighters/rrvvfo/missing.json` to verify fallback behavior. That test passes.

## Static validation

- **95 / 95 game JavaScript modules parse**
- **2 / 2 test JavaScript modules parse**
- **97 / 97 total JavaScript modules parse**
- **293 / 293 relative imports resolve**
- **53 / 53 JSON/manifest files parse before current 2.9A.40.4 manifest/verification are written**
- **259 / 259 HTML IDs are unique**
- **0 duplicate HTML IDs**

## Release identity

- Build: `Prototype 2.9A.40.4 — Buildings, Interiors & World Life`
- Cache: `29a404-buildings-interiors-world-life-20260802`
- Save schema: **268**
- Story interior state version: **2**
- Connected-world state version: **2**
- Cumulative build: **Yes**
- Chapter 5 Story content: **Not added**

## New regression coverage

The 40.4 suite checks:

1. released building definitions and chapter availability;
2. real clinic rooms and medical-worker placement;
3. solid runtime exterior collision;
4. interior visit/door-state persistence;
5. true local interior Story Map mode;
6. Chapter 2 enter/exit/menu integration;
7. Chapter 3 main/revisit/optional medical interactions inside the clinic;
8. Chapter 4 apothecary/homes/locked-door behavior;
9. state-aware world-life dialogue;
10. clinic/backstage exterior landmark art;
11. hidden Region/World tabs during local interior maps;
12. synchronized build/cache/save identity.
