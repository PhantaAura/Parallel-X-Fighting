# Validation — Prototype 2.9A.39.1
## Chapter 4 Ending Continuity Patch

### Browser smoke suite

- **379 / 379 PASS**
- **0 failures**
- Chromium 144 headless
- Because direct localhost/file navigation is blocked in the execution environment, the suite was loaded with `Page.setDocumentContent`, a `https://px.test/tests/` base URL, and CDP Fetch interception serving the exact packaged local files. The smoke-test logic itself was unchanged.

The new regression coverage verifies that:

- the summit still requires the pebble Object Swap sequence;
- the sequence remains **CHARGE → RELEASE → LOCK → OBJECT SWAP**;
- Object Swap lands on the floating lookout and returns player control;
- Shadow’s entrance is a separate player interaction;
- the final Chapter 4 dialogue is the one-line Shadow arrival;
- Rrvvfo enters a visible knockdown/collapse state before the fade;
- the old Shadow exposition does not leak into the new ending;
- Ryuzankaro does not create a separate final scene;
- `shadowArrival` is the modern required ending evidence;
- old fully completed saves migrate safely;
- partial/corrupted lookout saves cannot bypass Object Swap;
- old completed Chapter 4 saves remain recognized as completed.

### Static validation

- **93 / 93 JavaScript modules parse**
- **260 / 260 relative JavaScript imports resolve**
- **47 / 47 JSON/web-manifest files parse**
- **259 HTML IDs**, **0 duplicates**
- Old active cache references: **0**
- Cache identity: `29a391-chapter4-ending-continuity-20260801`
- Save schema: **268**

### Release integrity

The release is a cumulative repository build. No previous patch is required. ZIP integrity is checked after packaging with `unzip -tq`.
