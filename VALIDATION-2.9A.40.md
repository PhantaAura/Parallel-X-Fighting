# Validation — Prototype 2.9A.40 Core Fun Overhaul

## Result

**PASS**

- Browser smoke suite: **397 / 397 PASS**
- JavaScript module syntax: **94 / 94 PASS**
- Relative module imports: **269 / 269 RESOLVED**
- JSON / manifest parse: **50 / 50 PASS**
- `index.html` IDs: **259 unique / 0 duplicates**
- Save schema: **268**
- Release cache: `29a40-core-fun-overhaul-20260801`

## Browser test method

The execution environment blocks normal local-file/localhost browser navigation. The smoke suite was therefore run in headless Chromium using the packaged `tests/smoke.html` with a virtual `https://px.test/` base and request interception that serves the exact files from this build directory. Test logic was not changed.

The browser emitted one resource 404 console message during the harness run, but the complete test suite still reached **397/397 PASS** and no smoke assertion depended on the missing incidental resource.

## New 2.9A.40 coverage

The new regression checks verify:

1. Four distinct chapter gameplay identities.
2. Six enemy archetypes with materially different tactical data.
3. Three Rrvvfo build presets, each containing four techniques and two passives.
4. Build persistence, Story/Arena application, and Story-script canonical-loadout safety.
5. Swap Economy and Fire Focus passive effects.
6. Eight optional Adventure Mission hooks with non-farmable first completion state.
7. Safe save export/import keys for build and Adventure progress.
8. Flow Cancel window, Energy cost, and Dash recovery cancel wiring.
9. Chapter 1 cliff jump-route and Object Swap mission hooks.
10. Chapter 2 tournament archetype variety and repeat-fight goals.
11. Chapter 3 investigation-quality goals.
12. Chapter 4 3v3 / 3v2 squad behavior, ally HP/roles, targeting, and mixed enemy archetypes.

## Chapter 4 ending regression inherited from 2.9A.39.2

The cumulative build continues to verify:

- Dedicated lookout landing camera framing.
- Elevated lookout grounding and platform clamping.
- Subtle delayed entrance guidance.
- Height/wind ambience.
- Deliberate collapse/fade timing.
- Ryuzankaro branch convergence.
- Mandatory summit pebble → CHARGE → RELEASE → LOCK → OBJECT SWAP.
- New `shadowArrival` completion evidence and old-save compatibility.

## Multi-fighter implementation note

Chapter 4 squad combat is intentionally implemented as a Story squad layer rather than a silent rewrite of the entire Arena engine. Rrvvfo and the selected target use the existing full Arena fighter simulation; Bark, Wade, and off-target enemies remain simultaneously active through squad actors with HP, movement, roles, attacks, targeting, support/healing, knockout state, and visual feedback. Target changes promote another living enemy into the full Arena opponent slot while preserving its squad state.
