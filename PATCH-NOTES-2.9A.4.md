# Parallels X Prototype 2.9A.4 — Story Playtest Polish

Prototype 2.9A.4 is a complete cumulative build. It includes the 2.9A combat overhaul and all Story repairs through 2.9A.3; no earlier ZIP is required.

## Shared Story foundation

- Chapters 1, 2, and 3 now use the same Story Engine session for dialogue lifecycle, input-mode filtering, HUD states, active-input prompts, progression application, labels, cleanup, and transitions between dialogue, exploration, tutorials, combat, cinematics, and completion.
- Chapter scripts still own their unique maps, objectives, encounters, cameras, and scripted sequences instead of duplicating the shared rules.
- Dialogue overlays are destroyed after completion, so old conversations no longer remain over manuals, fights, or exploration.
- Leaving, restarting, or changing chapters cleans up the shared dialogue and Story state.

## Guided Combat Manual refresher

The Chapter 1 refresher is now an eight-step guided lesson:

1. Move, jump, and dash.
2. Start each basic attack animation.
3. Land a real perfect parry.
4. Stand still and charge to 75 energy.
5. Use Fire Blast and Object Swap.
6. Charge fully and use Shots of Agony.
7. Activate Lens of Truth and successfully react to its prediction.
8. Land three clean, unblocked hits on the Sage.

Each step provides a large current-task card, exact controls for the last active device, a checklist, live values, progress feedback, timing prompts, and an inactivity reminder. Completion is based on confirmed gameplay states rather than raw button presses.

Abilities are revealed only when needed. Locked slots are dimmed, labeled **LEARN LATER**, removed from keyboard focus, marked unavailable for assistive technology, and rejected by combat logic until their lesson begins. The tutorial hides stock scores, timer information, unrelated resources, excess control help, and unused hotbar elements.

## Mobile and presentation

- Story Mode remains landscape-first.
- The landscape main menu now uses separate navigation and preview columns, preventing the preview art from blocking mode buttons.
- The Story route screen uses a compact horizontal route/chapter layout on short landscape displays.
- Long route descriptions open in a dedicated full-screen Details view instead of creating a second nested scroll area.
- Legacy touch-onboarding overlays are suppressed while the Story route interface is open, preventing them from reappearing over Story Mode.
- Decorative Story labels were restyled as section headings rather than fake buttons.
- Current build labels and Extras text now consistently identify Prototype 2.9A.4 / Combat 2.9A.

## Validation performed

- JavaScript syntax validation across the full `js` directory.
- JSON parsing for every JSON file.
- Static checking of local HTML resources and JavaScript imports.
- Automated UI smoke tests at 1440×900, 1280×720, and 844×390 landscape-mobile sizes.
- Dialogue completion/manual transition, tutorial HUD states, progressive hotbar locking, mobile menu hit testing, Story route opening, route Details modal, and chapter carousel behavior were checked.
- Archive integrity testing after packaging.

The automated browser used a renderer stub because full WebGL execution is restricted in the test environment. Final combat feel, timing, real rendering, and complete chapter playthroughs still require a normal browser playtest.
