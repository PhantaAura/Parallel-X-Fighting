# Buildings, Interiors & World Life — Implementation Report

## Goal

2.9A.40.3 introduced a persistent connected world and an interior registry. 2.9A.40.4 turns that architecture into playable RPG buildings instead of fake holes or inaccessible shells.

## Building framework

`js/story/story-interiors.js` now defines six released interiors with exterior footprints, entry/return spawns, room bounds, fixtures, actors, palettes, collision helpers, local-map points, and contextual NPC/locked-door dialogue.

The exterior and interior are intentionally separate spaces. A building can be a solid object in the hub while its usable door transitions the player into a compact room layout. This is the structure intended for later clinics, shops, homes, offices, and Chapter 5 field-base interiors.

## Chapter 2

The tournament region now supports three actual interiors: Tournament Administration, Medical Center, and Fighter Backstage. They use the same geography that Chapter 3 revisits after hours, strengthening the idea that Chapters 2 and 3 occupy the same place at different times.

## Chapter 3

The Tournament Medical Center is the main continuity repair. The medical worker is now genuinely inside the clinic. The required medical lead, required revisit, and optional Medical Follow-Up all route through that same NPC. The follow-up no longer creates an outdoor duplicate marker, and completing it inside the clinic keeps the player inside instead of snapping back to hub mode.

Tournament Administration and Fighter Backstage are also enterable during the investigation, allowing familiar Chapter 2 locations to be revisited at night.

## Chapter 4

Echo Village gains a solid Old Apothecary and two enterable homes. Two additional house/storefront doors remain intentionally locked and use short character responses rather than pretending every background building contains content.

The old man was moved outside the apothecary collision footprint. This avoids the exact failure mode where a visible NPC exists inside an exterior the player cannot enter.

## Maps

`StoryMap` now has a true local-area mode. Entering an interior replaces the region view with a local room map; Region and World tabs are hidden until the player exits. Small interiors therefore read as actual places without pretending they are separate world regions.

## Persistence

Connected-world version 2 adds:

- `interiors`
- `interiorVisitCounts`
- `doorStates`

These are normalized into existing saves under schema 268. No schema bump is required.

## Runtime collision

Custom building art is not automatically part of arena/stage scenery collision. 2.9A.40.4 therefore adds explicit exterior rectangle collision for registered buildings and background structures. The clinic, backstage annex, apothecary, homes, and locked Echo structures cannot simply be walked through.

## Major gameplay files changed

- `js/story/story-interiors.js`
- `js/story/connected-world.js`
- `js/story/story-map.js`
- `js/story/rrvvfo-mission-2.js`
- `js/story/rrvvfo-chapter-3.js`
- `js/story/rrvvfo-chapter-4.js`
- `js/story/hub-landmark-art.js`
- `css/buildings-interiors-29a404.css`

Build/cache synchronization also touches active imports and test/release files without changing their gameplay behavior.

## Intentionally deferred

This is not yet the World Delight pass. It does not attempt to make every house enterable, fill every room with a quest, or rewrite Chapter 1–4 objectives. 2.9A.40.5 will use these spaces for secrets, world events, alternate routes, and exploration rewards. A dedicated later Quest & Objective Overhaul can then replace weak fetch quests using the finished world rather than rewriting them twice.
