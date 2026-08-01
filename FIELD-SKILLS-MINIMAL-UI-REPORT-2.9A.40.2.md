# 2.9A.40.2 Field Skills & Minimal UI — Implementation Report

## Why this patch exists

The game had accumulated strong systems, but normal exploration still felt more like navigating an interface than inhabiting an RPG world. This pass reduces persistent HUD pressure and makes important techniques something the player remembers learning through play.

## 1. Minimal UI

`css/field-minimal-29a402.css` is loaded after the older presentation layers so it can deliberately reduce field clutter without deleting the underlying systems.

During Story exploration it:
- compacts the current objective;
- hides secondary objective detail;
- hides attack strips;
- suppresses the Arena hotbar/bottom panel when the Story engine is in exploration mode;
- keeps detailed records in pause/Story menus;
- restores combat information during combat.

No combat values or mechanics are removed by the CSS.

## 2. Field-skill state

`js/story/field-skills.js` owns `pxFieldSkillsV1`.

The state records:
- mastered field skills;
- mastery cards already seen;
- trial attempt counts;
- last mastered skill.

It is tolerant of malformed/unknown IDs and does not require a save-schema bump.

## 3. Chapter 1 Object Swap learning

`rrvvfo-mission-0.js` keeps the existing mission ID `rrvvfo-00` for save/route compatibility, but the old Shots training content is replaced by a three-anchor Object Swap field trial.

The trial uses the existing Story Arena, hotbar slot, effects, controls, and Object Swap concept rather than creating a separate movement system.

`rrvvfo-road-hub.js` then reinforces the technique with a three-point swap relay. This makes the first chapter's gimmick—movement/platforming/route choice—part of progression instead of only presentation.

## 4. Shots of Agony continuity

Story availability is data-driven through `STORY_TECHNIQUE_RULES`.

For Chapters 1–4:
- early Story loadouts filter `shotsOfAgony`;
- Story hotbar status marks the slot unavailable;
- scripted field/tutorial sequences cannot invoke it;
- Story-facing manual/HUD copy does not spoil the name.

Non-Story modes intentionally keep the complete Rrvvfo kit.

The future rule requires the explicit `shotsOfAgonyPrototype` unlock. Chapter 5 can later award that flag at the actual invention scene.

## 5. Party field skills

Chapter 4's existing Bark/Wade/Rrvvfo cavern-route actions now produce lasting field-skill mastery entries rather than being disposable one-off QTEs.

This preserves the user's desired Chapter 4 identity:
- party combat and party field interaction first;
- solo mountain play after Bark and Wade stay behind.

## 6. Feedback polish

`arena-mode.js` now exposes:
- a short Flow Cancel readiness cue after a connected melee hit;
- passive feedback for Parry Spark;
- passive feedback for Pursuit Battery.

The goal is to make the systems readable without putting permanent labels on screen.

## 7. Compatibility safeguards

- Save schema: **268**
- Retired Chapter 1 Shots checkpoints migrate to `lensCharge`.
- Current build/custom build data remains compatible.
- Scripted Story traversal still uses required canonical technique slots.
- No Chapter 5 scene or Story event is authored here.
