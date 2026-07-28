# Parallels X Prototype 2.9A.1 — Story Mode Repair & Polish

This is a cumulative full build. It includes the complete Prototype 2.9A combat overhaul and does not require any older patch.

## Story stability and saves

- Story startup failures now show a usable WebGL error screen with Retry and Return controls instead of leaving a blank page.
- Escape no longer silently completes dialogue. It opens a skip confirmation first.
- Chapter exits and active-match restarts now require confirmation.
- Chapter 3 investigation state now reloads: inspected routes, questioned NPCs, the strange man, and the underground-base discovery are restored.
- Existing Chapter 1 completion repairs Combat Manual ownership automatically.
- The save schema now includes safe defaults for Story Level, Story XP, Chapter 2 state, and Chapter 3 preview state.

## Route menu

- Rrvvfo's route is structured as six planned chapters.
- Completing Chapters 1 and 2 displays 40%.
- The unfinished Chapter 3 preview does not count as a completed chapter.
- Bark and Wade are revealed Sonic Adventure-style after Rrvvfo encounters them, but remain locked until Rrvvfo's full route and their own content are complete.
- Other routes stay hidden until their characters are encountered.
- Decorative metadata chips no longer look interactive.
- Portrait mobile is blocked with a landscape prompt, while the landscape menu has a compact responsive layout.

## Story combat and tutorial

- Chapter 1's refresher now teaches timed guarding, perfect parries, grabs, manual energy charging, slower passive recovery, Shots of Agony's full-energy cost, and Lens of Truth's early cost and mastery behavior.
- The refresher no longer refills energy every frame, so the actual resource economy is demonstrated safely.
- Story Attack and Energy Control bonuses now use one shared progression system across the 3D Story chapters.
- Energy Control improves passive energy recovery and manual charge speed.
- The Living Road now uses continuous stock combat: only the defeated fighter respawns while the winner keeps health, energy, and position.
- Story rematches restart quickly at 0–0.

## Chapter 2 tournament

- Official bracket matches remain first to three KOs and include ring-outs.
- Practice, Bark sparring, and optional grunt encounters are one-KO fights with ring-outs disabled.
- The first official match unlocks a Tournament Rules manual page and includes new Rrvvfo dialogue explaining the edge rule.
- Replay fights grant no permanent Story XP, preventing infinite replay farming.
- Winning the Plouke beam clash now changes the finish: Rrvvfo wins the clash, Plouke immediately ring-outs him, and Rrvvfo receives bonus XP plus a guaranteed level-up.
- Fire Awakening now shows a visible countdown before the automatic anti-softlock fallback.
- Crowd movement is constrained to the tournament grounds.
- The incorrect Living Road subtitle has been removed from Chapter 2.

## Exploration and presentation

- The Living Road and Chapter 3 preview now include a compact minimap, a top objective direction indicator, and a full map opened from the side button.
- Exploration hides most fight-only HUD elements while preserving required field abilities.
- Chapter 3 waits for its area title before opening dialogue, reducing screen-layer clutter.
- Chapter 1 now uses consistent Sage naming in the HUD and a dialogue presentation matching later scenes.
- Cropped hotbars, tiny Story text, and short landscape layouts receive responsive fixes.
- All active Story build labels now display Prototype 2.9A.1.
- A favicon is included, removing the repeated missing-file request.

## Intentionally deferred

Most hub NPCs still use prototype block models. They remain functional and will be replaced when final character artwork or sprites are available.
