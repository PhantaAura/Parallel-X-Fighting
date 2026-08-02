# Connected World Implementation Report — Prototype 2.9A.40.3

## What this patch changes

2.9A.40.3 is the architecture step of the pre-Chapter-5 roadmap. It makes exploration state persistent across the released route, introduces discovery-based regional/world maps, and opens the first legal nonlinear shortcuts without trying to fill every building/secret immediately.

## Gameplay/state files changed

- `js/story/connected-world.js` — new persistent region/zone/shortcut graph.
- `js/story/story-map.js` — Local / Region / World discovery views.
- `js/story/story-interiors.js` — new Door → Interior → Return registry and locked-door foundation for 40.4.
- `js/story/lost-year-data.js` — connected-world state added to existing progress and legacy normalization.
- `js/story/lost-year-story.js` — World Travel Journal on the route screen.
- `js/story/rrvvfo-road-hub.js` — Chapter 1 branch discovery and Cliff shortcut persistence.
- `js/story/rrvvfo-mission-2.js` — Tournament Region mapping/visits and permanent Wade shortcuts.
- `js/story/rrvvfo-chapter-3.js` — same Tournament Region after hours, then Resonance → Echo region handoff.
- `js/story/rrvvfo-chapter-4.js` — Echo Region mapping, Old Water Lift loop, skilled Old Apothecary Passage, and Cavern return discovery.
- `css/connected-world-29a403.css` — connected map/journal/discovery presentation.
- `index.html` — loads the new presentation layer and current release cache.

## Release/test files changed

- `js/build-info.js`
- `tests/smoke.js`
- `tests/smoke-bootstrap.js`
- `tests/smoke.html`
- `README.md`
- `FULL-CHAIN-MANIFEST.json`
- `BUILD-MANIFEST-2.9A.40.3.json`
- `VERIFICATION-2.9A.40.3.json`
- `PATCH-NOTES-2.9A.40.3.md`
- `VALIDATION-2.9A.40.3.md`
- `SMOKE-RESULTS-2.9A.40.3.txt`
- `FRIEND-PLAYTEST-CHECKLIST-2.9A.40.3.md`
- `CONNECTED-WORLD-REPORT-2.9A.40.3.md`
- `CONNECTED-WORLD-IMPLEMENTATION-REPORT-2.9A.40.3.md`

Other active modules only received the synchronized cache identifier required for a clean browser deployment; their gameplay logic is unchanged.

## Chapter geography

### Chapter 1

Tournament Road remains an opening adventure rather than a giant open map. Main Road / Forest / Cliff are recorded as real route knowledge and the Cliff cut can become a remembered permanent shortcut.

### Chapters 2–3

The Tournament is one region with recognizable districts. Chapter 3 reuses that geography after hours before moving underground into the Resonance region. This is intentionally the same place in a different Story state, not a duplicate “mystery map.”

### Chapter 4

Echo is the most interconnected released region. Central Village connects to residential, Resonance Wall, Water Channel, shrine/apothecary/upper routes, Cavern Approach, caves, foothills, mountain, summit, and the floating lookout.

The first skilled-player routes are real:

- **Old Water Lift** — Wade's Lightning Current creates a Water Channel ↔ Upper Ridge loop.
- **Old Apothecary Passage** — Precision Object Swap can create a faster legal route during the optional potion sequence.
- **Echo Cavern Return** — the repaired party route can remain useful when returning through the region.

## Maps

The same Story Map control now supports:

1. **LOCAL** — immediate gameplay positions.
2. **REGION** — stylized geography based on the region's actual layout/vibe.
3. **WORLD** — discovered major regions and the journey between them.

Map fog is knowledge-based rather than a literal dark overlay: discovered areas are named, adjacent unexplored areas may appear as `?`, and remote/secret locations stay absent until found. Permanent shortcuts appear only after activation.

## Save migration

`worldState` is added inside the existing Lost Year save. Completed mission IDs infer appropriate discovered geography for older saves. The save schema remains **268**.

## Interior status

40.3 deliberately does **not** pretend the clinic/houses are finished. It only establishes the registry and transition contract. 40.4 is where the medical worker can be placed in an actual enterable clinic and useful houses/shops/offices receive real interiors; unneeded buildings can use contextual locked-door responses.

## Chapter 5 preparation

No Chapter 5 scenes, bases, enemies, or stealth content are added here. The architecture leaves room for the planned Chapter 5 loop: Lookout → descent → broad regional search → hidden field-base entrances/interiors → return through the world → summit/Object Swap → Lookout. The hidden Project Hollow cloning headquarters remains outside the player-accessible map model.

## Validation

- Browser smoke: **431 / 431 PASS**
- Game JS: **95 / 95 parse**
- Test JS: **2 / 2 parse**
- Relative imports: **290 / 290 resolve**
- JSON/manifests after release metadata: **53 / 53 parse**
- HTML IDs: **259 unique / 0 duplicates**
- Save schema: **268**
