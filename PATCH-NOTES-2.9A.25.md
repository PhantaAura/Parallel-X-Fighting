# Prototype 2.9A.25 — Feel, Team Combat & Collision Repair

## Results and progression

- Chapter 2 results read `chapter2State.hubQuests.optional`.
- Chapter 3 results read `chapter3State.optional`.
- Native chapter-complete overlays feed one shared ranked results screen instead of stacking two screens.
- Results track the current run's elapsed time, Story fights, XP, optional progress, route progress, and unlocks.
- Optional permanent stat bonuses now use diminishing returns after healthy soft caps; saved rewards are not deleted.

## Menus, settings, and camera

- The secret ↑ ↑ ↓ ↓ ← → ← → B A code is accepted only on the Story route screen.
- Unsupported graphics/accessibility controls are hidden until their systems exist.
- Voice Volume remains visible but disabled and labeled for future voice acting.
- Reset Hub Camera is available in Gameplay settings.
- Right-stick and drag look stop while a modal, dialogue, map, or paused Story menu is open.
- Camera obstruction checks include boxes, cylinders, cones, and roof primitives.

## Hub collision

- Exploration fighters are pushed out of solid hub scenery instead of crossing walls.
- Collision includes stage boxes, columns, trees, cones, and explicit non-rendered structure colliders.
- Echo Village's handcrafted houses and major structures have dedicated collision shapes.
- Chapter 4 spawn and return positions were moved to verified clear locations.

## Chapter 3 pacing

- The three ring-support evidence checks are consolidated into one evidence sweep after the first discovery.
- The five Plouke-bag plaza leads are consolidated into one evidence-board cross-check.
- Existing Strange Man, medical-worker, hat, facility, fights, teleporter, and Echo Region continuity remains unchanged.

## Chapter 4 teamwork

- Beacon repairs and elemental doors now use role-specific Rrvvfo/Bark/Wade input sequences.
- Echo Village defense is a three-wave fight.
- Bark and Wade appear in the arena, reposition near Rrvvfo, attack enemies, stun targets, and assist between waves.
- Rootstone and Triad Seed can trigger optional three-wave Project Hollow swarm battles.
- Cleared swarms persist in Chapter 4 state.
- A shortcut beside the potion building sends the player directly back toward Rootstone.

## Hollow Watcher and audio

- Hollow Watcher analyzes move, timing, spacing, approach direction, and alternating two-action routes.
- Changing the complete combat route breaks its confidence faster than simply alternating two powerful attacks.
- Procedural music cycles through six phrase types, including quiet and ambient passages with rotated melodic starts.
