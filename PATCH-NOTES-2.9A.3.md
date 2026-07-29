# Parallels X Prototype 2.9A.4

## Unified Story Engine and Guided Tutorial

This is a complete cumulative build. It contains every feature and fix from Prototype 2.9A.2 and does not require an earlier patch.

## Shared Chapter Engine

Chapters 1, 2, and 3 now launch through the same Story Engine layer instead of separately constructing and cleaning up their own ArenaBattle sessions.

The shared layer now owns:

- Story battle creation and cleanup
- Story-mode labels and build information
- Story progression stat application
- Dialogue presentation
- Input modes for dialogue, exploration, tutorials, combat, cinematics, and completion screens
- HUD mode classes used by every chapter
- Fighter-name setup and common arena startup rules

Chapter-specific maps, encounters, objectives, and scripted camera moments remain separate data and scripting because their content is different, but they now run on the same underlying combat, movement, dialogue, HUD, save, and control foundation.

## Guided Combat Refresher

Chapter 1's Combat Manual tutorial is now an eight-step guided lesson:

1. Move, jump, and dash
2. Light attack, heavy attack, launcher, and grab
3. Perfect parry
4. Manual energy charging
5. Fire Blast and Object Swap
6. Full-energy Shots of Agony
7. Lens of Truth prediction and reaction
8. Three-hit final spar

Every step now includes:

- A large `DO THIS NOW` card
- The exact controls from the player's selected control layout
- A live checklist
- A visible progress bar
- Current energy or hit-count values when relevant
- Hotbar highlighting for required abilities
- `BLOCK NOW` and `REACT NOW` timing prompts
- A reminder after several seconds without progress
- Automatic movement to the next lesson when all requirements are complete

## Tutorial Bugs Fixed

- Fixed a duplicated phase condition that prevented the tutorial from recognizing manual energy charging.
- Fixed the Lens lesson attempting to start the final spar from the wrong phase.
- Fixed restarting the arena without resetting tutorial flags, objectives, overlays, and fighter resources.
- Fixed clean-hit counting so blocked hits do not complete the final lesson.
- Standardized Chapter 1 Part 1 dialogue with the dialogue system used by later chapters.
- Locked non-fight Road transition and KO states so combat input cannot leak through between rounds.

## Validation

- 67 JavaScript files passed syntax validation.
- All local JavaScript imports were checked for missing files.
- All local `index.html` references were checked.
- All JSON files parsed successfully.
- The final ZIP passed archive integrity testing.

## Known Development Items

- Chapter 3 remains a development preview rather than a finished chapter.
- Several Chapter 2 and Chapter 3 NPCs still use placeholder models.
- Each chapter intentionally retains its own map, encounters, scripted objectives, and special camera sequences even though the underlying engine is shared.
