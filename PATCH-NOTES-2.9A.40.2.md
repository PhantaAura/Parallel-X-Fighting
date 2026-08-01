# Prototype 2.9A.40.2 — Field Skills & Minimal UI

## Focus

Make Chapters 1–4 feel cleaner and more like an RPG world to play in, not a dashboard of systems.

This patch keeps the 2.9A.40/40.1 Core Fun work and changes how Story exploration, technique learning, and early Rrvvfo progression are presented.

## Minimal contextual Story UI

- Exploration keeps a compact objective breadcrumb instead of a large permanent objective panel.
- Detailed attack strips and Arena hotbar clutter are hidden during Story exploration.
- Combat expands the combat HUD only when it becomes relevant.
- Chapter 4 party status stays tied to active squad encounters.
- Field-skill details live in Story menus rather than occupying the playfield.
- Flow Cancel now has a small visual/audio readiness cue instead of relying on patch notes.

## Field skills learned by doing

A new persistent field-skill system tracks techniques the player actually learns through gameplay.

Current field skills:
- Rrvvfo — **Object Swap • Field Control**
- Rrvvfo — **Object Swap • Precision Lock**
- Bark — **Earth Stabilize**
- Wade — **Lightning Current**
- Rrvvfo — **Vibration Sense**

Story menus now include a compact **FIELD TECHNIQUES • LEARNED BY DOING** journal.

## Chapter 1 progression rewrite

The old early Shots of Agony lesson is removed from Story.

Chapter 1 now opens with a playable three-anchor Object Swap field trial:
1. Read the glowing anchor.
2. Use the existing Object Swap input.
3. Swap to all three anchors.
4. Master **Object Swap • Field Control**.

Tournament Road later reinforces that lesson with a three-point Object Swap relay and awards **Precision Lock** mastery.

The rest of Chapter 1's Story chain, Combat Manual, Lens lesson, road routes, transport rescue, platforming, and fights remain intact.

## Shots of Agony progression

- **Shots of Agony is unavailable in Chapters 1–4 Story.**
- Early Story builds cannot equip it.
- Story-facing UI calls the future slot **UNKNOWN TECHNIQUE** and does not reveal the move name.
- Non-Story modes keep the full current Rrvvfo moveset.
- Chapter 5 is reserved for the future **Shots of Agony — Prototype** invention/unlock.
- The Chapter 5 unlock itself is **not implemented in this patch**.
- The move remains locked until the future `shotsOfAgonyPrototype` Story unlock is actually granted; merely entering Chapter 5 will not auto-unlock it.

## Chapter 4 field progression

The existing three-person cavern-route sequence now records field mastery:
- Bark stabilizes the damaged route → **Earth Stabilize**
- Wade powers the Echo mechanism → **Lightning Current**
- Rrvvfo completes the Object Swap support route → **Precision Lock**
- Vibration Sense mastery is recorded when that Story reward is earned

The 3v3/3v2 squad combat and solo mountain contrast remain unchanged.

## Build and combat readability polish

- Story-safe builds automatically replace unavailable future techniques with current usable techniques.
- Scripted Story traversal still temporarily uses canonical required abilities, so custom builds cannot break puzzles.
- Flow Cancel readiness gets a subtle `FLOW` cue plus sound.
- Parry Spark and Pursuit Battery now emit visible combat feedback when their passive bonus triggers.
- Build changes still give a brief equipped confirmation and then disappear.

## Compatibility

- Save schema remains **268**.
- Existing Chapter 1 tutorial saves at retired `shotsCharge` / `shotsReady` checkpoints migrate forward to the Lens step.
- Old Story progress, chapter completion, builds, mastery, and Adventure Mission records are preserved.
- No Chapter 5 Story content is added.
