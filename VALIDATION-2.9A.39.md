# Prototype 2.9A.39 — Validation

## Release identity
- Build: **Prototype 2.9A.39 — Chapters 1–4 Full Experience Polish**
- Cache: `29a39-full-experience-polish-20260801`
- Save schema: **268**
- Package type: cumulative full repository build; no previous patch required.

## Browser smoke suite
- **373 / 373 PASS**
- Browser: **Chromium 144.0.7559.96 headless**
- Final run was performed after the Chapter 4 replay-reward copy was corrected to state `REPLAY • NO XP`.
- The suite includes regression coverage for the existing Chapter 4 replay/menu/false-completion repairs, first-play Story reliability, mastery records, S/A/B/C/D/E combat ranks, and five new 2.9A.39 full-experience checks.

### Browser harness note
Direct localhost and virtual-host navigation is blocked by the execution environment's administrator policy. Validation therefore used the same packaged test page and test logic through Chromium DevTools Protocol:
1. `Page.setDocumentContent` loaded the smoke shell with a virtual `https://px.test/tests/` base URL.
2. The packaged smoke bootstrap module was injected without modifying its test logic.
3. CDP Fetch interception served the exact packaged repository files from the 2.9A.39 source directory with a virtual HTTPS origin.

An intentional missing-fighter-manifest fallback test requests `assets/fighters/rrvvfo/missing.json`; its expected 404 is not a release failure.

## 2.9A.39 behavior checks
- Chapter pacing profiles are **35–50 min / 70–100 min / 55–80 min / 90–120 min** for Chapters 1–4.
- Chapter 4 is explicitly the longest because its route has the most distinct gameplay phases, not because of mandatory filler.
- Shared Story experience beats cover road travel, tournament progression, Chapter 3 investigation escalation, and Echo Region progression.
- Story S ranks receive the strongest celebration, A ranks receive a short acknowledgement, and B/C/D/E avoid an additional Story overlay.
- The Chapter 4 Bark + Wade recovery interaction is optional and does not increase the **14** required Chapter 4 Story steps.
- First-play party recovery grants **+45 Story XP** once; Replay gives no XP.
- The hidden playtest snapshot reports the active chapter pacing target, cadence, and intended rhythm.

## Static validation
- **93 / 93** JavaScript modules parse with ECMAScript module grammar.
- **260 / 260** relative JavaScript module imports resolve to packaged files.
- **46 / 46** JSON and web-manifest files parse.
- **259** `index.html` IDs checked; **0** duplicates.
- Active runtime files contain no references to the prior `29a38-combat-rank-patch-20260801` cache identity.
- Current build label and cache identity are synchronized across the runtime and smoke suite.

## Result
**PASS — Prototype 2.9A.39 is ready for fresh-save Chapters 1–4 playtesting.**
