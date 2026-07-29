# Parallels X Prototype 2.9A.9
## Story RPG & Menu Pass

Prototype 2.9A.9 is a complete cumulative build. It focuses on the main menu and Rrvvfo’s playable Story Chapters 1–3 while preserving the Kinetic Combat systems from 2.9A.8.

## Main menu

- Rebuilt the mode layout into clearly labeled **Play** and **System** groups.
- All nine current menu entries remain visible without relying on hidden horizontal scrolling.
- Added responsive desktop, laptop, and landscape-mobile arrangements.
- Reworded menu descriptions around what the player experiences rather than internal engine terminology.
- Confirm and Back prompts now follow the active keyboard, mouse, controller, custom mapping, or touch device.
- Story presentation only describes Rrvvfo’s released Chapters 1–3 content.

## Faster Story flow

- Selecting Rrvvfo begins or continues the next unfinished Story section immediately.
- A normal first-time playthrough now chains automatically:
  1. No Maximums
  2. Back in Fighting Shape
  3. Road to the Tournament
  4. Definitely Not the World Tournament
  5. Chapter 3 investigation demo
- The route menu no longer interrupts the normal sequence between completed sections.
- Chapter Select remains available for replays and returning to a specific released section.
- After Chapter 2, the primary action becomes **Begin Chapter 3 Demo** rather than incorrectly declaring the current Story finished.
- Route progress measures only the currently playable Chapters 1–3 material.

## RPG growth

Rrvvfo now has persistent Story levels and five visible attributes:

- **HP** — maximum health
- **Power** — attack strength
- **Defense** — damage resistance
- **Speed** — movement and combat mobility
- **Focus** — energy control and technique efficiency

Level-ups present the old and new values in a dedicated RPG results panel. The player menu shows the current level, XP, stats, objective, and Shot / Power / Trick technique signs.

Chapter 2 opponents scale from Rrvvfo’s current level:

- Practice and ordinary opponents match the player’s level.
- Later bracket opponents and Wade receive a small level advantage.
- Plouke receives a larger level advantage and a clearly presented boss-health bonus.

The scaling is visible and deliberate instead of secretly giving every opponent inflated health.

## Chapter 1 tutorial improvements

- The Sage dodge lesson now displays a visible direct-attack counter from **0 / 3**.
- Fixed the Lens lesson so every instruction correctly says to charge to **60 Energy**.
- Added Guided Tutorial, Resume Checkpoint, and Quick Refresher paths.
- Tutorial checkpoints save after major groups instead of forcing the entire refresher after an interruption.
- Grab completes only after confirmed contact.
- The checklist emphasizes current tasks and collapses completed material to reduce HUD overload.
- Controls and prompts update to the active device.

## Road and living-hub improvements

- The road no longer forces maximum Energy during exploration.
- Added ambient birds, moving carts, residents, notices, optional conversations, and more activity between required gates.
- Optional roadside-fight defeats now offer Retry, Leave Encounter, or Return to Story Menu.
- The Story menu, Sage Manual, objective tracker, and Interact action use one consistent control language.
- Exploration prompts follow the active input device.

## Chapter 2 tournament improvements

- Added a compact RPG combat header with Shot / Power / Trick signs.
- Added an RPG Story menu showing stats, XP, objective, current techniques, and device-aware controls.
- Added a dedicated objective tracker.
- Kept the Run command in every fight:
  - Optional fights allow Rrvvfo to leave.
  - Official tournament fights trigger Rrvvfo’s refusal because he will not forfeit.
- Reworded the final objective to **Try to Beat Plouke**.
- Removed developer-facing “scripted final” language from the fight and clash presentation.
- After repeated tournament losses, **Story Assist** becomes available without changing the narrative outcome.
- Story Assist improves survivability and reduces opponent pressure while keeping the match playable.
- Added more crowd movement and ambient hub activity.
- Consolidated full-screen interruptions into a more consistent RPG-style Story presentation.

## Chapter 3 investigation demo improvements

- Clearly labels the current section as a **Chapter 3 Demo**, not the complete chapter.
- Added a visible chapter-title transition before control begins.
- The objective marker dynamically points toward the nearest missing required lead.
- After three required witness conversations, remaining witnesses are labeled optional.
- The tracker separates required and optional investigation progress.
- The combat hotbar is hidden during investigation.
- Attempting a technique explains that abilities are unavailable while investigating instead of silently ignoring the input.
- Added moving residents, birds, a passing cart, and ambient notices to make the region feel inhabited.
- Replaced development-note ending text with a story cliffhanger and **Chapter 3 Demo Complete**.

## Unified Story controls

- **Escape / controller Menu:** Pause and Story menu
- **M:** Sage’s Manual
- **T:** Objective tracker
- **E:** Interact

Touch interfaces expose equivalent visible actions.

## Presentation and maintainability

- Added shared Story RPG UI helpers for stat panels, attack-category signs, control legends, and device-aware labels.
- Consolidated the new menu, route, RPG, level-up, and Chapter 3 demo styling into the active unified interface stylesheet.
- Removed unreleased Story-route descriptions from the playable build data and player-facing interface.
- Updated build and cache identifiers to `Prototype 2.9A.9 — Story RPG & Menu Pass` and `29a9-story-rpg-20260729`.

## Validation completed

- 69 game JavaScript files passed `node --check`.
- Test JavaScript passed syntax validation.
- 11 JSON files parsed successfully.
- 10 local HTML references were checked with none missing.
- 9 local CSS references were checked with none missing.
- 172 JavaScript import references were checked with none missing.
- 258 HTML IDs were checked with no duplicates.
- Browser smoke suite passed **203 / 203** checks in the route-backed Chromium harness.
- Desktop and landscape-mobile main-menu and Story-route layouts were visually audited.

## Human testing still required

The automated environment cannot provide a trustworthy full WebGL Story playthrough or physical-controller feel test. A real browser playtest is still required for chapter pacing, camera comfort, combat difficulty, touch comfort, controller behavior, and the complete automatic Story chain.
