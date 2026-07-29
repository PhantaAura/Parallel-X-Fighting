# Prototype 2.9A.5 — Unified Engine & Presentation Polish

This is a complete cumulative build based on Prototype 2.9A.4. No earlier ZIP is required.

## One shared Story runtime

Chapters 1, 2, and 3 now run through the same `StoryEngineSession` runtime controller.

The shared runtime owns:

- Arena startup and cleanup
- Story-mode input filtering
- CPU activation rules
- Dialogue lifecycle
- HUD modes
- Input-device prompt state
- Exploration, tutorial, combat, cinematic, and completion transitions
- Ability availability rules
- Story timer behavior
- Restoration of the normal Arena runtime when a chapter closes

Each chapter still owns its map, objectives, encounters, dialogue content, scripted cameras, and unique mechanics. Chapter code is adopted as a profile by the shared runtime instead of becoming a separate engine.

## Title and main-menu polish

- Added a short animated logo entrance.
- Added subtle energy sparks and a pulsing start prompt.
- Added the game’s elevator pitch to the start screen.
- Added quiet selection and confirmation feedback.
- Added existing-sprite and silhouette artwork to mode previews.
- Added stage-inspired preview scenes.
- Arcade now has a clear **Coming in Prototype 3.x** tooltip and error response.
- Preserved reduced-motion support.

## Branded loading flow

- Rebuilt the loading screen around the selected fighter and stage.
- Added Rrvvfo, Revvfo, and Sage loading poses from existing atlases.
- Added fighter accent colors.
- Replaced fake fixed percentages with task-derived progress for:
  - Fighter manifests
  - Sprite atlases
  - Stage and camera
  - Audio and input
  - Match rules
- Added a safe fallback when an atlas fails.
- Added retry and return behavior for genuine loading errors.

## The Sage’s Manual

The former combat manual is now a larger in-game guide with the Sage’s personality.

Added spoiler-safe public pages for:

- Getting started
- Modes
- Input devices
- Training drills
- Rrvvfo
- Revvfo
- Wade
- Bark
- The Sage
- Core terminology

Story-discovered pages remain locked until the player reaches the relevant content. Existing story page IDs were preserved so Chapter progress remains compatible.

## Training improvements

- Added Suggested Drills to Training Mode:
  - Perfect Parry Window
  - Launcher Air Route
  - Energy Discipline
  - Guard Pressure and Grab
  - Lens Prediction Read
- Applying a drill configures the dummy and useful Training settings automatically.
- The existing guided refresher remains the deeper Story tutorial.

## Combat presentation

- Added a louder Perfect Parry presentation with a sharp pulse and callout.
- Unified the event hook between 2D and Arena combat.
- Kept continuous first-to-three-KO flow; no repeated “ROUND X” interruption was added after each KO.
- Preserved reduced-shake and screen-flash settings.

## Audio

- Kept procedural impact and UI effects.
- Added original procedural music beds for:
  - Main menu
  - Dojo and Training
  - Tournament
  - General battle
- Added a victory stinger.
- Music begins only after browser audio permission is unlocked by player interaction.

## Honest roster presentation

Character select now labels each fighter as:

- Showcase
- Visual Prototype
- In Development

Unfinished fighters remain selectable, but the game no longer presents them as equally polished.

## Maintainability

- Added `css/design-tokens.css` for shared colors, spacing, radii, shadows, fonts, glows, and transitions.
- Added one final presentation stylesheet for the 2.9A.5 polish layer.
- Replaced the mixed active cache-busting strings with one release ID:
  - `29a5-unified-presentation-20260728`
- Expanded the existing browser smoke-test suite instead of creating a duplicate test system.
- Added loading failure cleanup so the Fight button cannot remain stuck on “Loading.”

## Validation

Completed locally:

- 67 JavaScript files passed `node --check`.
- All JSON files parsed successfully.
- All static JavaScript imports resolved.
- All local HTML references resolved.
- All CSS asset URLs resolved.
- Active source files use one cache identifier.
- The browser smoke suite passed **189 of 189 checks** through a route-backed test harness.
- Title, main menu, Arcade tooltip, Sage Manual, character-status badges, loading tasks, and fight startup were checked at **1440×900** and **844×390 landscape**.
- No unexpected page or console errors appeared in those audited UI flows.
- ZIP archive integrity was checked after packaging.

The automated environment cannot replace a complete human playthrough. Real WebGL performance, combat timing, music balance, physical-controller behavior, touch comfort, and full Chapter 1–3 completion still need the normal-browser friend test.
