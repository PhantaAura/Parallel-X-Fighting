# Prototype 2.9A.40.1 Validation

## Browser smoke suite
- **407 / 407 PASS**
- Chromium headless was run against the exact packaged files through the existing virtual `https://px.test/` request-interception harness because direct local/localhost navigation is restricted in the execution environment.
- The test logic itself was not replaced with mocks; package requests were served from this release directory.

New regression coverage includes:
- Custom Build 4-technique / 2-passive normalization and persistence.
- Build Lab locked and unlocked states.
- Story-menu Build Lab entry points in Chapters 1–4.
- Build switching blocked during Chapter 2/3/4 combat and Chapter 4 QTEs.
- Player-facing chapter identity presentation.
- Archetype icons and silhouette differences.
- Chapter 2 opponent-role presentation.
- Chapter 4 manual target cycling across keyboard/controller/touch paths.
- Support heal telegraph and real interruption behavior.
- Chapter 1 experiential Flow Cancel teaching.
- Chapter-specific Adventure Mission result language.

## Static validation
- **92 / 92** game JavaScript modules parse.
- **2 / 2** test JavaScript modules parse.
- **271 / 271** relative imports resolve.
- **259 / 259** HTML IDs are unique.
- **0** duplicate HTML IDs.
- All existing JSON/manifests parsed before generation of this validation file.
- No active source/test/index references remain to the old `29a40-core-fun-overhaul-20260801` cache tag.

## Compatibility
- Build: `Prototype 2.9A.40.1 — Builds & Combat Readability`
- Cache: `29a401-builds-readability-20260801`
- Save schema: **268**
- Cumulative build: yes.
