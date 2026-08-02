# Prototype 2.9A.40.4 — Buildings, Interiors & World Life

This cumulative pass turns the connected-world interior foundation from 2.9A.40.3 into real RPG spaces. Chapters 2–4 now use enterable buildings with solid exterior collision, local interior maps, persistent visit history, and state-aware NPC dialogue. Chapter 5 remains untouched.

## Real enterable buildings

- Tournament Medical Center — Chapters 2–3
- Tournament Administration — Chapters 2–3
- Fighter Backstage — Chapters 2–3
- Old Apothecary — Chapter 4
- West Echo Home — Chapter 4
- East Echo Home — Chapter 4

Entering a building now performs a real exterior → interior transition. Leaving through the front door returns the player to the correct world position and region map.

## Chapter 3 clinic repair

- The medical worker is physically inside the Tournament Medical Center instead of occupying an inaccessible building shell.
- The main medical lead, the required revisit, and the optional Medical Follow-Up all happen with the same worker inside the clinic.
- The clinic remains revisitable even when it is not the current objective.
- The optional follow-up no longer spawns a duplicate outdoor medical-worker marker.

## Solid building exteriors

The new buildings are not decorative cutouts. Runtime collision prevents Rrvvfo from walking through their walls. Door prompts sit at actual thresholds, while the interior uses separate room geometry.

## Echo Village interiors

- The Old Apothecary now has an herb room and old storage room.
- Two Echo homes can be entered and contain residents/fixtures.
- Background houses can remain closed; interacting with them gives a short Rrvvfo response such as “Eh. Door’s locked.” instead of exposing an empty fake interior.
- The old man was moved outside the new solid apothecary shell so he is never hidden inside collision geometry.

## Interior maps and persistence

- Story Map gains a true local-interior mode.
- Region/World tabs hide while viewing a building interior.
- Interior rooms, exits, and actors appear on the local map.
- Connected-world state remembers interior visits and door state using the existing save schema.
- Travel Journal can report how many interiors have been discovered.

## World-life dialogue

Interior NPC lines react to Story context: daytime tournament vs. after-hours investigation, Echo Village before/after defense, and the purpose of each building.

## Compatibility

- Cumulative build: no older ZIP required.
- Save schema: **268**.
- Chapter 5: **not added**.
- Existing Chapter 1–4 progression, field skills, builds, shortcuts, and Chapter 4 ending remain intact.

## Validation

- **442 / 442 browser smoke tests PASS**
- **95 / 95 game JS modules parse**
- **2 / 2 test modules parse**
- **293 / 293 relative imports resolve**
- **259 / 259 HTML IDs unique**
- **0 duplicate HTML IDs**
